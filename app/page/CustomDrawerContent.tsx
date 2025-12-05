import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '../components/themed-text';

export default function CustomDrawerContent({ userName, ...props }: any) {
  const insets = useSafeAreaInsets();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      <View style={styles.drawerHeader}>
        <View style={styles.profileContainer}>
          <Image
            source={require('../../assets/images/item/rabbit_logo.png')}
            style={styles.profileImage}
          />
        </View>
        <ThemedText style={styles.userText}>{userName || 'User'}님</ThemedText>
        <ThemedText style={styles.welcomeText}>오늘도 힘내세요! 🍀</ThemedText>
      </View>

      <View style={styles.menuContainer}>
        <DrawerItem
          label="오늘의 할 일"
          labelStyle={styles.label}
          onPress={() => props.navigation.navigate('Home')}
          icon={({ size }) => <Ionicons name="time-outline" size={size} color='#1f7aeb' />}
        />
        <DrawerItem
          label="카테고리"
          labelStyle={styles.label}
          onPress={() => props.navigation.navigate('Category')}
          icon={({ size }) => <Ionicons name="menu-outline" size={size} color='#1f7aeb' />}
        />

        <View style={styles.divider} />
        <ThemedText style={styles.sectionTitle}>커스터마이징</ThemedText>

        <DrawerItem
          label="마이페이지"
          labelStyle={styles.label}
          onPress={() => props.navigation.navigate('MyPage')}
          icon={({ size }) => <MaterialIcons name="emoji-emotions" size={size} color='#1f7aeb' />}
        />

        <View style={styles.divider} />
        <ThemedText style={styles.sectionTitle}>설정</ThemedText>

        <DrawerItem
          label="계정 정보"
          labelStyle={styles.label}
          onPress={() => props.navigation.navigate('Info')}
          icon={({ size }) => <Ionicons name="person-outline" size={size} color='#1f7aeb' />}
        />

        <DrawerItem
          label="테마 설정"
          labelStyle={styles.label}
          onPress={() => props.navigation.navigate('Option')}
          icon={({ size }) => <Ionicons name="color-palette-outline" size={size} color='#1f7aeb' />}
        />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 24,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    alignItems: 'center',
  },
  profileContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  userText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Cafe24Ssurround',
  },
  welcomeText: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    fontFamily: 'Cafe24Ssurround',
  },
  menuContainer: {
    paddingHorizontal: 8,
  },
  label: {
    color: '#333',
    fontFamily: 'Cafe24Ssurround',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
    marginHorizontal: 16,
  },
  sectionTitle: {
    marginLeft: 16,
    marginVertical: 8,
    color: '#aaa',
    fontSize: 12,
    fontWeight: '700',
  },
});