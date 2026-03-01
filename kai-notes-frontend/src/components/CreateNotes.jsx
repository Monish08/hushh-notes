
import React, { useState } from "react";
import { Send, Image as ImageIcon } from "lucide-react";

export default function CreateNote() {
  const [image, setImage] = useState(null);
  const [messages, setMessages] = useState([]);

  const handleGenerateSummary = () => {
    setMessages([
      ...messages,
      { type: "user", text: "Generate summary from this image." },
      { type: "ai", text: "AI Summary will appear here..." },
    ]);
  };

  const handleGenerateQuiz = () => {
    setMessages([
      ...messages,
      { type: "user", text: "Generate quiz from this image." },
      { type: "ai", text: "AI Quiz questions will appear here..." },
    ]);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">

      {/* HEADER */}
      <div className="p-6 border-b border-slate-800 backdrop-blur-xl bg-slate-900/40">
        <h2 className="text-2xl font-semibold text-indigo-400">
          AI Study Assistant
        </h2>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            Upload an image and choose an action to get started 🚀
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-2xl p-4 rounded-2xl ${
              msg.type === "user"
                ? "bg-indigo-600 ml-auto"
                : "bg-slate-800"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {image && (
          <div className="mt-4">
            <img
              src={URL.createObjectURL(image)}
              alt="uploaded"
              className="rounded-xl max-h-72 border border-slate-700"
            />
          </div>
        )}
      </div>

      {/* INPUT SECTION */}
      <div className="p-6 border-t border-slate-800 bg-slate-900/60 backdrop-blur-xl">

        {/* Image Upload */}
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-4 py-2 rounded-xl hover:bg-slate-700 transition">
            <ImageIcon size={18} />
            Upload Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>

          {image && (
            <span className="text-green-400 text-sm">
              Image selected ✔
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleGenerateSummary}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-semibold transition"
          >
            🧠 Generate Summary
          </button>

          <button
            onClick={handleGenerateQuiz}
            className="flex-1 bg-purple-600 hover:bg-purple-700 py-3 rounded-xl font-semibold transition"
          >
            📝 Generate Quiz
          </button>
        </div>
      </div>
    </div>
  );
}