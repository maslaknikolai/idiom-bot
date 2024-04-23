import mongoose from 'mongoose';

interface Answers {
  meaning_answer: string;
  usage_answer: string;
  custom_usage_submitted: string;
  votes_received: number;
}

const answersSchema = new mongoose.Schema<Answers>({
  meaning_answer: { type: String, required: true },
  usage_answer: { type: String, required: true },
  custom_usage_submitted: { type: String, required: true },
  votes_received: { type: Number, default: 0 }
});

interface PlayerResult {
  player_id: mongoose.Schema.Types.ObjectId;
  answers: Answers;
  score: number;
}

export const playerResultSchema = new mongoose.Schema<PlayerResult>({
  player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  answers: answersSchema,
  score: { type: Number, default: 0 }
});

