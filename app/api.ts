import { tokenStorage } from './storage';

export const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const getAuthHeaders = async () => {
  const token = await tokenStorage.getItem();
  return token ? { Authorization: `Bearer ${token}` } : {};
};