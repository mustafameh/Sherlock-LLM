import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getSecret(): Buffer {
    const secret = process.env.API_KEY_SECRET;
    if (!secret) throw new Error('API_KEY_SECRET env var is not set');
    return crypto.createHash('sha256').update(secret).digest();
}

export function encryptApiKey(plainText: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getSecret(), iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

export function decryptApiKey(cipherText: string): string {
    const [ivHex, encrypted] = cipherText.split(':');
    if (!ivHex || !encrypted) throw new Error('Invalid encrypted format');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getSecret(), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
