import mongoose from 'mongoose';
import { Game, gameSchema } from './game';
import { Document } from 'mongoose';

export interface Player {
  tg_id: number;
  name: string;
}

export interface Chat {
  tg_id: number;
  name: string;
  players: Player[];
  games: Game[];
}

export const playerSchema = new mongoose.Schema<Player>({
  tg_id: { type: Number, ref: 'Player', required: true },
  name: { type: String, required: true }
});

export const chatSchema = new mongoose.Schema<Chat & Document>({
  tg_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  players: [playerSchema],
  games: [gameSchema]
});

export const ChatModel = mongoose.model<Chat>('Chat', chatSchema);
