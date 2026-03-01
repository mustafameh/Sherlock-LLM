import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICharacter extends Document {
    name: string;
    description: string;
    relationship: string;
    traits: string[];
    speakingStyle: string;
    sherlockApproach: string;
}

const CharacterSchema = new Schema<ICharacter>({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    relationship: { type: String, required: true },
    traits: { type: [String], default: [] },
    speakingStyle: { type: String, required: true },
    sherlockApproach: { type: String, required: true },
});

const Character: Model<ICharacter> = mongoose.models.Character || mongoose.model<ICharacter>('Character', CharacterSchema);

export default Character;
