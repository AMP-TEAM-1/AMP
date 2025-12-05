import { ThemedText } from '@/components/themed-text';
import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View
} from 'react-native';
import { tokenStorage } from '../storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function LoginScreen() {
  const { width, height } = useWindowDimensions();
  // 🥕 전역 스토어에서 사용자 데이터를 불러오는 함수를 가져옵니다.
  const { fetchUserData } = useUserStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setIsLoading(true);



    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    try {
      const response = await axios.post(`${API_URL}/login/`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token } = response.data;



      await tokenStorage.setItem(access_token);

      // 🥕 로그인 성공 후, 전역 스토어의 사용자 데이터를 즉시 갱신합니다.
      await fetchUserData();

      Alert.alert('성공', '로그인에 성공했습니다.');
      // 🥕 로그인 성공 후 drawer navigator의 기본 화면으로 이동하도록 경로를 수정합니다.
      router.replace('/page/drawer');
    } catch (error: any) {
      // 🕵️‍♂️ [로그] 에러 발생 시, 어떤 종류의 에러인지 상세하게 출력합니다.
      console.error('--- 로그인 에러 상세 정보 ---');
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          console.error('[에러 메시지]', error.message);
          Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
        } else if (error.response.status === 401) {

          Alert.alert('로그인 실패', '이메일 또는 비밀번호가 일치하지 않습니다.');
        } else {

          Alert.alert('서버 오류', `상태 코드: ${error.response.status}`);
        }
      } else {
        console.error('[에러 메시지]', error.message);
        Alert.alert('알 수 없는 오류', error.message);
      }

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ✅ 그라데이션 배경 */}
      <LinearGradient
        colors={['#FFD8A9', '#FFF5E1', '#FFD8A9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.container, { padding: width * 0.06 }]}
      >
        {/* 홈 버튼 */}
        <Pressable
          onPress={() => router.push('/')}
          style={({ pressed }) => [
            styles.homeButton,
            pressed && { opacity: 0.6 },
          ]}
        >
          <Ionicons name="home-outline" size={width * 0.08} color="#FF8C42" />
        </Pressable>

        {/* 상단 텍스트 */}
        <ThemedText
          style={[
            styles.slogan,
            {
              fontSize: width * 0.09,
              lineHeight: width * 0.1,
              marginBottom: height * 0.15,
              marginLeft: width * 0.06,
            },
          ]}
        >
          계정
        </ThemedText>

        {/* ✅ 흰색 박스 (입력창 + 버튼 포함) */}
        <View
          style={[
            styles.whiteBox,
            {
              width: width * 0.9,
              paddingVertical: height * 0.04,
              paddingHorizontal: width * 0.05,
              borderRadius: width * 0.05,
            },
          ]}
        >
          {/* 이메일 입력 */}
          <TextInput
            style={[
              styles.input,
              {
                width: '100%',
                height: height * 0.06,
                paddingHorizontal: width * 0.04,
                borderRadius: width * 0.08,
                fontSize: width * 0.04,
                marginBottom: height * 0.02,
              },
            ]}
            placeholder="이메일"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#888"
          />

          {/* 비밀번호 입력 */}
          <TextInput
            style={[
              styles.input,
              {
                width: '100%',
                height: height * 0.06,
                paddingHorizontal: width * 0.04,
                borderRadius: width * 0.08,
                fontSize: width * 0.04,
                marginBottom: height * 0.03,
              },
            ]}
            placeholder="비밀번호"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#888"
          />

          {/* 로그인 버튼 */}
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              {
                backgroundColor: pressed ? '#FFD27F' : '#FFB347',
                height: height * 0.06,
                borderRadius: width * 0.08,
              },
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText
                style={{
                  color: '#000',
                  fontSize: width * 0.04,
                  fontWeight: 'bold',
                }}
              >
                로그인
              </ThemedText>
            )}
          </Pressable>
        </View>

        {/* 회원가입 유도 문구 */}
        <View style={styles.signupContainer}>
          <ThemedText style={styles.normalText}>
            계정이 없으신가요?{' '}
          </ThemedText>
          <Link href="/page/signup" asChild>
            <Pressable>
              <ThemedText style={styles.signupText}>
                회원가입
              </ThemedText>
            </Pressable>
          </Link>
        </View>

      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  homeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: '#FFF',
    borderRadius: 100,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  slogan: {
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  whiteBox: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    fontFamily: 'Cafe24Ssurround',
  },
  loginButton: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF9F43',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  normalText: {
    color: '#000',
    fontWeight: 'bold',
  },
  signupText: {
    color: '#FF8C42',
    fontWeight: 'bold',
  },
});
