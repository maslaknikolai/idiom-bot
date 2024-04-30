import mongoose from 'mongoose';

export interface AppConfig {
  idiomId?: mongoose.Types.ObjectId;
  dateActivated?: Date;
}

const appConfigSchema = new mongoose.Schema({
  idiomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Idiom' },
  dateActivated: { type: Date }
});

export const AppConfigModel = mongoose.model<AppConfig>('AppConfig', appConfigSchema);
