import { useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function JoinClassroom() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();

    const classRef = doc(db, "classrooms", code);
    const classSnap = await getDoc(classRef);

    if (!classSnap.exists()) {
      alert("Classroom not found");
      return;
    }

    const user = auth.currentUser;

    await setDoc(
      doc(db, "classrooms", code, "members", user.uid),
      {
        username: user.displayName || user.email,
        joinedAt: new Date(),
      }
    );

    navigate(`/classroom/${code}`);
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
      <form onSubmit={handleJoin} className="bg-gray-800 p-8 rounded-xl w-96">
        <h2 className="text-xl font-bold mb-6">Join Classroom</h2>

        <input
          type="text"
          placeholder="Enter Class Code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="w-full mb-4 p-2 bg-gray-700 rounded"
          required
        />

        <button className="w-full bg-indigo-500 p-2 rounded">
          Join
        </button>
      </form>
    </div>
  );
}