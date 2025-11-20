import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import React from 'react'; // ThemedText를 사용하기 위해 Text 임포트 제거
import { Pressable, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { ThemedText } from './themed-text';

interface AppHeaderProps {
  title: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

// 타입스크립트에서 useNavigation을 사용할 때 제네릭으로 타입을 지정하여
// navigation 객체가 openDrawer, toggleDrawer 등을 포함함을 명시합니다.
type Navigation = DrawerNavigationProp<any>;

export default function AppHeader({ title, style, titleStyle }: AppHeaderProps) {
  const navigation = useNavigation<Navigation>();

  return (
    <View style={[styles.header, style]}>
      {/* Drawer 토글 버튼 */}
      <Pressable onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
        <Ionicons name="menu" size={28} color="#000" />
      </Pressable>

      {/* 중앙 제목 */}
      <ThemedText style={[styles.headerTitle, titleStyle]}>{title}</ThemedText>

      {/* 오른쪽 정렬을 위한 공간 채우기 (메뉴 버튼과 동일한 너비) */}
      <View style={{ width: 28 }} />
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
    backgroundColor: '#fff', // 배경색을 통일하여 확실한 구분
  },
  menuButton: {
    padding: 4, // 아이콘 주변에 터치 영역을 확보하고 여백을 줍니다.
  },
  headerTitle: { fontSize: 20, color: '#000' },
});