// src/components/Auth.jsx
import React, { useState } from "react";
// Import 'auth' from YOUR local file
import { auth } from "../lib/firebase"; 
// Import the FUNCTIONS from the OFFICIAL firebase library
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
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
        setIsLogin(true); // Switch to login after registration
      }
    } catch (err) {
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Incorrect email or password, please try again.");
      } else if (err.code === "auth/missing-password") {
        setError("Please enter a password.");
      } else if (err.code === "auth/invalid-email" || err.code === "auth/missing-email") {
        setError("Please enter an email.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must contain at least 6 characters.");
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="h-screen bg-black flex items-center justify-center font-mono p-4">
      <form onSubmit={handleSubmit} className="border-2 border-cyan-500 p-8 w-full max-w-md bg-zinc-900/50 backdrop-blur-md">
        {error && (
          <div className="mb-4 text-pink-500 text-sm font-bold text-center">{error}</div>
        )}
        <h1 className="text-cyan-500 text-xl mb-6 font-black tracking-widest uppercase">
          {isLogin ? "System_Login" : "Register_User"}
        </h1>
        <input 
          type="email" placeholder="EMAIL_ADDRESS" 
          className="w-full bg-black border border-zinc-700 p-3 mb-4 text-white focus:border-cyan-500 outline-none"
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" placeholder="SECURITY_KEY" 
          className="w-full bg-black border border-zinc-700 p-3 mb-6 text-white focus:border-cyan-500 outline-none"
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button className="w-full bg-cyan-600 text-black font-black p-3 hover:bg-cyan-400 transition-colors">
          {isLogin ? "INITIALIZE_SESSION" : "CREATE_IDENTITY"}
        </button>
        <p 
          className="text-zinc-500 text-[10px] mt-4 cursor-pointer text-center"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "NEW USER? REGISTER_HERE" : "EXISTING USER? LOGIN_HERE"}
        </p>
      </form>
    </div>
  );
}