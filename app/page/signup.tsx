import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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

// 백엔드 서버 주소
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function SignupScreen() {
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/signup/`, { email, password });
      Alert.alert('성공', '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      router.replace('/page/login');
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        Alert.alert('가입 실패', '이미 사용 중인 이메일입니다.');
      } else if (error.response && error.response.status === 422) {
        const errorDetail = error.response.data?.detail?.[0]?.msg || '입력 값이 유효하지 않습니다.';
        Alert.alert('가입 실패', errorDetail);
      } else {
        Alert.alert('가입 실패', '오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {/* 당근톤 그라데이션 배경 */}
      <LinearGradient
        colors={['#FFD8A9', '#FFF5E1', '#FFD8A9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >

        <Pressable
          onPress={() => router.push('/')}
          style={({ pressed }) => [
            styles.homeButton,
            pressed && { opacity: 0.6 },
          ]}
        >
          <Ionicons name="home-outline" size={width * 0.08} color="#FF8C42" />
        </Pressable>

        <ThemedView
          style={[
            styles.container,
            {
              backgroundColor: 'transparent',
              padding: width * 0.06,
              gap: height * 0.02,
            },
          ]}
        >
          <ThemedText
            type="title"
            style={[styles.title2, { marginLeft: width * 0.06, textAlign: 'left', alignSelf: 'flex-start' }]}
          >
            캐롯
          </ThemedText>
          <ThemedText
            type="title"
            style={[
              styles.title,
              { marginLeft: width * 0.06, marginBottom: height * 0.08, textAlign: 'left', alignSelf: 'flex-start' },
            ]}
          >
            가입하기
          </ThemedText>

          {/* 흰색 입력 영역 컨테이너 */}
          <View
            style={[
              styles.whiteBox,
              {
                width: width * 0.9,
                paddingVertical: height * 0.04,
                borderRadius: width * 0.07,
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  width: width * 0.75,
                  height: height * 0.06,
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
            <TextInput
              style={[
                styles.input,
                {
                  width: width * 0.75,
                  height: height * 0.06,
                  fontSize: width * 0.04,
                },
              ]}
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#888"
            />

            {/* 회원가입 버튼 */}
            <Pressable
              style={({ pressed }) => [
                styles.signupButton,
                {
                  width: width * 0.75,
                  height: height * 0.06,
                  marginTop: height * 0.05,
                  borderRadius: width * 0.08,
                },
                pressed && styles.signupButtonPressed,
              ]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText
                  style={[styles.signupButtonText, { fontSize: width * 0.04 }]}
                >
                  회원가입
                </ThemedText>
              )}
            </Pressable>
          </View>

          {/* 하단 로그인 유도 문구 */}
          <View style={[styles.loginContainer, { marginTop: height * 0.02 }]}>
            <ThemedText style={[styles.normalText, { fontSize: width * 0.035 }]}>
              이미 계정이 있으신가요?{' '}
            </ThemedText>
            <Link href="/page/login" asChild>
              <Pressable>
                <ThemedText style={[styles.loginText, { fontSize: width * 0.035 }]}>
                  로그인
                </ThemedText>
              </Pressable>
            </Link>
          </View>
        </ThemedView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
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
    alignItems: 'center',
  },
  whiteBox: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    opacity: 0.8
  },
  title: {
    textAlign: 'left',
    color: '#3A3A3A',
  },
  title2: {
    textAlign: 'left',
    color: '#FF8C42',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 20,
    fontFamily: 'Cafe24Ssurround',
  },
  signupButton: {
    backgroundColor: '#FFB347',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonPressed: {
    backgroundColor: '#D3D3D3',
  },
  signupButtonText: {
    color: '#000',
    textAlign: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  normalText: {
    color: '#000',
  },
  loginText: {
    color: '#FF8C42',
  },
});
