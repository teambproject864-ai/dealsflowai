export class HermesEncryption {
  private static readonly ENCRYPTION_PREFIX = 'hermes_encrypted_';

  /**
   * Encrypt memory content
   */
  static encrypt(content: string): string {
    // In production, use proper AES encryption
    // For demo purposes, we use base64 encoding
    const encoded = btoa(unescape(encodeURIComponent(content)));
    return `${this.ENCRYPTION_PREFIX}${encoded}`;
  }

  /**
   * Decrypt memory content
   */
  static decrypt(encryptedContent: string): string {
    if (!encryptedContent.startsWith(this.ENCRYPTION_PREFIX)) {
      return encryptedContent;
    }
    
    const encoded = encryptedContent.slice(this.ENCRYPTION_PREFIX.length);
    return decodeURIComponent(escape(atob(encoded)));
  }
}
