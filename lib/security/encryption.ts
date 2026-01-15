import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const ITERATIONS = 100000

function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length < 32) {
    throw new Error("ENCRYPTION_KEY must be at least 32 characters")
  }
  return key
}

export function encrypt(text: string): string {
  try {
    const salt = crypto.randomBytes(SALT_LENGTH)
    const iv = crypto.randomBytes(IV_LENGTH)

    const key = crypto.pbkdf2Sync(getEncryptionKey(), salt, ITERATIONS, 32, "sha512")

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    const tag = cipher.getAuthTag()

    // Format: salt:iv:encrypted:tag
    return `${salt.toString("hex")}:${iv.toString("hex")}:${encrypted}:${tag.toString("hex")}`
  } catch (error) {
    throw new Error("Encryption failed")
  }
}

export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(":")
    if (parts.length !== 4) {
      throw new Error("Invalid encrypted data format")
    }

    const salt = Buffer.from(parts[0], "hex")
    const iv = Buffer.from(parts[1], "hex")
    const encrypted = parts[2]
    const tag = Buffer.from(parts[3], "hex")

    const key = crypto.pbkdf2Sync(getEncryptionKey(), salt, ITERATIONS, 32, "sha512")

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    throw new Error("Decryption failed")
  }
}

// Hash API keys for storage
export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex")
}

// Generate secure random API key
export function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex")
}
