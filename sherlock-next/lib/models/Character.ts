import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ICharacter extends Document {
    user_id: Types.ObjectId;
    name: string;
    description: string;
    relationship: string;
    traits: string[];
    speakingStyle: string;
    sherlockApproach: string;
}

const CharacterSchema = new Schema<ICharacter>({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    relationship: { type: String, default: '' },
    traits: { type: [String], default: [] },
    speakingStyle: { type: String, default: '' },
    sherlockApproach: { type: String, default: '' },
});

// Custom characters belong to the user who made them; names only need to be unique per user.
CharacterSchema.index({ user_id: 1, name: 1 }, { unique: true });

const Character: Model<ICharacter> = mongoose.models.Character || mongoose.model<ICharacter>('Character', CharacterSchema);

export default Character;
