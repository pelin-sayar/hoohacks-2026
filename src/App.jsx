import React, { useState, useRef, useEffect } from "react";
import appLogo from "./assets/app_logo.png";
import { Camera } from "react-camera-pro";
import { analyzeImage } from "./lib/gemini";
import { speakAdvice } from "./lib/elevenlabs";
import { db } from "./lib/firebase"; 
import { collection, addDoc, query, orderBy, onSnapshot, limit, deleteDoc, doc } from "firebase/firestore";
  // Delete image from Firestore and sidebar
  const handleDeleteImage = async (id) => {
    try {
      await deleteDoc(doc(db, "captures", id));
    } catch (err) {
      alert("Failed to delete image.");
    }
  };

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const camera = useRef(null);
  
  // states
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState("AWAITING DATA...");
  const [lastAnalysis, setLastAnalysis] = useState("");
  const [flash, setFlash] = useState(false);
  const [history, setHistory] = useState([]); 
  const [iso, setIso] = useState(400);

  // Visual filter logic
  const minIso = 100;
  const maxIso = 1600;
  const brightnessFilter = 0.5 + ((iso - minIso) / (maxIso - minIso)) * 1.5;

  // firebase syncing
  useEffect(() => {
    //ordered by newest first
    const q = query(collection(db, "captures"), orderBy("createdAt", "desc"), limit(10));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const remoteData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(remoteData);
    });

    return () => unsubscribe(); 
  }, []);

  useEffect(() => {
  const passiveScan = setInterval(async () => {
    if (!loading && !sidebarOpen) {
      const result = await analyzeImage(null); 
      setAdvice(result.advice);
    }
  }, 4000); // updates text every 4 secs

  return () => clearInterval(passiveScan);
  }, [loading, sidebarOpen]);

  // capturing and saving pictures
  const handleCapture = async () => {
    if (loading || !camera.current) return;
    
    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    //slightly lower res photo to stay under the 1MB Firestore limit
    const photo = camera.current.takePhoto();

    setLoading(true);
    setAdvice("UPLOADING TO CORE...");

    try {
      const result = await analyzeImage(photo);
      const cleanFeedback = result.advice.toUpperCase();

      setAdvice(cleanFeedback);
      setLastAnalysis(new Date().toLocaleTimeString());
      
      await addDoc(collection(db, "captures"), {
        image: photo, //saving the image data as a string (base64)
        text: cleanFeedback,
        time: new Date().toLocaleTimeString(),
        createdAt: Date.now()
      });

      await speakAdvice(result.advice);
      
    } catch (err) {
      console.error("Capture Error:", err);
      setAdvice("SYNC_ERROR_RETRY");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden font-mono text-white">
      
      {/* camera feed */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-300"
        style={{ filter: `brightness(${brightnessFilter}) contrast(1.2) saturate(1.1) sepia(0.2)` }}
      >
        <Camera 
          ref={camera} 
          aspectRatio="cover" 
          videoSource={{ width: 640, height: 480 }} //keeping the size of the string small
        />
      </div>

      {/* shutter effect */}
      {flash && <div className="absolute inset-0 z-50 bg-white/20 pointer-events-none" />}

      {/* frame */}
            {/* grid lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none z-10">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-cyan-500/80"></div>
              ))}
            </div>
      <div className="absolute inset-0 z-20 pointer-events-none border-[20px] border-black/40">
        
        {/* iso control */}
        <div className={`absolute top-1/2 -translate-y-1/2 right-8 flex flex-col items-center gap-2 pointer-events-auto bg-black/80 p-2 border-l-2 border-cyan-400 backdrop-blur-md transition-opacity w-16 ${sidebarOpen ? 'opacity-0' : 'opacity-100'}`}>
          <input 
            type="range" min="100" max="1600" step="100" value={iso}
            onChange={(e) => setIso(parseInt(e.target.value))}
            className="h-32 cursor-pointer accent-cyan-400"
            style={{ WebkitAppearance: 'slider-vertical' }} 
          />
          <p className="text-white font-black text-xs mt-2">{iso}</p>
          <p className="text-cyan-400 text-lg font-extrabold uppercase mt-1">ISO</p>
        </div>

        {/* status bar */}
        <div className="absolute top-10 left-10 right-10 flex justify-between items-center pointer-events-auto">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <img src={appLogo} alt="App Logo" className="h-6 w-auto rounded shadow max-w-[40px]" />
              <span className="text-pink-500 text-lg font-black tracking-wide">Picto Pal</span>
            </div>
          </div>

        <button
          className="group flex flex-col items-end justify-center gap-[7px] mt-2 mr-2 focus:outline-none"
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen(true)}
          style={{ background: 'transparent', border: 'none', padding: 0}}
        >
        <div className="w-7 h-[1.5px] bg-cyan-800 rounded group-hover:bg-cyan-400 transition-colors duration-200" />
        <div className="w-7 h-[1.5px] bg-cyan-800 rounded group-hover:bg-cyan-400 transition-colors duration-200" />
        <div className="w-7 h-[1.5px] bg-cyan-800 rounded group-hover:bg-cyan-400 transition-colors duration-200" />
        </button>
        </div>

        {/* ai feedback */}
        <div className="absolute top-1/3 left-12 max-w-sm pointer-events-auto animate-pulse-slow">
          <div className="bg-black/80 backdrop-blur-lg p-5 border-l-4 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <h2 className="text-xl font-black italic uppercase leading-tight tracking-tight">
              "{advice}"
            </h2>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <>
          {/* background of the sidebar*/}
          <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
          
          {/* sidebar */}
          <div className="fixed top-0 right-0 h-full w-80 bg-black/90 z-50 border-l border-cyan-500/30 flex flex-col animate-slide-in shadow-[ -10px_0_30px_rgba(0,0,0,0.5)]">
            
            {/* sidebar header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
              <div className="flex flex-col">
                <span className="text-pink-500 font-black text-lg tracking-[0.3em] uppercase">Pictures</span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)} 
                className="text-white/50 hover:text-pink-500 transition-colors text-2xl font-light"
              >
                &times;
              </button>
            </div>
            
            {/* scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
              {history.length === 0 && null}
              
              {history.map((item) => (
                <div
                  key={item.id}
                  className="group relative border border-white/5 bg-zinc-900/30 p-1.5 hover:border-cyan-500/50 transition-all duration-500 hover:bg-zinc-900/60 cursor-pointer"
                  onClick={() => setSelectedImage(item)}
                >
                  {/* pic delete button */}
                  <button
                    className="absolute top-1 right-1 z-10 text-white/60 hover:text-pink-500 bg-black/60 rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold opacity-80 hover:opacity-100 transition-colors"
                    title="Delete image"
                    onClick={e => { e.stopPropagation(); handleDeleteImage(item.id); }}
                  >
                    &times;
                  </button>
                  <div className="relative overflow-hidden aspect-[4/3] border border-white/5">
                    <img 
                      src={item.image} 
                      alt="Capture" 
                      className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
                    />
                    {/* timestamp */}
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 text-[8px] text-cyan-400 font-bold border border-cyan-400/20 backdrop-blur-sm">
                      {item.time}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] leading-relaxed text-white/50 italic group-hover:text-cyan-100 transition-colors">
                      "{item.text}"
                    </p>
                  </div>
                  {/* decorative corner */}
                  <div className="absolute top-0 right-0 w-1 h-1 bg-cyan-500/0 group-hover:bg-cyan-500 transition-all" />
                </div>
              ))}
                  {/* enlarged image */}
                  {selectedImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
                      <div className="relative max-w-3xl w-full mx-4" onClick={e => e.stopPropagation()}>
                        <img src={selectedImage.image} alt="Enlarged" className="w-full h-auto rounded-lg shadow-2xl border-4 border-cyan-500" />
                        <button
                          className="absolute top-2 right-2 text-white text-3xl font-bold bg-black/60 rounded-full px-3 py-1 hover:bg-pink-500 hover:text-black transition-colors"
                          onClick={() => setSelectedImage(null)}
                          aria-label="Close enlarged image"
                        >
                          &times;
                        </button>
                        <div className="mt-4 text-center text-white text-lg font-semibold">{selectedImage.text}</div>
                      </div>
                    </div>
                  )}
            </div>
          </div>
        </>
      )}

      {/* capture button */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <button 
          onClick={handleCapture}
          disabled={loading}
          className={`relative group px-16 py-6 bg-transparent border-2 font-black tracking-[0.8em] uppercase text-[10px] transition-all duration-300 ${
            loading ? 'border-zinc-800 text-zinc-800' : 'border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-black hover:shadow-[0_0_50px_rgba(236,72,153,0.5)]'
          }`}
        >
          {loading ? "Processing..." : "Capture"}
          
          {/* corners of capture button */}
          {!loading && (
            <>
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-pink-500" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-pink-500" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default App;