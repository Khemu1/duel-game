export const QUESTIONS = [
  {
    id: "q1",
    text: "What is the capital of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correctIndex: 2,
  },
  {
    id: "q2",
    text: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Mercury"],
    correctIndex: 1,
  },
  {
    id: "q3",
    text: "What is 7 × 8?",
    options: ["54", "56", "48", "64"],
    correctIndex: 1,
  },
  {
    id: "q4",
    text: 'Who wrote "Romeo and Juliet"?',
    options: [
      "Charles Dickens",
      "William Shakespeare",
      "Jane Austen",
      "Mark Twain",
    ],
    correctIndex: 1,
  },
  {
    id: "q5",
    text: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctIndex: 2,
  },
  {
    id: "q6",
    text: "How many continents are there on Earth?",
    options: ["5", "6", "7", "8"],
    correctIndex: 2,
  },
  {
    id: "q7",
    text: "Which language has the most native speakers?",
    options: ["English", "Hindi", "Spanish", "Mandarin Chinese"],
    correctIndex: 3,
  },
  {
    id: "q8",
    text: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correctIndex: 3,
  },
];

export const DUEL_CONFIG = {
  QUESTIONS_PER_DUEL: 5,
  TIME_PER_QUESTION_MS: 100_000,
  // TIME_PER_QUESTION_MS: 5000,

  POINTS_PER_CORRECT: 1,
};
export function pickQuestions() {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, DUEL_CONFIG.QUESTIONS_PER_DUEL);
}
