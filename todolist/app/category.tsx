import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function CategoryContent() {
  const navigation = useNavigation<any>();
  const [boxes, setBoxes] = useState<{ id: number; text: string; editing: boolean }[]>([]);

  // ✅ 박스 추가 시 자동 편집 모드로 생성
  const handleAddBox = () => {
    const newBox = { id: Date.now(), text: '', editing: true };
    setBoxes(prev =>
      prev.map(box => ({ ...box, editing: false })) // 기존 박스 편집 해제
    );
    setBoxes(prev => [...prev, newBox]);
  };

  const handleTextChange = (id: number, newText: string) => {
    setBoxes(prev =>
      prev.map(box =>
        box.id === id ? { ...box, text: newText } : box
      )
    );
  };

  const handleDeleteBox = (id: number) => {
    setBoxes(prev => prev.filter(box => box.id !== id));
  };

  const handleBoxPress = (id: number) => {
    setBoxes(prev =>
      prev.map(box =>
        box.id === id ? { ...box, editing: true } : { ...box, editing: false }
      )
    );
  };

  const handleCancelEdit = (id: number) => {
    setBoxes(prev =>
      prev.map(box =>
        box.id === id ? { ...box, editing: false } : box
      )
    );
  };

  useEffect(() => {
  AsyncStorage.setItem('categories', JSON.stringify(boxes));
  }, [boxes]);

  useEffect(() => {
    const loadCategories = async () => {
      const saved = await AsyncStorage.getItem('categories');
      if (saved) {
        setBoxes(JSON.parse(saved));
      }
    };
    loadCategories();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
          <Ionicons name="menu" size={30} color="#000" />
        </Pressable>

        <Pressable onPress={() => navigation.navigate('MyPage')} style={styles.myButton}>
          <Text style={styles.myText}>마이</Text>
        </Pressable>
      </View>

      {/* 제목 */}
      <Text style={styles.titleText}>카테고리</Text>

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
                    onBlur={() => handleCancelEdit(item.id)}
                    maxLength={13}
                    autoFocus={item.editing}
                  />
                ) : (
                  <Text style={styles.input}>{item.text || '입력'}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },

  menuButton: {
    position: 'absolute',
    left: 24,
    top: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  myButton: {
    position: 'absolute',
    right: 32,
    top: 29,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#aaa',
    justifyContent: 'center',
    alignItems: 'center',
  },

  myText: {
    color: '#000',
    fontWeight: '600',
  },

  titleText: {
    fontSize: 25,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginVertical: 10,
  },

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
    minHeight: 60,
    backgroundColor: '#ddd',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  input: {
    fontSize: 21,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    paddingVertical: 6,
  },

  deleteButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
});
