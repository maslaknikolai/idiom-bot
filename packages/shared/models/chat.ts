import mongoose from 'mongoose';
import { gameSchema } from './game';
import { Document } from 'mongoose';

interface Player {
  id: string;
  name: string;
}

interface Chat extends Document {
  id: string;
  name: string;
  players: Player[];
  games: typeof gameSchema[];
}

const playerSchema = new mongoose.Schema<Player>({
  id: { type: String, ref: 'Player', required: true },
  name: { type: String, required: true }
});

const chatSchema = new mongoose.Schema<Chat>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  players: [playerSchema],
  games: [gameSchema]
});

export const ChatModel = mongoose.model<Chat>('Chat', chatSchema);


