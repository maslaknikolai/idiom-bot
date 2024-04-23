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
}

const idiomSchema = new mongoose.Schema<Idiom>({
  text: { type: String, required: true },
  image_url: { type: String },
  meaning_options: [optionSchema],
  usage_options: [optionSchema]
});

export const Idiom = mongoose.model<Idiom>('Idiom', idiomSchema);

