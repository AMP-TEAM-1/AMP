import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation, useRouter } from 'expo-router';
import React from 'react'; // ThemedText를 사용하기 위해 Text 임포트 제거
import { Pressable, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { ThemedText } from './themed-text';

interface AppHeaderProps {
  title: string;
  headerStyle?: ViewStyle; // prop 이름을 headerStyle로 변경하여 명확하게 합니다.
  titleStyle?: TextStyle;
  leftIcon?: 'menu' | 'arrow-back'; // 왼쪽 아이콘 타입을 지정합니다.
}

// 타입스크립트에서 useNavigation을 사용할 때 제네릭으로 타입을 지정하여
// navigation 객체가 openDrawer, toggleDrawer 등을 포함함을 명시합니다.
type Navigation = DrawerNavigationProp<any>;

export default function AppHeader({ title, headerStyle, titleStyle, leftIcon = 'menu' }: AppHeaderProps) {
  const navigation = useNavigation<Navigation>();
  const router = useRouter();

  const handleLeftPress = () => {
    if (leftIcon === 'menu') {
      navigation.toggleDrawer();
    } else if (leftIcon === 'arrow-back') {
      router.back();
    }
  };

  return (
    <View style={[styles.header, headerStyle]}>
      {/* 왼쪽 버튼 (메뉴 또는 뒤로가기) */}
      <Pressable onPress={handleLeftPress} style={styles.menuButton}>
        <Ionicons name={leftIcon} size={28} color="#000" />
      </Pressable>

      {/* 중앙 제목 */}
      <ThemedText style={[styles.headerTitle, titleStyle]}>{title}</ThemedText>

      {/* 오른쪽 정렬을 위한 공간 채우기 (메뉴 버튼과 동일한 너비) */}
      <View style={{ width: 28, marginRight: 4 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#DEE2E610', // 매우 연한 경계선
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    color: '#212529',
    fontFamily: 'Cafe24Ssurround',
    fontWeight: '600',
  },
});