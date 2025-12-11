import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation, useRouter } from 'expo-router';
import React from 'react'; 
import { Pressable, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { ThemedText } from './themed-text';

interface AppHeaderProps {
  title: string;
  headerStyle?: ViewStyle; 
  titleStyle?: TextStyle;
  leftIcon?: 'menu' | 'arrow-back'; 
}

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
      <Pressable onPress={handleLeftPress} style={styles.menuButton}>
        <Ionicons name={leftIcon} size={28} color="#000" />
      </Pressable>
      <ThemedText style={[styles.headerTitle, titleStyle]}>{title}</ThemedText>
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
    borderBottomColor: '#DEE2E610', 
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