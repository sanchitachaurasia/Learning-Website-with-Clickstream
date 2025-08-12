import React, { useState } from 'react';

export default function QuizComponent({ data, courseId, courseTitle, user }) {
  // The answers state now holds strings or numbers directly from the user's input.
  const [answers, setAnswers] = useState(Array(data.questions.length).fill(''));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleInputChange = (qIndex, value) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[qIndex] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (submitted) return;
    let calculatedScore = 0;
    data.questions.forEach((q, i) => {
      let isCorrect = false;
      if (q.type === 'multiple_choice') {
        isCorrect = answers[i] === q.correctIndex;
      } else if (q.type === 'number_input') {
        isCorrect = Number(answers[i]) === Number(q.correctAnswer);
      } else { // text_input
        isCorrect = answers[i].trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      }

      if (isCorrect) {
        calculatedScore++;
      }
    });
    
    setScore(calculatedScore);
    setSubmitted(true);
  };

  const renderQuestionInput = (q, qIndex) => {
    switch (q.type) {
      case 'multiple_choice':
        return (
          <div className="flex flex-wrap gap-2">
            {q.options.map((option, optionIndex) => {
              const isSelected = answers[qIndex] === optionIndex;
              const isCorrectAnswer = submitted && optionIndex === q.correctIndex;
              const isWrongSelection = submitted && isSelected && !isCorrectAnswer;

              return (
                <button
                  key={optionIndex}
                  onClick={() => handleInputChange(qIndex, optionIndex)}
                  disabled={submitted}
                  className={`px-4 py-2 rounded-md border transition-colors
                    ${isCorrectAnswer ? 'bg-green-200 border-green-400 text-green-800' : ''}
                    ${isWrongSelection ? 'bg-red-200 border-red-400 text-red-800' : ''}
                    ${!submitted && isSelected ? 'bg-blue-200 border-blue-400' : ''}
                    ${!submitted && !isSelected ? 'bg-white hover:bg-gray-100' : ''}
                    ${submitted ? 'cursor-not-allowed' : 'cursor-default'}`
                  }
                >{option}</button>
              );
            })}
          </div>
        );
      case 'number_input':
        return (
          <input
            type="number"
            value={answers[qIndex]}
            onChange={(e) => handleInputChange(qIndex, e.target.value)}
            disabled={submitted}
            className="px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm w-full md:w-1/2"
          />
        );
      case 'text_input':
      default:
        return (
          <input
            type="text"
            value={answers[qIndex]}
            onChange={(e) => handleInputChange(qIndex, e.target.value)}
            disabled={submitted}
            className="px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm w-full"
          />
        );
    }
  };

  return (
    <div className="border-t border-gray-200 mt-4 pt-4">
      {data.questions.map((q, qIndex) => (
        <div key={qIndex} className="mb-6">
          <p className="font-semibold mb-2">{qIndex + 1}. {q.question}</p>
          {renderQuestionInput(q, qIndex)}
        </div>
      ))}

      {!submitted && (
        <button
          onClick={handleSubmit}
          data-analytics-id="quiz-submit-button"
          data-course-id={courseId}
          data-content-id={data.id}
          data-course-title={courseTitle} // Add this attribute
          className="..."
        >
          Submit Quiz
        </button>
      )}

      {submitted && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
          <h4 className="text-xl font-bold">Quiz Complete!</h4>
          <p className="text-lg mt-2">Your score: {score} / {data.questions.length}</p>
        </div>
      )}
    </div>
  );
}