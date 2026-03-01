import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db, auth } from "../firebase";
import Leaderboard from "../components/Leaderboard";
import QuizComponent from "../components/QuizComponent";
import axios from "axios";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24 * 7));
};

export default function Classroom() {
  const { classCode } = useParams();
  const [members, setMembers] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [activeTab, setActiveTab] = useState("quiz");
  const [hasAttempted, setHasAttempted] = useState(false);
  const [myScore, setMyScore] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [copied, setCopied] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchInfo = async () => {
      const snap = await getDoc(doc(db, "classrooms", classCode));
      if (snap.exists()) {
        const data = snap.data();
        setClassInfo(data);
        setIsCreator(data.createdBy === user?.uid);
      }
    };
    fetchInfo();
  }, [classCode, user]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "classrooms", classCode, "members"),
      (snapshot) => setMembers(snapshot.docs.map((d) => d.data()))
    );
    return () => unsub();
  }, [classCode]);

  useEffect(() => {
    const init = async () => {
      const quizSnap = await getDoc(doc(db, "classrooms", classCode, "quiz", "current"));
      if (quizSnap.exists()) setQuiz(quizSnap.data());

      const attemptSnap = await getDoc(doc(db, "classrooms", classCode, "leaderboard", user?.uid));
      if (attemptSnap.exists()) {
        setHasAttempted(true);
        setMyScore(attemptSnap.data().score);
      }
    };
    init();
  }, [classCode, user]);

  const generateQuiz = async (file) => {
    if (!file) return;
    setGenerating(true);
    setGenerateError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(`${BACKEND_URL}/generate-quiz`, formData);
      const quizData = {
        questions: response.data.questions,
        summary: response.data.summary,
        mostRepeatedConcepts: response.data.mostRepeatedConcepts,
        likelyExamQuestions: response.data.likelyExamQuestions,
        createdAt: new Date(),
        week: getCurrentWeek(),
      };
      await setDoc(doc(db, "classrooms", classCode, "quiz", "current"), quizData);
      setQuiz(quizData);
    } catch (err) {
      setGenerateError(err.response?.data?.error || "Failed to generate quiz. Try again.");
    }
    setGenerating(false);
  };

  const handleSubmit = async (selectedAnswers, correctCount) => {
    if (hasAttempted) return;
    setHasAttempted(true);
    setMyScore(correctCount);
    await setDoc(doc(db, "classrooms", classCode, "leaderboard", user.uid), {
      username: user.displayName || user.email,
      score: correctCount,
      updatedAt: new Date(),
    });
  };

  const handleReset = async () => {
    if (!window.confirm("Reset quiz and leaderboard? Cannot be undone.")) return;
    setResetting(true);
    await deleteDoc(doc(db, "classrooms", classCode, "quiz", "current"));
    setQuiz(null);
    setHasAttempted(false);
    setMyScore(null);
    setResetting(false);
  };

  const copyInvite = () => {
    const link = `${window.location.origin}/invite/${classCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const total = quiz?.questions?.filter((q) => q.type === "mcq").length || 0;
    const text = `🎓 I scored ${myScore}/${total} in ${classInfo?.name || classCode} on Kai Notes!\n\nJoin our study circle 👇\n${window.location.origin}/invite/${classCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white">← Dashboard</Link>
          <span className="text-gray-600">|</span>
          <span className="font-bold text-lg">{classInfo?.name || classCode}</span>
          {classInfo?.subject && (
            <span className="text-sm text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              {classInfo.subject}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyInvite} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition">
            {copied ? "✅ Copied!" : `📋 Invite: ${classCode}`}
          </button>
          {isCreator && quiz && (
            <button onClick={handleReset} disabled={resetting} className="text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg transition">
              {resetting ? "Resetting..." : "🔄 Reset"}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Members */}
        <div className="mb-6 flex items-center gap-2 flex-wrap text-sm text-gray-400">
          <span>👥 {members.length} member{members.length !== 1 ? "s" : ""}</span>
          {members.slice(0, 5).map((m, i) => (
            <span key={i} className="bg-gray-700 px-2 py-0.5 rounded-full text-xs">{m.username?.split("@")[0]}</span>
          ))}
          {members.length > 5 && <span className="text-xs text-gray-500">+{members.length - 5} more</span>}
        </div>

        {/* Score Banner */}
        {hasAttempted && myScore !== null && (
          <div className="mb-6 bg-green-500/10 border border-green-500 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-green-400 font-bold text-xl">
                ✅ Your Score: {myScore} / {quiz?.questions?.filter((q) => q.type === "mcq").length || "?"}
              </p>
              <p className="text-sm text-gray-400 mt-1">One attempt per quiz — locked in 🔒</p>
            </div>
            <button onClick={shareOnWhatsApp} className="bg-green-600 hover:bg-green-500 transition px-4 py-2 rounded-lg text-sm font-semibold">
              📤 Share on WhatsApp
            </button>
          </div>
        )}

        {/* Upload */}
        {!quiz && (
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-10 text-center mb-8">
            <div className="text-4xl mb-3">📄</div>
            <p className="font-semibold text-lg mb-1">Upload Study Material</p>
            <p className="text-sm text-gray-400 mb-6">PDF → Kai generates quiz + summary + exam prep automatically</p>
            {generateError && (
              <p className="text-red-400 text-sm mb-4 bg-red-500/10 px-4 py-2 rounded-lg">❌ {generateError}</p>
            )}
            {generating ? (
              <div>
                <div className="text-indigo-400 animate-pulse font-medium">🤖 Kai is analyzing your notes...</div>
                <div className="text-gray-500 text-sm mt-1">This takes ~20 seconds</div>
              </div>
            ) : (
              <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 transition px-6 py-2.5 rounded-lg font-semibold">
                Choose PDF
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => generateQuiz(e.target.files[0])} />
              </label>
            )}
          </div>
        )}

        {/* Tabs + Content */}
        {quiz && (
          <>
            <div className="flex gap-2 mb-6">
              {[{ id: "quiz", label: "📝 Quiz" }, { id: "summary", label: "📖 Summary" }, { id: "examprep", label: "🎯 Exam Prep" }].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-400 hover:text-white"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "summary" && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="font-bold text-lg mb-4">📖 Exam Summary</h2>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{quiz.summary}</p>
              </div>
            )}

            {activeTab === "examprep" && (
              <div className="space-y-6">
                {quiz.mostRepeatedConcepts?.length > 0 && (
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="font-bold mb-4">🔁 Most Repeated Concepts</h2>
                    <ul className="space-y-2">
                      {quiz.mostRepeatedConcepts.map((c, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-300">
                          <span className="text-indigo-400 font-bold">{i + 1}.</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {quiz.likelyExamQuestions?.length > 0 && (
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="font-bold mb-4">🎯 Likely Exam Questions</h2>
                    <ul className="space-y-3">
                      {quiz.likelyExamQuestions.map((q, i) => (
                        <li key={i} className="text-sm text-gray-300 bg-gray-700/50 rounded-lg p-3">
                          <span className="text-yellow-400 font-bold mr-2">Q{i + 1}.</span>{q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "quiz" && !hasAttempted && (
              <QuizComponent quiz={quiz} onSubmit={handleSubmit} />
            )}

            {activeTab === "quiz" && hasAttempted && (
              <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
                <div className="text-5xl mb-4">🏆</div>
                <p className="text-xl font-bold">Quiz Completed!</p>
                <p className="text-gray-400 mt-2">
                  You scored <span className="text-indigo-400 font-bold">{myScore}</span> points. Check the leaderboard!
                </p>
                <button onClick={shareOnWhatsApp} className="mt-5 bg-green-600 hover:bg-green-500 transition px-6 py-2.5 rounded-lg font-semibold">
                  📤 Share Result on WhatsApp
                </button>
              </div>
            )}
          </>
        )}

        <Leaderboard classCode={classCode} currentUserId={user?.uid} />
      </div>
    </div>
  );
}
