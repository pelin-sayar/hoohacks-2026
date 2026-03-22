import React, { useState } from "react";
import { auth } from "../lib/firebase"; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,      
  GoogleAuthProvider,
  sendPasswordResetEmail // Fixed: Moved import to the top block
} from "firebase/auth";

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState(""); // State for success messages

  // --- PASSWORD RESET LOGIC ---
  const handlePasswordReset = async () => {
    setError("");
    setResetMessage("");
    if (!email) {
      setError("ENTER_EMAIL_FOR_RESET");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("RESET_LINK_SENT_CHECK_INBOX");
    } catch (err) {
      setError("RESET_FAILED: " + (err.message || ""));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResetMessage("");
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

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setError("");
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError("GOOGLE_LINK_FAILED: " + err.message);
    }
  };

  const handleAuthErrors = (err) => {
    if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
      setError("INCORRECT_ID_OR_ACCESS_KEY");
    } else if (err.code === "auth/weak-password") {
      setError("KEY_TOO_WEAK_MIN_6_CHARS");
    } else if (err.code === "auth/email-already-in-use") {
      setError("ID_ALREADY_REGISTERED_PLEASE_LOGIN");
    } else {
      setError(err.message.toUpperCase());
    }
  };

  return (
    <div className="h-screen bg-black flex items-center justify-center font-mono p-4">
      <div className="border-2 border-cyan-500 p-8 w-full max-w-md bg-zinc-900/50 backdrop-blur-md relative">
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500" />
        
        {error && (
          <div className="mb-4 text-pink-500 text-[10px] font-bold text-center animate-pulse tracking-widest">
            ! ERROR: {error}
          </div>
        )}
        
        {resetMessage && (
          <div className="mb-4 text-cyan-400 text-[10px] font-bold text-center tracking-widest">
            {resetMessage}
          </div>
        )}

        <h1 className="text-cyan-500 text-xl mb-6 font-black tracking-widest uppercase italic">
          {isLogin ? ">> LOGIN" : ">> REGISTER"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" placeholder="EMAIL_ADDRESS" 
            className="w-full bg-black border border-zinc-700 p-3 text-white focus:border-cyan-500 outline-none text-sm placeholder:text-zinc-600"
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="PASSWORD" 
            className="w-full bg-black border border-zinc-700 p-3 text-white focus:border-cyan-500 outline-none text-sm placeholder:text-zinc-600"
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button className="w-full bg-cyan-600 text-black font-black p-3 hover:bg-cyan-400 transition-colors uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(8,145,178,0.3)]">
            {isLogin ? "Initialize_Link" : "Create_Identity"}
          </button>
        </form>

        {isLogin && (
          <button
            type="button"
            className="w-full mt-4 text-zinc-500 hover:text-cyan-400 text-[9px] uppercase tracking-widest transition-colors"
            onClick={handlePasswordReset}
          >
            [ Forgot_Access_Key? ]
          </button>
        )}

        <div className="mt-8">
          <div className="flex items-center gap-2 mb-6 text-zinc-800">
            <div className="h-[1px] bg-zinc-800 flex-1" />
            <span className="text-[10px] font-bold uppercase">Or_Social_Uplink</span>
            <div className="h-[1px] bg-zinc-800 flex-1" />
          </div>

          <button 
            onClick={handleGoogleSignIn}
            className="w-full border border-pink-500/50 text-pink-500 font-bold p-3 hover:bg-pink-500/10 transition-all flex items-center justify-center gap-3 text-xs tracking-[0.2em]"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 grayscale contrast-125" alt="" />
            SYNC_WITH_GOOGLE
          </button>
        </div>

        <p 
          className="text-zinc-600 text-[9px] mt-8 cursor-pointer text-center hover:text-white transition-colors tracking-tighter uppercase"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "New_User? Register_Here" : "Existing_User? Return_to_Login"}
        </p>
      </div>
    </div>
  );
}