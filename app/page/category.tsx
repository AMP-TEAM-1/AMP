import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '../components/themed-text';
import { tokenStorage } from '../storage';
import { ColorContext } from './ColorContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;


export default function CategoryContent() {
  const { colors } = useContext(ColorContext);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [boxes, setBoxes] = useState<{ id: number; text: string; editing: boolean }[]>([]);
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = async () => {
    const token = await tokenStorage.getItem();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_URL}/categories/`, { headers });
      setBoxes(response.data.map((cat: any) => ({ ...cat, editing: false })));
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 박스 추가 시 자동 편집 모드로 생성.
  const handleAddBox = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.post(`${API_URL}/categories/`, { text: '새 카테고리' }, { headers });
      const newCategory = { ...response.data, editing: true };
      setBoxes(prev => [...prev.map(b => ({ ...b, editing: false })), newCategory]);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleTextChange = (id: number, newText: string) => {
    setBoxes(prev => prev.map(box => (box.id === id ? { ...box, text: newText } : box)));
  };

  const handleDeleteBox = async (id: number) => {
    try {
      const headers = await getAuthHeaders();
      await axios.delete(`${API_URL}/categories/${id}`, { headers });
      setBoxes(prev => prev.filter(box => box.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleBoxPress = (id: number) => {
    setBoxes(prev => prev.map(box => (box.id === id ? { ...box, editing: true } : { ...box, editing: false })));
  };

  const handleSaveEdit = async (id: number, text: string) => {
    try {
      const headers = await getAuthHeaders();
      await axios.put(`${API_URL}/categories/${id}`, { text }, { headers });
      setBoxes(prev => prev.map(box => (box.id === id ? { ...box, editing: false } : box)));
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchCategories); // 화면 이동 시 최신 값 로드
    return unsubscribe;
  }, [navigation]);

  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
            <Ionicons name="menu" size={28} color="#000" />
          </Pressable>

          <ThemedText style={styles.titleText}>카테고리</ThemedText>

          <Pressable onPress={() => navigation.navigate('MyPage')} style={styles.myButton}>
            <Image
              source={require('../../assets/images/item/rabbit_logo.png')}
              style={styles.profileImage}
            />
          </Pressable>
        </View>

        {/* 카테고리 리스트 */}
        <View style={styles.content}>
          <View style={styles.listHeader}>
            <ThemedText style={styles.listTitle}>내 카테고리</ThemedText>
            <Pressable style={styles.addButton} onPress={handleAddBox}>
              <Ionicons name="add" size={24} color="#fff" />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {boxes.map(item => (
              <View key={item.id} style={styles.categoryCard}>
                <Pressable
                  onPress={() => handleBoxPress(item.id)}
                  style={styles.categoryContent}
                >
                  {item.editing ? (
                    <TextInput
                      style={styles.input}
                      placeholder="카테고리 이름"
                      placeholderTextColor="#999"
                      value={item.text}
                      onChangeText={text => handleTextChange(item.id, text)}
                      onBlur={() => handleSaveEdit(item.id, item.text)}
                      maxLength={20}
                      autoFocus={item.editing}
                    />
                  ) : (
                    <ThemedText style={styles.categoryText}>{item.text || '카테고리'}</ThemedText>
                  )}
                </Pressable>

                {item.editing && (
                  <Pressable
                    onPress={() => handleDeleteBox(item.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </Pressable>
                )}
              </View>
            ))}

            {boxes.length === 0 && (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>카테고리가 없습니다</ThemedText>
                <ThemedText style={styles.emptySubText}>+ 버튼을 눌러 추가해보세요</ThemedText>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  menuButton: {
    padding: 8,
  },

  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212529',
    fontFamily: 'Cafe24Ssurround',
  },

  myButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },

  listTitle: {
    fontSize: 20,
    fontFamily: 'Cafe24Ssurround',
    color: '#212529',
    fontWeight: '600',
  },

  addButton: {
    backgroundColor: '#FF9F43',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9F43',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  categoryContent: {
    flex: 1,
  },

  input: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    fontFamily: 'Cafe24Ssurround',
    padding: 0,
  },

  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    fontFamily: 'Cafe24Ssurround',
  },

  deleteButton: {
    marginLeft: 12,
    padding: 8,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 16,
    color: '#6C757D',
    fontFamily: 'Cafe24Ssurround',
    marginBottom: 8,
  },

  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Cafe24Ssurround',
  },
});
