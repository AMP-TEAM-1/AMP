import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// 스플래시 스크린이 폰트 로딩 전에 자동으로 숨겨지는 것을 방지합니다.
// (이 프로젝트에서는 expo-splash-screen을 직접 사용하지 않지만, 모범 사례로 추가합니다.)
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Cafe24Ssurround: require('../assets/fonts/Cafe24Ssurround-v2.0.otf'),
  });

  useEffect(() => {
    if (fontError) throw fontError;
    if (fontsLoaded) {
      // 폰트가 로드되면 스플래시 스크린을 숨깁니다.
      // SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // 폰트가 로드되지 않았거나 에러가 있으면 아무것도 렌더링하지 않습니다.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
