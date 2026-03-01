import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // 🔥 Save user in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      username: username,
      email: user.email,
      createdAt: new Date(),
    });

    navigate("/dashboard");

  } catch (err) {
    setError(err.message);
  }

  setLoading(false);
};

  const handleGoogleSignup = async () => {
  setError("");
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        username: user.displayName || "Google User",
        email: user.email,
        createdAt: new Date(),
      },
      { merge: true }
    );

    navigate("/dashboard");

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
          Create your account
        </h2>
        <p className="text-center text-gray-400 text-sm mt-2">
          Your smart AI-powered study companion 🚀
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded-md mb-5 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
            <div>
  <label className="block text-sm font-medium text-gray-200">
    Username
  </label>
  <div className="mt-2">
    <input
      type="text"
      required
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="block w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-2 focus:outline-indigo-500"
      placeholder="Enter your username"
    />
  </div>
</div>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Email address
            </label>
            <div className="mt-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:outline-indigo-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Password
            </label>
            <div className="mt-2">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:outline-indigo-500"
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          {/* Create Account Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2 font-semibold text-white hover:bg-indigo-400 transition"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-700"></div>
          <span className="px-3 text-sm text-gray-400">OR</span>
          <div className="flex-grow h-px bg-gray-700"></div>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleSignup}
          className="flex w-full justify-center items-center rounded-md border border-gray-600 bg-white/5 px-3 py-2 font-medium text-white hover:bg-white/10 transition"
        >
          Continue with Google
        </button>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}