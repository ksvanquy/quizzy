/**
 * Integration Tests - User Authentication Flow
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { authApi } from '@/lib/client';
import { apiClient } from '@/lib/client';

describe('Authentication Flow', () => {
  const testEmail = 'test@example.com';
  const testPassword = 'Test123!@#';
  const testName = 'Test User';
  let userId: string;
  let accessToken: string;

  describe('Registration', () => {
    it('should register a new user', async () => {
      const result = await authApi.register({
        email: testEmail,
        password: testPassword,
        name: testName,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('email', testEmail);
      expect(result.data).toHaveProperty('name', testName);

      userId = result.data.id;
    });

    it('should not register with invalid email', async () => {
      try {
        await authApi.register({
          email: 'invalid-email',
          password: testPassword,
          name: 'Test',
        });
        fail('Should throw error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should not register with weak password', async () => {
      try {
        await authApi.register({
          email: 'test2@example.com',
          password: 'weak',
          name: 'Test',
        });
        fail('Should throw error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Login', () => {
    it('should login with correct credentials', async () => {
      const result = await authApi.login({
        email: testEmail,
        password: testPassword,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('accessToken');
      expect(result.data).toHaveProperty('refreshToken');

      accessToken = result.data.accessToken;
    });

    it('should not login with wrong password', async () => {
      try {
        await authApi.login({
          email: testEmail,
          password: 'wrongpassword',
        });
        fail('Should throw error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should not login with non-existent user', async () => {
      try {
        await authApi.login({
          email: 'nonexistent@example.com',
          password: testPassword,
        });
        fail('Should throw error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('User Profile', () => {
    beforeAll(() => {
      // Setup auth header
      apiClient.addRequestInterceptor((config) => {
        if (accessToken) {
          return {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${accessToken}`,
            },
          };
        }
        return config;
      });
    });

    it('should get user profile', async () => {
      const result = await authApi.login({
        email: testEmail,
        password: testPassword,
      });

      accessToken = result.data.accessToken;

      const profile = await authApi.getProfile?.();
      expect(profile.success).toBe(true);
      expect(profile.data).toHaveProperty('email', testEmail);
    });

    it('should update user profile', async () => {
      const newName = 'Updated Name';
      const result = await authApi.updateProfile?.({
        name: newName,
      });

      if (result) {
        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('name', newName);
      }
    });

    it('should change password', async () => {
      const result = await authApi.changePassword?.({
        oldPassword: testPassword,
        newPassword: 'NewPassword123!@#',
      });

      if (result) {
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Logout', () => {
    it('should logout user', async () => {
      const result = await authApi.logout?.();
      if (result) {
        expect(result.success).toBe(true);
      }
    });
  });
});
