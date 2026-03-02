import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password_hash: string;
    displayName?: string;
    avatar?: string;
    apiKey?: string;
    selectedModel?: string;
    created_at: Date;
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    displayName: { type: String },
    avatar: { type: String, default: 'detective' },
    apiKey: { type: String },
    selectedModel: { type: String },
    created_at: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
