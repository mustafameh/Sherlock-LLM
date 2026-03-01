import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IChat extends Document {
    user_id: Types.ObjectId;
    title: string;
    preview: string;
    full_content: string;
    character: string;
    created_at: Date;
}

const ChatSchema = new Schema<IChat>({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    preview: { type: String, default: '' },
    full_content: { type: String, default: '[]' },
    character: { type: String, default: 'Dr. Watson' },
    created_at: { type: Date, default: Date.now },
});

const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);

export default Chat;
