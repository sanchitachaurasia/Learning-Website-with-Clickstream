import React, { useState } from 'react';

export default function QuizComponent({ data }) {
  const [answers, setAnswers] = useState(Array(data.questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelectAnswer = (qIndex, optionIndex) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[qIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (submitted) return;
    let calculatedScore = 0;
    data.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);
    setSubmitted(true);
    // We will add clickstream logging here later
  };

  return (
    <div className="border-t border-gray-200 mt-4 pt-4">
      {data.questions.map((q, qIndex) => (
        <div key={qIndex} className="mb-6">
          <p className="font-semibold mb-2">
            {qIndex + 1}. {q.question}
          </p>
          <div className="flex flex-wrap gap-2">
            {q.options.map((option, optionIndex) => {
              const isSelected = answers[qIndex] === optionIndex;
              const isCorrect = submitted && optionIndex === q.correctIndex;
              const isWrong = submitted && isSelected && !isCorrect;

              return (
                <button
                  key={optionIndex}
                  onClick={() => handleSelectAnswer(qIndex, optionIndex)}
                  disabled={submitted}
                  className={`px-4 py-2 rounded-md border transition-colors
                    ${isCorrect ? 'bg-green-200 border-green-400 text-green-800' : ''}
                    ${isWrong ? 'bg-red-200 border-red-400 text-red-800' : ''}
                    ${!submitted && isSelected ? 'bg-blue-200 border-blue-400' : ''}
                    ${!submitted && !isSelected ? 'bg-white hover:bg-gray-100' : ''}
                    ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={answers.includes(null)}
          className="w-full px-4 py-2 mt-4 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Submit Quiz
        </button>
      )}

      {submitted && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
          <h4 className="text-xl font-bold">Quiz Complete!</h4>
          <p className="text-lg mt-2">
            Your score: {score} / {data.questions.length}
          </p>
        </div>
      )}
    </div>
  );
}