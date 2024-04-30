import mongoose from 'mongoose';

interface Option {
  text: string;
  is_correct: boolean;
}

const optionSchema = new mongoose.Schema<Option>({
  text: { type: String, required: true },
  is_correct: { type: Boolean, required: true }
});

interface Idiom {
  text: string;
  image_url?: string;
  meaning_options: Option[];
  usage_options: Option[];
  is_used: boolean;
}

const idiomSchema = new mongoose.Schema<Idiom>({
  text: { type: String, required: true },
  image_url: { type: String },
  meaning_options: [optionSchema],
  usage_options: [optionSchema],
  is_used: { type: Boolean, required: true }
});

export const IdiomModel = mongoose.model<Idiom>('Idiom', idiomSchema);

