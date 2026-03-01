import { useState } from "react";

export default function QuizComponent({ quiz, onSubmit }) {
  const questions = quiz.questions || quiz.quiz || [];
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  // Separate MCQs and short answers, keeping their original index
  const mcqItems = questions
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => q.type === "mcq");

  const shortItems = questions
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => q.type !== "mcq");

  const handleSelect = (index, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [index]: option }));
  };

  const handleShortAnswer = (index, value) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    let correct = 0;
    mcqItems.forEach(({ q, i }) => {
      if (answers[i] === q.answer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    onSubmit(answers, correct);
  };

  // Only require all MCQs to be answered before submitting
  const allMCQsAnswered = mcqItems.every(({ i }) => answers[i] !== undefined);

  return (
    <div className="space-y-8">
      {/* MCQ Section */}
      {mcqItems.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4 text-indigo-300">
            📝 Multiple Choice Questions
          </h3>
          <div className="space-y-5">
            {mcqItems.map(({ q, i }, num) => {
              const selected = answers[i];
              return (
                <div key={i} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <p className="font-medium mb-3">
                    <span className="text-indigo-400 mr-2">Q{num + 1}.</span>
                    {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options?.map((opt, j) => {
                      const isSelected = selected === opt;
                      const isCorrect = submitted && opt === q.answer;
                      const isWrong = submitted && isSelected && opt !== q.answer;

                      return (
                        <button
                          key={j}
                          type="button"
                          onClick={() => handleSelect(i, opt)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg border transition text-sm font-medium ${
                            isCorrect
                              ? "bg-green-500/20 border-green-500 text-green-300"
                              : isWrong
                              ? "bg-red-500/20 border-red-500 text-red-300"
                              : isSelected
                              ? "bg-indigo-600 border-indigo-400 text-white ring-2 ring-indigo-400"
                              : "bg-gray-700 border-gray-600 text-gray-300 hover:border-indigo-400 hover:bg-gray-600"
                          }`}
                        >
                          <span className="font-mono text-xs mr-2 opacity-50">
                            {["A", "B", "C", "D"][j]}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <p className="text-xs text-green-400 mt-3">
                      ✅ Correct Answer: <span className="font-semibold">{q.answer}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Short Answer Section */}
      {shortItems.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4 text-indigo-300">
            ✍️ Short Answer Questions
          </h3>
          <div className="space-y-5">
            {shortItems.map(({ q, i }, num) => (
              <div key={i} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <p className="font-medium mb-3">
                  <span className="text-indigo-400 mr-2">Q{mcqItems.length + num + 1}.</span>
                  {q.question}
                </p>
                <textarea
                  disabled={submitted}
                  value={answers[i] || ""}
                  onChange={(e) => handleShortAnswer(i, e.target.value)}
                  rows={2}
                  placeholder="Type your answer..."
                  className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm text-white outline outline-1 outline-gray-600 focus:outline-indigo-500 resize-none disabled:opacity-50"
                />
                {submitted && (
                  <p className="text-xs text-green-400 mt-2">
                    ✅ Model Answer: <span className="font-semibold">{q.answer}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {!submitted && (
        <div>
          {!allMCQsAnswered && (
            <p className="text-center text-sm text-gray-500 mb-2">
              Answer all MCQs to submit ({Object.keys(answers).filter(k => mcqItems.find(m => m.i === parseInt(k))).length}/{mcqItems.length} answered)
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allMCQsAnswered}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition rounded-xl py-3 font-bold text-lg"
          >
            Submit Quiz 🚀
          </button>
        </div>
      )}

      {/* Score */}
      {submitted && score !== null && (
        <div className="bg-indigo-600/20 border border-indigo-500 rounded-xl p-6 text-center">
          <p className="text-4xl font-bold text-indigo-300">
            {score} / {mcqItems.length}
          </p>
          <p className="text-gray-400 mt-1">MCQ Score</p>
          <p className="text-sm text-gray-500 mt-2">
            Scroll up to review your answers ☝️
          </p>
        </div>
      )}
    </div>
  );

}
