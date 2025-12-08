import crypto from 'crypto';

const algorithm = 'aes-256-gcm';

// Derive key from environment variable
const deriveKey = () => {
  const encryptionKey = process.env.ENCRYPTION_KEY || 'fallback-key-for-development-only-32chars';
  return crypto.scryptSync(encryptionKey, 'livyco-salt', 32);
};

const key = deriveKey();

export const encrypt = (text) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      data: encrypted,
      authTag: authTag.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

export const decrypt = (encryptedData) => {
  try {
    if (!encryptedData?.iv || !encryptedData?.data || !encryptedData?.authTag) {
      throw new Error('Invalid encrypted data structure');
    }

    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Encrypt sensitive data before storing
export const encryptSensitiveFields = (data, fieldsToEncrypt) => {
  const encryptedData = { ...data };
  
  fieldsToEncrypt.forEach(field => {
    if (encryptedData[field] && typeof encryptedData[field] === 'string') {
      const encrypted = encrypt(encryptedData[field]);
      if (encrypted) {
        encryptedData[field] = encrypted;
      }
    }
  });
  
  return encryptedData;
};

// Decrypt sensitive data after retrieval
export const decryptSensitiveFields = (data, fieldsToDecrypt) => {
  const decryptedData = { ...data };
  
  fieldsToDecrypt.forEach(field => {
    if (decryptedData[field] && 
        typeof decryptedData[field] === 'object' && 
        decryptedData[field].iv && 
        decryptedData[field].data) {
      const decrypted = decrypt(decryptedData[field]);
      if (decrypted) {
        decryptedData[field] = decrypted;
      }
    }
  });
  
  return decryptedData;
};