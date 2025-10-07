import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { useState } from 'react'; // useState 추가
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native'; // ActivityIndicator 추가

GoogleSignin.configure({
  webClientId: '982837548937-k5iq8va9u6g4bkciq1hnjg6bf8hc2f4k.apps.googleusercontent.com',
});

export default function App() {
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  async function onGoogleButtonPress() {
    // 로딩 중이면 함수 실행을 막습니다.
    if (loading) return; 
    setLoading(true); // 로딩 시작

    try {
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
      console.log('Google 로그인 성공!');
    } catch (error) {
      console.error('로그인 오류:', error);
    } finally {
      setLoading(false); // 로그인 성공/실패와 관계없이 로딩 종료
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EAS 개발 빌드 구글 로그인</Text>
      <Button 
        title="Google로 로그인" 
        onPress={onGoogleButtonPress} 
        disabled={loading} // 로딩 중일 때 버튼 비활성화
      />
      {/* 로딩 중일 때만 로딩 인디케이터 표시 */}
      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  }
});