import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const tokenStorage = {
  /**
   * 인증 토큰을 저장
   * @param token 저장할 토큰
   */
  async setItem(token: string): Promise<void> {
    if (Platform.OS !== 'web') {
      return SecureStore.setItemAsync('authToken', token);
    }
    // 웹 환경에서는 localStorage를 사용
    localStorage.setItem('authToken', token);
  },

  async getItem(): Promise<string | null> {
    if (Platform.OS !== 'web') {
      return SecureStore.getItemAsync('authToken');
    }
    return localStorage.getItem('authToken');
  },

  async removeItem(): Promise<void> {
    if (Platform.OS !== 'web') {
      return SecureStore.deleteItemAsync('authToken');
    }
    localStorage.removeItem('authToken');
  },
};