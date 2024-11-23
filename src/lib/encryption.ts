const ENCRYPTION_KEY = 'togpt-secure-storage-key';

export function encryptData(data: string): string {
  try {
    // Simple XOR encryption for demo purposes
    // In production, use a proper encryption library
    return data
      .split('')
      .map((char) =>
        String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(0))
      )
      .join('');
  } catch (error) {
    console.error('Encryption failed:', error);
    return data; // Fallback to unencrypted data
  }
}

export function decryptData(encryptedData: string): string {
  try {
    // Decryption is the same as encryption with XOR
    return encryptData(encryptedData);
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedData; // Return original data if decryption fails
  }
}