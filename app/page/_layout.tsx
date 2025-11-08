import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { Pressable } from 'react-native';

export default function PageLayout() {
  return (
    <Stack>
      {/*
        기본적으로 헤더를 숨기고, 각 스크린에서 필요에 따라 headerShown: true 및 옵션을 설정합니다.
        이렇게 하면 login, signup, drawer 등 headerShown: false를 원하는 화면들이
        개별적으로 Stack.Screen options를 설정할 필요가 없습니다.
      */}
      {/*<Stack.Screen name="drawer" options={{ headerShown: false }} />*/}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} /> 
      {/* mypage.tsx의 헤더를 숨기고 자체 헤더를 사용하도록 설정합니다. */}
      {/*<Stack.Screen name="mypage" options={{ headerShown: false }} />*/}
      <Stack.Screen name="modal" options={{ headerShown: false, presentation: 'modal' }} /> {/* app/page/modal.tsx가 이 스택 내의 모달로 사용될 경우 */}

      {/* todos.tsx의 헤더 옵션을 정의합니다. */}
      <Stack.Screen
        name="todos"
        options={{
          title: '할일 목록',
          headerShown: true,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ paddingLeft: 10 }}>
              {({ pressed }) => (
                <Ionicons name="arrow-back" size={28} color="black" style={{ opacity: pressed ? 0.5 : 1 }} />
              )}
            </Pressable>
          ),
          headerTitleStyle: { fontFamily: 'Jua' },
        }}
      />

      {/* todoDetail.tsx의 헤더 옵션을 정의합니다. */}
      <Stack.Screen
        name="todoDetail"
        options={{
          title: '할일 상세',
          headerShown: true,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ paddingLeft: 10 }}>
              {({ pressed }) => (
                <Ionicons name="arrow-back" size={28} color="black" style={{ opacity: pressed ? 0.5 : 1 }} />
              )}
            </Pressable>
          ),
          headerTitleStyle: { fontFamily: 'Jua' },
        }}
      />

      {/* inventory.tsx는 ItemListView 컴포넌트 내부에서 Stack.Screen 옵션을 정의하고 있으므로,
          여기서는 headerShown: false로 두어 ItemListView의 헤더가 적용되도록 합니다.
      */}
      <Stack.Screen name="inventory" options={{ headerShown: false }} />

      {/* mypage는 home.tsx의 Drawer에 포함되므로 여기서는 제거합니다. */}
      {/* mypage는 drawer 네비게이터의 자식 스크린이므로 여기서는 등록하지 않습니다. */}
    </Stack>
  );
}