import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const redirectAfterLogin = () => {
    const saved = sessionStorage.getItem("redirectAfterLogin");
    if (saved) {
      sessionStorage.removeItem("redirectAfterLogin");
      navigate(saved);
    } else {
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          redirectAfterLogin();
        }
      } catch (err) {
        setError(err.message);
      }
    };

    checkRedirect();
  }, []);

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      redirectAfterLogin();
    } catch (err) {
      setError("Invalid email or password");
    }

    setLoading(false);
  };

  const handleGoogleSignin = async () => {
    setError("");
    try {
      await signInWithRedirect(auth, provider);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h1 className="text-center text-3xl font-bold text-indigo-500">
          Hushh Notes
        </h1>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white">
          Sign in to your account
        </h2>
        <p className="text-center text-gray-400 text-sm mt-2">
          Continue your smart learning journey 🚀
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded-md mb-5 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignin} className="space-y-6">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="block w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-2 focus:outline-indigo-500"
          />

          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="block w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-2 focus:outline-indigo-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2 font-semibold text-white hover:bg-indigo-400 transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-700"></div>
          <span className="px-3 text-sm text-gray-400">OR</span>
          <div className="flex-grow h-px bg-gray-700"></div>
        </div>

        <button
          onClick={handleGoogleSignin}
          className="flex w-full justify-center items-center rounded-md border border-gray-600 bg-white/5 px-3 py-2 font-medium text-white hover:bg-white/10 transition"
        >
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
