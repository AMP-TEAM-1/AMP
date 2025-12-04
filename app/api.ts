import { tokenStorage } from './storage';

/**
 * 백엔드 API 서버 주소. 환경 변수에서 가져오거나 기본값을 사용합니다.
 * Android 에뮬레이터: http://10.0.2.2:8000
 * iOS 시뮬레이터/실제 기기: PC의 로컬 IP 주소 (예: http://192.168.0.5:8000)
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * SecureStore에서 인증 토큰을 비동기적으로 가져와 API 요청 헤더를 생성합니다.
 */
export const getAuthHeaders = async () => {
  const token = await tokenStorage.getItem();
  return token ? { Authorization: `Bearer ${token}` } : {};
};