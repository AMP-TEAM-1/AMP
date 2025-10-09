import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Alert, Button, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 재사용 가능한 InfoCard 컴포넌트 정의
type InfoCardProps = {
  title: string;
  children: React.ReactNode;
};

const InfoCard = ({ title, children }: InfoCardProps) => (
  <ThemedView style={styles.card}>
    <ThemedText type="subtitle" style={styles.blackText}>{title}</ThemedText>
    {children}
  </ThemedView>
);
export default function HomeScreen() {

  const handleLogout = async () => {
    if (Platform.OS !== 'web') {
      // 기기에 저장된 인증 토큰을 삭제합니다.
      await SecureStore.deleteItemAsync('authToken');
    }

    // 사용자에게 로그아웃 되었음을 알립니다.
    Alert.alert('로그아웃', '성공적으로 로그아웃되었습니다.');
    // 알림과 동시에 로그인 화면으로 즉시 이동합니다.
    router.replace('/');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.blackText}>My App</ThemedText>
          <ThemedText style={styles.blackText}>로그인되었습니다!</ThemedText>
        </ThemedView>

        <InfoCard title="환영합니다!">
          <ThemedText style={[styles.cardText, styles.blackText]}>
            이제 앱의 모든 기능을 자유롭게 이용할 수 있습니다.
          </ThemedText>
        </InfoCard>

        <InfoCard title="다음 단계">
          <ThemedText style={[styles.cardText, styles.blackText]}>- 프로필 정보 수정하기</ThemedText>
          <ThemedText style={[styles.cardText, styles.blackText]}>- 게시물 작성하기</ThemedText>
        </InfoCard>

        <Button title="로그아웃" onPress={handleLogout} color="#ff3b30" />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 24,
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    gap: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  blackText: { // 텍스트 색상을 검은색으로 강제 적용
    color: '#000',
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
