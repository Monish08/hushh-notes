import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function InviteJoin() {
  const { classCode } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("joining"); // joining | success | error
  const [classInfo, setClassInfo] = useState(null);

  useEffect(() => {
    const join = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          // Save intended destination, redirect to signin
          sessionStorage.setItem("redirectAfterLogin", `/invite/${classCode}`);
          navigate("/signin");
          return;
        }

        const classRef = doc(db, "classrooms", classCode);
        const classSnap = await getDoc(classRef);

        if (!classSnap.exists()) {
          setStatus("error");
          return;
        }

        setClassInfo(classSnap.data());

        // Add to members
        await setDoc(doc(db, "classrooms", classCode, "members", user.uid), {
          username: user.displayName || user.email,
          joinedAt: new Date(),
          role: "student",
        });

        setStatus("success");
        setTimeout(() => navigate(`/classroom/${classCode}`), 1500);
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    join();
  }, [classCode, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        {status === "joining" && (
          <>
            <div className="text-5xl mb-4 animate-bounce">🎓</div>
            <p className="text-xl font-bold text-indigo-400 animate-pulse">
              Joining classroom...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <p className="text-xl font-bold text-green-400">
              Joined {classInfo?.name || classCode}!
            </p>
            <p className="text-gray-400 mt-2">Redirecting you now...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <p className="text-xl font-bold text-red-400">Classroom not found</p>
            <p className="text-gray-400 mt-2">
              Check the invite link and try again.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-lg font-semibold transition"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}