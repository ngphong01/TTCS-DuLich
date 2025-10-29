import { hashPassword, comparePassword, generateSessionToken, parseSessionToken } from '@/lib/simple-auth';

describe('Simple Auth', () => {
  describe('Password Hashing', () => {
    it('should hash and compare passwords correctly', async () => {
      const password = 'test123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
      
      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
      
      const isInvalid = await comparePassword('wrongpassword', hash);
      expect(isInvalid).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'test123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
      
      const isValid1 = await comparePassword(password, hash1);
      const isValid2 = await comparePassword(password, hash2);
      
      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
    });
  });

  describe('Session Token', () => {
    it('should generate valid session token', () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };
      
      const token = generateSessionToken(user);
      
      expect(token).toBeDefined();
      expect(token).toContain(user.id);
      expect(token.split('-')).toHaveLength(3);
    });

    it('should parse valid session token', () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };
      
      const token = generateSessionToken(user);
      const parsed = parseSessionToken(token);
      
      expect(parsed).toBeDefined();
      expect(parsed?.userId).toBe(user.id);
      expect(parsed?.timestamp).toBeDefined();
      expect(typeof parsed?.timestamp).toBe('number');
    });

    it('should return null for invalid session token', () => {
      const invalidTokens = [
        'invalid-token',
        'user123',
        'user123-timestamp',
        'user123-timestamp-random-extra',
        '',
      ];
      
      invalidTokens.forEach(token => {
        const parsed = parseSessionToken(token);
        expect(parsed).toBeNull();
      });
    });

    it('should return null for expired session token', () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };
      
      // Create token with old timestamp (8 days ago)
      const oldTimestamp = Date.now() - (8 * 24 * 60 * 60 * 1000);
      const expiredToken = `${user.id}-${oldTimestamp}-${Math.random().toString(36).substring(2)}`;
      
      const parsed = parseSessionToken(expiredToken);
      expect(parsed).toBeNull();
    });
  });
});
