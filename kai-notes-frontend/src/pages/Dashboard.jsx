import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate("/signin");
        return;
      }
      setUser(currentUser);
      try {
        const createdQuery = query(
          collection(db, "classrooms"),
          where("createdBy", "==", currentUser.uid)
        );
        const createdSnap = await getDocs(createdQuery);
        const created = createdSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          role: "teacher",
        }));
        setClassrooms(created);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-400"> Kai Notes</h1>
        <div className="flex items-center gap-2">
          <Link
            to="/admin"
            className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-600 text-sm text-gray-300 transition"
          >
             Admin
          </Link>
          <span className="text-sm text-gray-300 bg-gray-700 border border-gray-600 px-3 py-1.5 rounded-lg">
            {user?.displayName || user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-600 text-sm text-gray-300 hover:text-white transition"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">
            Welcome back, {user?.displayName || "Student"} 👋
          </h2>
          <p className="text-gray-400 mt-1">
            Ready to turn notes into competitive knowledge?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <Link
            to="/create"
            className="bg-indigo-600 hover:bg-indigo-500 transition rounded-xl p-6 text-center"
          >
            <div className="text-3xl mb-2">➕</div>
            <p className="font-semibold text-lg">Create Classroom</p>
            <p className="text-sm text-indigo-300 mt-1">Upload notes & generate quiz</p>
          </Link>
          <Link
            to="/join"
            className="bg-gray-700 hover:bg-gray-600 transition rounded-xl p-6 text-center border border-gray-600"
          >
            <div className="text-3xl mb-2">🚪</div>
            <p className="font-semibold text-lg">Join Classroom</p>
            <p className="text-sm text-gray-400 mt-1">Enter class code to join</p>
          </Link>
        </div>

        {/* Classrooms */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Classrooms</h3>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : classrooms.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
              <p className="text-gray-400">No classrooms yet.</p>
              <p className="text-sm text-gray-500 mt-1">Create one or join with a code!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {classrooms.map((cls) => (
                <Link
                  key={cls.id}
                  to={`/classroom/${cls.id}`}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex items-center justify-between transition hover:border-indigo-500"
                >
                  <div>
                    <p className="font-semibold">{cls.subject || cls.name || cls.id}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Code: <span className="font-mono text-indigo-400">{cls.id}</span>
                      {cls.semester && <span className="ml-2 text-gray-500">{cls.semester}</span>}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
                    👨‍🏫 Teacher
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
