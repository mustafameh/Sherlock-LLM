import 'server-only';
import crypto from 'crypto';

const KEY_LENGTH = 64;
const PREFIX = 'scrypt';

function scrypt(password: string, salt: Buffer, keyLength: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, keyLength, (error, key) => (error ? reject(error) : resolve(key)));
    });
}

/** Salted scrypt hash, stored as `scrypt$<salt>$<hash>` (base64url). */
export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16);
    const hash = await scrypt(password, salt, KEY_LENGTH);
    return `${PREFIX}$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

/**
 * Checks a password against a stored hash. Accounts created before salted hashing have an
 * unsalted SHA-256 hex digest; those still log in, and `needsRehash` tells the caller to
 * replace the hash with a scrypt one.
 */
export async function verifyPassword(
    password: string,
    stored: string,
): Promise<{ valid: boolean; needsRehash: boolean }> {
    if (stored.startsWith(`${PREFIX}$`)) {
        const [, salt, hash] = stored.split('$');
        const expected = Buffer.from(hash ?? '', 'base64url');
        if (!salt || expected.length === 0) return { valid: false, needsRehash: false };
        const actual = await scrypt(password, Buffer.from(salt, 'base64url'), expected.length);
        return { valid: crypto.timingSafeEqual(actual, expected), needsRehash: false };
    }

    const legacy = crypto.createHash('sha256').update(password).digest();
    const expected = Buffer.from(stored, 'hex');
    const valid = expected.length === legacy.length && crypto.timingSafeEqual(legacy, expected);
    return { valid, needsRehash: valid };
}
