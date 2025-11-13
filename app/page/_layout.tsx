import { Stack } from 'expo-router';
import { useState } from 'react';
import { ColorContext } from './ColorContext';

export default function PageLayout() {
  const [colors, setColors] = useState(['#FFD8A9', '#FFF5E1', '#FFF5E1', '#FFD8A9']);

  return (
    <ColorContext.Provider value={{ colors, setColors }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 
        app/page/ 디렉토리 내의 화면들을 Stack Navigator로 그룹화합니다.
        헤더는 기본적으로 숨깁니다.
      */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="drawer" options={{ headerShown: false }} />
        <Stack.Screen name="inventory" options={{ headerShown: false }} />
      </Stack>
    </ColorContext.Provider>
  );
}
