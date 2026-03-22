import React, { useState, useRef, useEffect } from "react";
import appLogo from "./assets/app_logo.png";
import { Camera } from "react-camera-pro";
import { analyzeImage } from "./lib/gemini";
import { speakAdvice } from "./lib/elevenlabs";
import { db, auth } from "./lib/firebase"; // Your local config
import { collection, addDoc, query, orderBy, onSnapshot, limit, deleteDoc, doc, where } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth"; // The official library
import Auth from "./components/Auth";

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const camera = useRef(null);
  
  // States
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState("AWAITING DATA...");
  const [flash, setFlash] = useState(false);
  const [history, setHistory] = useState([]); 
  const [iso, setIso] = useState(400);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Visual filter logic
  const minIso = 100;
  const maxIso = 1600;
  const brightnessFilter = 0.5 + ((iso - minIso) / (maxIso - minIso)) * 1.5;

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Firebase Syncing (Private Feed)
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "captures"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"), 
      limit(10)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const remoteData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(remoteData);
    });
    return () => unsubscribe(); 
  }, [user]);

  // 3. Passive AI Scan
  useEffect(() => {
    if (!user || loading || sidebarOpen) return;
    const passiveScan = setInterval(async () => {
        const result = await analyzeImage(null); 
        setAdvice(result.advice);
    }, 4000);
    return () => clearInterval(passiveScan);
  }, [loading, sidebarOpen, user]);

  // 4. Actions
  const handleCapture = async () => {
    if (loading || !camera.current || !user) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    const photo = camera.current.takePhoto();
    setLoading(true);
    setAdvice("UPLOADING TO CORE...");

    try {
      const result = await analyzeImage(photo);
      const cleanFeedback = result.advice.toUpperCase();
      setAdvice(cleanFeedback);
      
      await addDoc(collection(db, "captures"), {
        image: photo,
        text: cleanFeedback,
        userId: user.uid,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  const handleDeleteImage = async (id) => {
    try {
      await deleteDoc(doc(db, "captures", id));
    } catch (err) {
      alert("Failed to delete image.");
    }
  };

  // --- GATEKEEPERS ---
  if (checkingAuth) return (
    <div className="h-screen bg-black flex items-center justify-center text-cyan-500 font-mono animate-pulse">
      SYNCING_ID...
    </div>
  );

  if (!user) return <Auth />;

  // --- MAIN RENDER ---
  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden font-mono text-white">
      
      {/* Camera Feed */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-300"
        style={{ filter: `brightness(${brightnessFilter}) contrast(1.2) saturate(1.1) sepia(0.2)` }}
      >
        <Camera ref={camera} aspectRatio="cover" videoSource={{ width: 640, height: 480 }} />
      </div>

      {flash && <div className="absolute inset-0 z-50 bg-white/20 pointer-events-none" />}

      {/* HUD Frame */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none z-10">
        {[...Array(9)].map((_, i) => <div key={i} className="border border-cyan-500/80" />)}
      </div>

      <div className="absolute inset-0 z-20 pointer-events-none border-[20px] border-black/40">
        {/* ISO Control */}
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

        {/* Status Bar */}
        <div className="absolute top-10 left-10 right-10 flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-2">
            <img src={appLogo} alt="Logo" className="h-6 w-auto max-w-[40px]" />
            <span className="text-pink-500 text-lg font-black tracking-wide">Picto Pal</span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="group flex flex-col items-end gap-[7px]">
            <div className="w-7 h-[1.5px] bg-cyan-800 group-hover:bg-cyan-400 transition-colors" />
            <div className="w-7 h-[1.5px] bg-cyan-800 group-hover:bg-cyan-400 transition-colors" />
            <div className="w-7 h-[1.5px] bg-cyan-800 group-hover:bg-cyan-400 transition-colors" />
          </button>
        </div>

        {/* AI Feedback */}
        <div className="absolute top-1/3 left-12 max-w-sm pointer-events-auto animate-pulse-slow">
          <div className="bg-black/80 backdrop-blur-lg p-5 border-l-4 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <h2 className="text-xl font-black italic uppercase leading-tight tracking-tight italic text-cyan-400">
              "{advice}"
            </h2>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-80 bg-black/90 z-50 border-l border-cyan-500/30 flex flex-col animate-slide-in">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
              <span className="text-pink-500 font-black text-lg tracking-[0.3em] uppercase">Pictures</span>
              <button onClick={() => setSidebarOpen(false)} className="text-white/50 hover:text-pink-500 text-2xl">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
              {history.map((item) => (
                <div key={item.id} className="group relative border border-white/5 bg-zinc-900/30 p-1.5 hover:border-cyan-500/50 transition-all" onClick={() => setSelectedImage(item)}>
                  <button onClick={e => { e.stopPropagation(); handleDeleteImage(item.id); }} className="absolute top-1 right-1 z-10 text-white/60 hover:text-pink-500 bg-black/60 rounded-full w-6 h-6 flex items-center justify-center">&times;</button>
                  <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                  <div className="p-3">
                    <p className="text-[11px] text-white/50 italic group-hover:text-cyan-100 italic">"{item.text}"</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Logout Button */}
            <div className="p-6 border-t border-white/10">
              <button 
                onClick={() => signOut(auth)} 
                className="w-full bg-pink-600 text-black font-black py-2 hover:bg-white transition-colors uppercase text-xs"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Capture Button */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <button 
          onClick={handleCapture}
          disabled={loading}
          className={`relative group px-16 py-6 bg-transparent border-2 font-black tracking-[0.8em] uppercase text-[10px] transition-all ${
            loading ? 'border-zinc-800 text-zinc-800' : 'border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-black hover:shadow-[0_0_50px_rgba(236,72,153,0.5)]'
          }`}
        >
          {loading ? "Processing..." : "Capture"}
        </button>
      </div>

      {/* Enlarged Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedImage(null)}>
           <img src={selectedImage.image} className="max-w-full max-h-[80vh] border-2 border-cyan-500 shadow-2xl" />
        </div>
      )}
    </div>
  );
};

export default App;