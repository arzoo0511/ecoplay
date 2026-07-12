import { useState } from "react";
import { useGame } from "../context/GameContext";

const questions = [
  {
    question: "Which gas contributes most to global warming?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    answer: "Carbon Dioxide",
  },
  {
    question: "Which energy source is renewable?",
    options: ["Coal", "Solar", "Diesel", "Natural Gas"],
    answer: "Solar",
  },
  {
    question: "What can be recycled?",
    options: ["Plastic Bottles", "Food Waste", "Used Tissue", "Dirty Diapers"],
    answer: "Plastic Bottles",
  },
];

const SustainabilityQuiz = () => {
  const { dispatch } = useGame();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleAnswer = (selected: string) => {
    const isCorrect =
      selected === questions[currentQuestion].answer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      const finalScore = isCorrect ? score + 1 : score;

      dispatch({
        type: "ADD_POINTS",
        payload: finalScore * 10,
        activityType: "quiz_completed",
      });

      setCompleted(true);
    }
  };

  if (completed) {
    return (
      <div className="rounded-xl p-6 bg-eco-panel border border-eco-border">
        <h2 className="text-2xl font-bold mb-4">
          Quiz Completed 🎉
        </h2>

        <p>
          Score: {score}/{questions.length}
        </p>

        <p className="mt-2">
          Earned {score * 10} points
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-6 bg-eco-panel border border-eco-border">
      <h2 className="text-xl font-bold mb-4">
        Sustainability Quiz
      </h2>

      <p className="mb-4">
        {questions[currentQuestion].question}
      </p>

      <div className="flex flex-col gap-2">
        {questions[currentQuestion].options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className="rounded-lg p-3 bg-eco-accent text-white"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SustainabilityQuiz;