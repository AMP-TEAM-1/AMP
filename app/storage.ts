import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const tokenStorage = {

  async setItem(token: string): Promise<void> {
    if (Platform.OS !== 'web') {
      return SecureStore.setItemAsync('authToken', token);
    }
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