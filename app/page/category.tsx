import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import { ThemedText } from '../components/themed-text';
import { tokenStorage } from '../storage';
import { ColorContext } from './ColorContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
//export const API_URL = "http://127.0.0.1:8000";

export default function CategoryContent() {
  const { colors } = useContext(ColorContext);
  const navigation = useNavigation<any>();
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
      locations={[0, 0.35, 0.65, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
            <Ionicons name="menu" size={30} color="#000" />
          </Pressable>

          <Pressable onPress={() => navigation.navigate('MyPage')} style={styles.myButton}>
            <ThemedText style={styles.myText}>마이</ThemedText>
          </Pressable>
        </View>

        {/* 제목 */}
        <ThemedText style={styles.titleText}>카테고리</ThemedText>

        {/* + 버튼 */}
        <Pressable style={styles.addButton} onPress={handleAddBox}>
          <Ionicons name="add" size={40} color="#000" />
        </Pressable>

        {/* 회색 박스 목록 */}
        <ScrollView contentContainerStyle={styles.boxContainer} keyboardShouldPersistTaps="handled">
          {boxes.map(item => (
            <View key={item.id} style={styles.boxRow}>
              {/* 박스 선택 시 기본 노란 하이라이트 제거 */}
              <Pressable
                onPress={() => handleBoxPress(item.id)}
                android_ripple={{ color: 'transparent' }} // ✅ 노란 하이라이트 제거
                style={({ pressed }) => [
                  { opacity: pressed ? 0.8 : 1 }, // 눌렀을 때 살짝 투명하게만
                ]}
              >
                <View style={[styles.dynamicBox, { width: Math.max(100, item.text.length * 18 + 40) }]}>
                  {item.editing ? (
                    <TextInput
                      style={styles.input}
                      placeholder="입력"
                      placeholderTextColor="#999"
                      value={item.text}
                      onChangeText={text => handleTextChange(item.id, text)}
                      onBlur={() => handleSaveEdit(item.id, item.text)}
                      maxLength={13}
                      autoFocus={item.editing}
                    />
                  ) : (
                    <ThemedText style={styles.input}>{item.text || '입력'}</ThemedText>
                  )}
                </View>
              </Pressable>

              {item.editing && (
                <Pressable
                  onPressIn={() => handleDeleteBox(item.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="close" size={24} color="#000" />
                </Pressable>
              )}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingHorizontal: 10,

  },

  menuButton: {
    position: 'absolute',
    left: 10,
    top: 15,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  myButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  myText: {
    color: '#000',
    fontWeight: '600', // ThemedText에서 fontFamily가 적용됩니다.
  },

  titleText: {
    fontSize: 25,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginVertical: 10,
  }, // ThemedText에서 fontFamily가 적용됩니다.

  addButton: {
    position: 'absolute',
    right: 30,
    top: 150,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
  },

  boxContainer: {
    paddingTop: 80,
    alignItems: 'flex-start',
    paddingHorizontal: 50,
  },

  boxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  dynamicBox: {
    minHeight: 53,
    backgroundColor: '#f6f6f6',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#ccc'
  },

  input: {
    fontSize: 21,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    paddingVertical: 6,
    fontFamily: 'Cafe24Ssurround', // TextInput과 Text에 공통으로 폰트 적용
  },

  deleteButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
});
