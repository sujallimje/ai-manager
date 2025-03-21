"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is already authenticated
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        router.push("/");
      }
    });
    
    return () => unsubscribe();
  }, [router]);
  
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // No need to redirect here, the onAuthStateChanged listener will handle it
    } catch (err) {
      console.error("Error signing in:", err);
      
      let errorMessage = "Failed to sign in. ";
      if (err.code === 'auth/invalid-email') {
        errorMessage += "Please enter a valid email address.";
      } else if (err.code === 'auth/user-not-found') {
        errorMessage += "No account found with this email.";
      } else if (err.code === 'auth/wrong-password') {
        errorMessage += "Incorrect password.";
      } else {
        errorMessage += err.message || "Please check your credentials and try again.";
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // No need to redirect here, the onAuthStateChanged listener will handle it
    } catch (err) {
      console.error("Error signing up:", err);
      
      let errorMessage = "Failed to create account. ";
      if (err.code === 'auth/invalid-email') {
        errorMessage += "Please enter a valid email address.";
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage += "An account with this email already exists.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage += "Password should be at least 6 characters.";
      } else {
        errorMessage += err.message || "Please check your information and try again.";
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent! Check your inbox.");
      setLoading(false);
    } catch (err) {
      console.error("Error resetting password:", err);
      
      let errorMessage = "Failed to send reset email. ";
      if (err.code === 'auth/invalid-email') {
        errorMessage += "Please enter a valid email address.";
      } else if (err.code === 'auth/user-not-found') {
        errorMessage += "No account found with this email.";
      } else {
        errorMessage += err.message || "Please check your email and try again.";
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };
  
  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setResetPassword(false);
    setError("");
    setSuccessMessage("");
  };
  
  const toggleResetPassword = () => {
    setResetPassword(!resetPassword);
    setError("");
    setSuccessMessage("");
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            <span className="text-3xl font-bold text-blue-600">Capital</span>
            <span className="text-3xl font-bold text-green-500">Cue</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {resetPassword ? "Reset Password" : isSignUp ? "Create Your Account" : "Welcome Back"}
        </h2>
        
        {resetPassword ? (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            
            <button
              type="button"
              onClick={toggleResetPassword}
              className="w-full mt-4 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
            
            {!isSignUp && (
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={toggleResetPassword}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Forgot Password?
                </button>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
            
            <p className="text-center mt-4 text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-blue-600 hover:text-blue-800 ml-1"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}