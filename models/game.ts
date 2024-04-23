import mongoose from 'mongoose';
import { playerResultSchema } from './playerResult';
import { Document } from 'mongoose';

export interface Game extends Document {
  date: Date;
  idiom_id: mongoose.Schema.Types.ObjectId;
  players_results: typeof playerResultSchema[];
}

export const gameSchema = new mongoose.Schema<Game>({
  date: { type: Date, default: Date.now },
  idiom_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Idiom', required: true },
  players_results: [playerResultSchema]
});

export const GameModel = mongoose.model<Game>('Game', gameSchema);

