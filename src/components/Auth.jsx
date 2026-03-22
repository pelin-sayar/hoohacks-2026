import React, { useState } from "react";
import { auth } from "../lib/firebase"; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,      // <--- ADD THIS
  GoogleAuthProvider     // <--- ADD THIS
} from "firebase/auth";

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      handleAuthErrors(err);
    }
  };

  // --- GOOGLE SIGN IN LOGIC ---
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setError("");
    try {
      await signInWithPopup(auth, provider);
      // App.jsx will automatically detect the user and redirect
    } catch (err) {
      setError("GOOGLE_LINK_FAILED: " + err.message);
    }
  };

  const handleAuthErrors = (err) => {
    if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
      setError("Incorrect email or password, please try again.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must contain at least 6 characters.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("USER ALREADY REGISTERED, PLEASE LOG IN.");
    } else {
      setError(err.message.toUpperCase());
    }
  };

  return (
    <div className="h-screen bg-black flex items-center justify-center font-mono p-4">
      <div className="border-2 border-cyan-500 p-8 w-full max-w-md bg-zinc-900/50 backdrop-blur-md relative">
        
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500" />
        
        {error && (
          <div className="mb-4 text-pink-500 text-[10px] font-bold text-center animate-pulse">! {error}</div>
        )}

        <h1 className="text-cyan-500 text-xl mb-6 font-black tracking-widest uppercase italic">
          {isLogin ? ">> LOGIN" : ">> REGISTER"}
        </h1>

        <form onSubmit={handleSubmit}>
          <input 
            type="email" placeholder="EMAIL_ADDRESS" 
            className="w-full bg-black border border-zinc-700 p-3 mb-4 text-white focus:border-cyan-500 outline-none text-sm placeholder:text-zinc-600"
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="PASSWORD" 
            className="w-full bg-black border border-zinc-700 p-3 mb-6 text-white focus:border-cyan-500 outline-none text-sm placeholder:text-zinc-600"
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button className="w-full bg-cyan-600 text-black font-black p-3 hover:bg-cyan-400 transition-colors uppercase tracking-widest text-sm">
            {isLogin ? "LOGIN" : "REGISTER"}
          </button>
        </form>

        {/* --- GOOGLE BUTTON --- */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-[1px] bg-zinc-800 flex-1" />
              <span className="text-sm text-zinc-600 font-bold">OR</span>
            <div className="h-[1px] bg-zinc-800 flex-1" />
          </div>

          <button 
            onClick={handleGoogleSignIn}
            className="w-full border border-pink-500/50 text-pink-500 font-bold p-3 hover:bg-pink-500/10 transition-all flex items-center justify-center gap-3 text-xs tracking-widest"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 grayscale contrast-125" alt="" />
            SIGN IN WITH GOOGLE
          </button>
        </div>

        <p 
          className="text-zinc-500 text-[9px] mt-8 cursor-pointer text-center hover:text-white transition-colors tracking-tighter"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "DON'T_HAVE_AN_ACCOUNT? REGISTER_USER" : "HAVE_AN_ACCOUNT? RETURN_TO_LOGIN"}
        </p>
      </div>
    </div>
  );
}