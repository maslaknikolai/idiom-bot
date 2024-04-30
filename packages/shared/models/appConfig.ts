import mongoose from 'mongoose';

export interface AppConfig {
  idiom_id?: mongoose.Types.ObjectId;
  idiom_updated_at?: Date;
}

const appConfigSchema = new mongoose.Schema({
  idiom_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Idiom' },
  idiom_updated_at: { type: Date }
});

export const AppConfigModel = mongoose.model<AppConfig>('AppConfig', appConfigSchema);
