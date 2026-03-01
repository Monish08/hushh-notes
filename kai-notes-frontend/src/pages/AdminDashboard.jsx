import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// ⚠️ Lock this to your UID in production
const ADMIN_EMAILS = ["learnpathmoni@gmail.com"]; // Replace with your email

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClassrooms: 0,
    totalQuizAttempts: 0,
  });
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    // Basic guard
    if (!user) {
      navigate("/signin");
      return;
    }

    const fetchStats = async () => {
      try {
        // Users count
        const usersSnap = await getDocs(collection(db, "users"));
        const classroomsSnap = await getDocs(collection(db, "classrooms"));

        let totalAttempts = 0;
        const classroomDetails = [];

        for (const cls of classroomsSnap.docs) {
          const membersSnap = await getDocs(
            collection(db, "classrooms", cls.id, "members")
          );
          const leaderSnap = await getDocs(
            collection(db, "classrooms", cls.id, "leaderboard")
          );
          const quizSnap = await getDocs(
            collection(db, "classrooms", cls.id, "quiz")
          );

          totalAttempts += leaderSnap.size;

          classroomDetails.push({
            id: cls.id,
            ...cls.data(),
            memberCount: membersSnap.size,
            attemptCount: leaderSnap.size,
            hasQuiz: quizSnap.size > 0,
          });
        }

        setStats({
          totalUsers: usersSnap.size,
          totalClassrooms: classroomsSnap.size,
          totalQuizAttempts: totalAttempts,
        });

        setClassrooms(classroomDetails);
      } catch (err) {
        console.error("Admin fetch error:", err);
      }
      setLoading(false);
    };

    fetchStats();
  }, [navigate]);

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "indigo" },
    { label: "Classrooms", value: stats.totalClassrooms, icon: "🏫", color: "purple" },
    { label: "Quiz Attempts", value: stats.totalQuizAttempts, icon: "📝", color: "green" },
    {
      label: "Active Rate",
      value: stats.totalClassrooms > 0
        ? `${Math.round((classrooms.filter((c) => c.hasQuiz).length / stats.totalClassrooms) * 100)}%`
        : "0%",
      icon: "🔥",
      color: "orange",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-indigo-400">📊 Kai Notes Admin</h1>
          <p className="text-xs text-gray-500 mt-0.5">Live metrics dashboard</p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Back to App
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center text-indigo-400 animate-pulse py-20 text-xl">
            Loading metrics...
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {statCards.map((s) => (
                <div key={s.label} className="bg-gray-800 rounded-xl p-5 border border-gray-700 text-center">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-bold text-white">{s.value}</div>
                  <div className="text-sm text-gray-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Pitch Line */}
            <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-xl p-4 mb-8 text-center">
              <p className="text-indigo-300 font-medium">
                🚀 Kai Notes has <strong>{stats.totalUsers}</strong> users across{" "}
                <strong>{stats.totalClassrooms}</strong> study circles with{" "}
                <strong>{stats.totalQuizAttempts}</strong> quiz attempts
              </p>
              <p className="text-gray-500 text-xs mt-1">
                (Copy this for your demo pitch!)
              </p>
            </div>

            {/* Classrooms Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="font-bold">All Classrooms</h2>
              </div>
              <div className="divide-y divide-gray-700">
                {classrooms.length === 0 ? (
                  <p className="text-gray-400 text-sm p-6 text-center">No classrooms yet</p>
                ) : (
                  classrooms.map((cls) => (
                    <div key={cls.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-700/30 transition">
                      <div>
                        <p className="font-medium">{cls.name || cls.id}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Code: <span className="font-mono text-indigo-400">{cls.id}</span>
                          {cls.subject && ` · ${cls.subject}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>👥 {cls.memberCount}</span>
                        <span>📝 {cls.attemptCount} attempts</span>
                        <span className={cls.hasQuiz ? "text-green-400" : "text-gray-600"}>
                          {cls.hasQuiz ? "✅ Quiz active" : "⬜ No quiz"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}