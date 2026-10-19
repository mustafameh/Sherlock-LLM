import mongoose, { Schema, Model } from 'mongoose';

/**
 * Token usage of the free trial (requests made with the app's own OpenRouter key).
 * One document per bucket, keyed by string id:
 *   anon:<cookie id>          lifetime usage of one browser
 *   ip:<hashed ip>:<day>      daily usage of one network (backstop for cleared cookies)
 *   global:<day>              daily usage across everyone (spend cap)
 */
export interface ITrialUsage {
    _id: string;
    tokens: number;
    costUsd: number;
    requests: number;
    expiresAt: Date;
}

const TrialUsageSchema = new Schema<ITrialUsage>({
    _id: { type: String, required: true },
    tokens: { type: Number, default: 0 },
    costUsd: { type: Number, default: 0 },
    requests: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
}, { versionKey: false });

TrialUsageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TrialUsage: Model<ITrialUsage> = mongoose.models.TrialUsage || mongoose.model<ITrialUsage>('TrialUsage', TrialUsageSchema);

export default TrialUsage;
