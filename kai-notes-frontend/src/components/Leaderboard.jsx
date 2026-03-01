import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function Leaderboard({ classCode, currentUserId }) {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "classrooms", classCode, "leaderboard"),
      orderBy("score", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setLeaders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [classCode]);

  const medals = ["🥇", "🥈", "🥉"];

  const myRank = leaders.findIndex((l) => l.id === currentUserId) + 1;

  return (
    <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          🏆 Live Leaderboard
        </h2>
        {myRank > 0 && (
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">
            You're #{myRank}
          </span>
        )}
      </div>

      {leaders.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">
          No scores yet — be the first to submit! 🚀
        </p>
      ) : (
        <div className="space-y-2">
          {leaders.map((leader, index) => {
            const isMe = leader.id === currentUserId;
            const isFirst = index === 0;

            return (
              <div
                key={leader.id}
                className={`flex items-center justify-between rounded-lg px-4 py-3 transition ${
                  isMe
                    ? "ring-2 ring-indigo-500 bg-indigo-500/10"
                    : isFirst
                    ? "bg-yellow-500/10 border border-yellow-500/20"
                    : index === 1
                    ? "bg-gray-500/10"
                    : index === 2
                    ? "bg-orange-500/10"
                    : "bg-gray-700/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl w-7 text-center font-bold">
                    {medals[index] || `#${index + 1}`}
                  </span>
                  <div>
                    <span className="font-medium">{leader.username}</span>
                    {isMe && (
                      <span className="ml-2 text-xs text-indigo-400">(you)</span>
                    )}
                    {isFirst && leaders.length > 1 && (
                      <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">
                        Top Performer ⭐
                      </span>
                    )}
                  </div>
                </div>
                <span className={`font-bold text-lg ${isFirst ? "text-yellow-400" : isMe ? "text-indigo-400" : "text-gray-300"}`}>
                  {leader.score} pts
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}