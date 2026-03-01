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

// 🔥 PRODUCTION READY BACKEND URL
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

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

  // 🔹 Load classroom info
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

  // 🔹 Live members
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "classrooms", classCode, "members"),
      (snapshot) => setMembers(snapshot.docs.map((d) => d.data()))
    );
    return () => unsub();
  }, [classCode]);

  // 🔹 Load quiz + attempt status
  useEffect(() => {
    const init = async () => {
      const quizSnap = await getDoc(
        doc(db, "classrooms", classCode, "quiz", "current")
      );
      if (quizSnap.exists()) setQuiz(quizSnap.data());

      if (user) {
        const attemptSnap = await getDoc(
          doc(db, "classrooms", classCode, "leaderboard", user.uid)
        );
        if (attemptSnap.exists()) {
          setHasAttempted(true);
          setMyScore(attemptSnap.data().score);
        }
      }
    };
    init();
  }, [classCode, user]);

  // 🔥 Generate Quiz (Calls Render Backend)
  const generateQuiz = async (file) => {
    if (!file) return;

    setGenerating(true);
    setGenerateError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${BACKEND_URL}/generate-quiz`,
        formData
      );

      const quizData = {
        questions: response.data.questions,
        summary: response.data.summary,
        mostRepeatedConcepts: response.data.mostRepeatedConcepts,
        likelyExamQuestions: response.data.likelyExamQuestions,
        createdAt: new Date(),
        week: getCurrentWeek(),
      };

      await setDoc(
        doc(db, "classrooms", classCode, "quiz", "current"),
        quizData
      );

      setQuiz(quizData);
    } catch (err) {
      console.error(err);
      setGenerateError(
        err.response?.data?.error || "Failed to generate quiz."
      );
    }

    setGenerating(false);
  };

  // 🔹 Submit Quiz
  const handleSubmit = async (selectedAnswers, correctCount) => {
    if (hasAttempted) return;

    setHasAttempted(true);
    setMyScore(correctCount);

    await setDoc(
      doc(db, "classrooms", classCode, "leaderboard", user.uid),
      {
        username: user.displayName || user.email,
        score: correctCount,
        updatedAt: new Date(),
      }
    );
  };

  // 🔹 Reset Quiz (Creator Only)
  const handleReset = async () => {
    if (!window.confirm("Reset quiz and leaderboard?")) return;

    setResetting(true);

    await deleteDoc(
      doc(db, "classrooms", classCode, "quiz", "current")
    );

    setQuiz(null);
    setHasAttempted(false);
    setMyScore(null);

    setResetting(false);
  };

  // 🔹 Copy Invite Link
  const copyInvite = () => {
    const link = `${window.location.origin}/invite/${classCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <Link to="/dashboard" className="text-gray-400">
          ← Dashboard
        </Link>

        <button
          onClick={copyInvite}
          className="bg-gray-700 px-3 py-1 rounded"
        >
          {copied ? "Copied!" : `Invite: ${classCode}`}
        </button>
      </div>

      {!quiz && (
        <div className="mb-8">
          {generateError && (
            <p className="text-red-400 mb-3">{generateError}</p>
          )}

          {generating ? (
            <p className="text-indigo-400 animate-pulse">
              🤖 Kai is analyzing your notes...
            </p>
          ) : (
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => generateQuiz(e.target.files[0])}
            />
          )}
        </div>
      )}

      {quiz && !hasAttempted && (
        <QuizComponent quiz={quiz} onSubmit={handleSubmit} />
      )}

      {hasAttempted && (
        <div className="bg-green-500/10 p-4 rounded mb-6">
          <p className="text-green-400 font-bold">
            Your Score: {myScore}
          </p>
        </div>
      )}

      <Leaderboard
        classCode={classCode}
        currentUserId={user?.uid}
      />
    </div>
  );
}
