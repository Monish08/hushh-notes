import { useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// Generate random 6-char alphanumeric code
const generateCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export default function CreateClassroom() {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      const code = generateCode();

      await setDoc(doc(db, "classrooms", code), {
        name,
        subject,
        createdBy: user.uid,
        creatorName: user.displayName || user.email,
        createdAt: new Date(),
        code,
      });

      // Add creator as a member
      await setDoc(doc(db, "classrooms", code, "members", user.uid), {
        username: user.displayName || user.email,
        joinedAt: new Date(),
        role: "teacher",
      });

      navigate(`/classroom/${code}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-400">Kai Notes</h1>
          <h2 className="text-xl font-semibold mt-4">Create a Classroom</h2>
          <p className="text-gray-400 text-sm mt-1">
            A unique class code will be generated automatically
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded-md mb-5 text-center">
            {error}
          </div>
        )}

        <form
          onSubmit={handleCreate}
          className="bg-gray-800 rounded-xl p-8 border border-gray-700 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Classroom Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-2 focus:outline-indigo-500 placeholder:text-gray-500"
              placeholder="e.g. DBMS Batch A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Subject (optional)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="block w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-2 focus:outline-indigo-500 placeholder:text-gray-500"
              placeholder="e.g. Database Management"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 transition rounded-md py-2 font-semibold"
          >
            {loading ? "Creating..." : "Create Classroom 🚀"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="w-full bg-transparent border border-gray-600 hover:bg-gray-700 transition rounded-md py-2 text-sm text-gray-300"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}