import { Stack } from 'expo-router';
import { ColorProvider } from './ColorContext';

export default function PageLayout() {
  return (
    <ColorProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="drawer" options={{ headerShown: false }} />
        <Stack.Screen name="inventory" options={{ headerShown: false }} />
      </Stack>
    </ColorProvider>
  );
}
