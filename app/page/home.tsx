import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ThemedText } from '../components/themed-text';
import { tokenStorage } from '../storage';
import { useUserStore } from '../store/userStore';
import AlarmPage from './alarm';
import CategoryContent from './category';
import { ColorContext } from './ColorContext';
import MyPageScreen from './mypage';
import TodosScreen from './todos';

// 🥕 백엔드 서버 주소.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://16.176.233.151';

const Drawer = createDrawerNavigator();

function formatMonthYear(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  categories: Category[];
  date?: string;
};

type Category = { id: number; text: string; color?: string; };

function HomeContent() {
  // 🥕 userStore에서 fetchUserData 함수를 가져옵니다.
  const { fetchUserData } = useUserStore();

  const { colors } = React.useContext(ColorContext);
  const navigation = useNavigation<any>();
  const flatListRef = useRef<FlatList<number>>(null);
  const today = new Date();

  const screenWidth = Dimensions.get('window').width;
  const visibleCount = 8;
  const spacing = 4;
  const horizontalPadding = 16;
  const totalSpacing = spacing * (visibleCount - 1);
  const itemWidth = (screenWidth - totalSpacing - horizontalPadding) / visibleCount;

  const TOTAL_DAYS = 100000;
  const CENTER_INDEX = Math.floor(TOTAL_DAYS / 2);

  const [selected, setSelected] = useState<Date>(today);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [focusTodoId, setFocusTodoId] = useState<number | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [currentTodos, setCurrentTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | number>('all');
  const [actionTodo, setActionTodo] = useState<Todo | null>(null);
  const [categorySelectVisible, setCategorySelectVisible] = useState(false);

  const categoryColors = [
  '#FFE0A3',
  '#A3D8FF',
  '#FFA3A3',
  '#C8FFA3',
  '#E3A3FF',
  '#FFD1A3',
  '#A3FFE0',
  ];

  const [coloredCategories, setColoredCategories] = useState<Category[]>([]);

  const colorMap = Object.fromEntries(
    coloredCategories.map(cat => [cat.id, cat.color])
  );


  useEffect(() => {
    if (categories.length > 0) {
      // 색상 배열 복사 후 섞기
      const shuffled = [...categoryColors].sort(() => Math.random() - 0.5);

      // categories 각각에 색상 부여
      const result = categories.map((cat, index) => ({
        ...cat,
        color: shuffled[index % shuffled.length], // 색상 부족하면 순환
      }));

      setColoredCategories(result);
    }
  }, [categories]);


  // 인증 헤더
  const getAuthHeaders = async () => {
    const token = await tokenStorage.getItem();
    console.log('[home.tsx] token:', token ? 'exists' : 'missing');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const getDateFromIndex = (index: number) => {
    const diff = index - CENTER_INDEX;
    const date = new Date(today);
    date.setDate(today.getDate() + diff);
    return date;
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  };

  // 날짜별 할일 조회
  const fetchTodosByDate = async (date: Date) => {
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${API_URL}/todos/`, {
        headers,
        params: { target_date: formatDate(date) },
      });

      const todos: Todo[] = res.data;

      // ⭐ 여기서 color 입혀주기
      const mapped = todos.map(todo => ({
        ...todo,
        categories: todo.categories.map(cat => {
          const colored = coloredCategories.find(c => c.id === cat.id);
          return colored ? { ...cat, color: colored.color } : cat;
        })
      }));

      setCurrentTodos(mapped || []);
    } catch (err) {
      console.error('[fetchTodosByDate] error:', err);
      setCurrentTodos([]);
    }
  };

  // 카테고리 조회
  const fetchCategories = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${API_URL}/categories/`, { headers });
      setCategories(res.data || []);
    } catch (err) {
      console.error('[fetchCategories] error:', err);
    }
  };

  // 최초 및 날짜 변경 시 목록 갱신
  useEffect(() => {
    fetchTodosByDate(selected);
  }, [selected]);

  // 화면 포커스 시 카테고리 갱신
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchCategories);
    return unsubscribe;
  }, [navigation]);

  const handleSelectDate = (index: number) => {
    const date = getDateFromIndex(index);
    setSelected(date);
    scrollToIndex(index);
  };

  const handleGoToday = () => {
    setSelected(today);
    scrollToIndex(CENTER_INDEX);
  };

  // 할일 추가
  const handleAddTodo = async () => {
    try {
      const headers = await getAuthHeaders();
      // 🥕 선택된 카테고리가 'all'이 아니면 해당 카테고리 ID를 포함시킵니다.
      const payload: { title: string; date: string; category_ids?: number[] } = {
        title: '새 할일',
        date: formatDate(selected),
      };
      if (selectedCategory !== 'all') {
        payload.category_ids = [selectedCategory];
      }
      const res = await axios.post(`${API_URL}/todos/`, payload, { headers });
      const created: Todo = res.data;
      setCurrentTodos(prev => [...prev, created]);
      setEditingTodoId(created.id);
    } catch (err) {
      console.error('[handleAddTodo] error:', err);
      if (Platform.OS === 'web') window.alert('할일 추가에 실패했습니다.');
      else Alert.alert('오류', '할일 추가에 실패했습니다.');
    }
  };

  // 완료 토글
  const handleCheck = async (id: number, currentCompleted: boolean) => {
    setCurrentTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !currentCompleted } : t)));
    try {
      const headers = await getAuthHeaders();
      await axios.put(`${API_URL}/todos/${id}/`, { completed: !currentCompleted }, { headers });
      // 🥕 할일 완료/해제 성공 시, 유저 데이터를 다시 불러와 당근 개수를 업데이트합니다.
      await fetchUserData();
    } catch (err) {
      console.error('[handleCheck] error:', err);
      // 롤백
      setCurrentTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: currentCompleted } : t)));
      if (Platform.OS === 'web') window.alert('상태 변경 실패');
      else Alert.alert('오류', '상태 변경 실패');
    }
  };

  // 제목 저장
  const saveTodo = async (id: number, newTitle: string) => {
    try {
      const headers = await getAuthHeaders();
      await axios.put(`${API_URL}/todos/${id}/`, { title: newTitle }, { headers });
      setCurrentTodos(prev => prev.map(t => (t.id === id ? { ...t, title: newTitle } : t)));
    } catch (err) {
      console.error('[saveTodo] error:', err);
      if (Platform.OS === 'web') window.alert('할일 수정 실패');
      else Alert.alert('오류', '할일 수정 실패');
    }
  };

  // 편집 중 입력값 로컬 업데이트
  const handleTextInputChange = (id: number, newTitle: string) => {
    if (newTitle.length > 14) return;
    setCurrentTodos(prev => prev.map(t => (t.id === id ? { ...t, title: newTitle } : t)));
  };

  // 수정 포커스
  useEffect(() => {
    if (editingTodoId !== null) {
      const timer = setTimeout(() => setFocusTodoId(editingTodoId), 100);
      return () => clearTimeout(timer);
    }
  }, [editingTodoId]);

  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      locations={[0, 0.3, 0.7, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* 상단 헤더 (개선) */}
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.toggleDrawer()}
              style={styles.menuButton}
            >
              <Ionicons name="menu" size={30} color="#000" />
            </Pressable>
            <ThemedText style={styles.dateText}>
              {today.getMonth() + 1}. {today.getDate()}. ({['일','월','화','수','목','금','토'][today.getDay()]})
            </ThemedText>
            <Pressable
              onPress={() => navigation.navigate('MyPage')}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#aaa',
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <Image
                source={require('../../assets/images/item/rabbit_logo.png')} // ✅ 여기에 저장한 파일 경로
                style={{
                  width: 40,
                  height: 40,
                  resizeMode: 'cover',
                }}
              />
            </Pressable>  
          </View>

          {/* 무한 달력 */}
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Pressable onPress={handleGoToday} style={styles.goTodayButton}>
                <ThemedText style={styles.goTodayText}>오늘</ThemedText>
              </Pressable>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <ThemedText style={styles.monthText}>{formatMonthYear(selected)}</ThemedText>
              </View>
              <View style={{ width: 60 }} />
            </View>

            <FlatList<number>
              ref={flatListRef}
              data={Array.from({ length: TOTAL_DAYS }).map((_, i) => i)}
              horizontal // 💡 keyExtractor는 문자열을 반환해야 합니다.
              keyExtractor={(item) => item.toString()}
              initialScrollIndex={CENTER_INDEX}
              getItemLayout={(_, index) => ({
                length: itemWidth + spacing,
                offset: (itemWidth + spacing) * index,
                index,
              })}
              renderItem={({ item: index }) => {
                const item = getDateFromIndex(index);
                const isSelected = item.toDateString() === selected.toDateString();
                return (
                  <Pressable
                    onPress={() => handleSelectDate(index)}
                    style={[
                      styles.dateButton,
                      { width: itemWidth },
                      isSelected && styles.dateButtonSelected,
                    ]}
                  >
                    <ThemedText style={[styles.weekdayText, isSelected && styles.weekdaySelected]}>
                      {['일','월','화','수','목','금','토'][item.getDay()]}
                    </ThemedText>
                    <ThemedText style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>
                      {item.getDate()}
                    </ThemedText>
                  </Pressable>
                );
              }}
              showsHorizontalScrollIndicator={false}
            />
            <View style={{ alignItems: 'center', marginTop: 3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ThemedText style={{ fontSize: 18, color: '#333', fontWeight: '700' }}>
                  {currentTodos.filter(todo => !todo.completed).length}
                </ThemedText>
                <Ionicons name="checkmark-outline" size={22} color="#000" />
              </View>
            </View>
          </View>

          {/* 카테고리 바 */}
          <View style={{ height: 45 }}>
            <FlatList
              data={[{ id: -1, text: 'ALL', color: '#fff' } as Category, ...coloredCategories]}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => String(item.id)}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 10, gap: 10 }}
              renderItem={({ item }) => {
                const isAll = item.id === -1;
                const isSelected = (isAll && selectedCategory === 'all') || (!isAll && selectedCategory === item.id);

                return (
                  <Pressable onPress={() => setSelectedCategory(isAll ? 'all' : item.id)}>
                    <View
                      style={[
                        styles.categoryBox,
                        isAll
                          ? {
                              width: 80,
                              backgroundColor: isSelected ? '#1f7aeb' : '#fff',
                              borderColor: '#000',
                              borderWidth: 1,
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 3 },
                              shadowOpacity: 0.4,
                              shadowRadius: 3,
                              elevation: 5,
                            }
                          : {
                              width: Math.max(80, item.text.length * 18 + 40),
                              backgroundColor: isSelected ? '#1f7aeb' : item.color, 
                            },
                      ]}
                    >
                      <Text style={[styles.categoryText, { color: isSelected ? '#fff' : '#000' }]}>
                        {item.text}
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>

          {/* 할일 관리 */}
          <View style={{ flex: 1 }}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Pressable style={styles.addButton} onPress={handleAddTodo}>
                <MaterialIcons name="add" size={20} color="#000" />
              </Pressable>
            </View>

            <FlatList
              style={{ flex: 1 }}
              data={
                selectedCategory === 'all'
                  ? currentTodos
                  : currentTodos.filter(todo => todo.categories.some(cat => cat.id === selectedCategory))
              }
              keyExtractor={(item) => item.id.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isEditing = editingTodoId === item.id;

                return (
                  <View style={[
                    styles.item,
                    item.categories.length > 0
                      ? {
                          borderLeftWidth: 8,
                          borderLeftColor: coloredCategories.find(c => c.id === item.categories[0].id)?.color || '#ccc',
                        }
                      : {
                          borderLeftWidth: 0,  // 카테고리 없으면 띠 제거
                        },
                  ]}>
                    {isEditing ? (
                      <TextInput
                        style={[styles.itemTitle, { flex: 1, borderBottomWidth: 1, borderColor: '#aaa' }]}
                        value={item.title}
                        onChangeText={(text) => handleTextInputChange(item.id, text)}
                        onBlur={() => {
                          saveTodo(item.id, item.title);
                          setEditingTodoId(null);
                          setFocusTodoId(null);
                        }}
                        ref={(ref) => {
                          if (ref && focusTodoId === item.id) ref.focus();
                        }}
                      />
                    ) : (
                      <ThemedText
                        style={[
                          styles.itemTitle,
                          item.completed && { textDecorationLine: 'line-through', color: '#888' },
                        ]}
                      >
                        {item.title}
                      </ThemedText>
                    )}

                    {item.categories && item.categories.length > 0 && (
                      <View style={{ flexDirection: 'row', marginTop: 2, marginLeft: 10, gap: 6, flexWrap: 'wrap' }}>
                        {item.categories.map(({ id, text }) => (
                          <View key={id} style={{ paddingHorizontal: 6, paddingVertical: 2, backgroundColor: '#FFE0A3', borderRadius: 6 }}>
                            <ThemedText style={{ fontSize: 13, color: '#1f7aeb' }}>{text}</ThemedText>
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={{ flexDirection: 'row', marginLeft: 'auto', gap: 8, alignItems: 'center' }}>
                      {!isEditing && (
                        <Pressable
                          style={styles.editButton}
                          onPress={() => {
                            setActionTodo(item);
                            setActionModalVisible(true);
                          }}
                        >
                          <Ionicons name="information-circle-outline" size={27} color="black" />
                        </Pressable>
                      )}

                      <Pressable
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: '#1f7aeb',
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: item.completed ? '#1f7aeb' : 'transparent',
                        }}
                        onPress={() => handleCheck(item.id, item.completed)}
                      >
                        {item.completed && <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>✓</ThemedText>}
                      </Pressable>
                    </View>
                  </View>
                );
              }}
            />
          </View>

          {/* 하단 모달 */}
          <Modal
            visible={actionModalVisible}
            transparent
            animationType="none"
            onRequestClose={() => setActionModalVisible(false)}
          >
            <Pressable
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
              onPress={() => setActionModalVisible(false)}
            />

            <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>
              <View
                style={{
                  backgroundColor: '#f6f6f6',
                  borderRadius: 20,
                  marginHorizontal: 15,
                  paddingVertical: 10,
                  marginBottom: 8,
                }}
              >
                {/* 수정하기 */}
                <Pressable
                  style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => {
                    if (actionTodo) {
                      setActionModalVisible(false);
                      setEditingTodoId(actionTodo.id);
                    }
                  }}
                >
                  <Ionicons name="pencil-outline" size={20} color="blue" style={{ marginRight: 10 }} />
                  <ThemedText style={{ fontSize: 17, color: 'blue' }}>수정하기</ThemedText>
                </Pressable>

                <View style={{ height: 1, backgroundColor: '#ccc', width: '100%', marginVertical: 4 }} />

                {/* 카테고리 설정 */}
                <Pressable
                  style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => {
                    setActionModalVisible(false);
                    setCategorySelectVisible(true);
                  }}
                >
                  <Ionicons name="book-outline" size={20} color="green" style={{ marginRight: 10 }} />
                  <ThemedText style={{ fontSize: 17, color: 'green' }}>카테고리 설정</ThemedText>
                </Pressable>

                <View style={{ height: 1, backgroundColor: '#ccc', width: '100%', marginVertical: 4 }} />

                {/* 알림 설정 */}
                <Pressable
                  style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => {
                    setActionModalVisible(false);
                    // 🥕 알람 페이지로 이동 시, 현재 할 일의 ID를 파라미터로 전달합니다.
                    if (actionTodo) {
                      navigation.navigate('Alarm', { todoId: actionTodo.id, todoTitle: actionTodo.title });
                    }
                  }}
                >
                  <Ionicons name="notifications-outline" size={20} color="black" style={{ marginRight: 10 }} />
                  <ThemedText style={{ fontSize: 17, color: 'black' }}>알림 설정</ThemedText>
                </Pressable>

                <View style={{ height: 1, backgroundColor: '#ccc', width: '100%', marginVertical: 4 }} />

                {/* 삭제하기 */}
                <Pressable
                  style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                  onPress={async () => {
                    if (!actionTodo) return;
                    try {
                      const headers = await getAuthHeaders(); 
                      await axios.delete(`${API_URL}/todos/${actionTodo.id}/`, { headers });
                      setCurrentTodos(prev => prev.filter(t => t.id !== actionTodo.id));
                    } catch (err) {
                      console.error('[deleteTodo] error:', err);
                      if (Platform.OS === 'web') window.alert('삭제 실패');
                      else Alert.alert('오류', '삭제 실패');
                    } finally {
                      setActionModalVisible(false);
                    }
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="red" style={{ marginRight: 10 }} />
                  <ThemedText style={{ fontSize: 17, color: 'red' }}>삭제하기</ThemedText>
                </Pressable>
              </View>

              {/* 하단 취소 버튼 */}
              <View
                style={{
                  backgroundColor: '#f6f6f6',
                  borderRadius: 20,
                  marginHorizontal: 15,
                  marginBottom: 15,
                }}
              >
                <Pressable
                  style={{ paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => setActionModalVisible(false)}
                >
                  <ThemedText style={{ fontSize: 17, color: '#000' }}>취소</ThemedText>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* 카테고리 선택 모달 */}
          <Modal
            visible={categorySelectVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setCategorySelectVisible(false)}
          >
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setCategorySelectVisible(false)} />

            <View
              style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                backgroundColor: '#fff',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingVertical: 20,
                maxHeight: 400,
              }}
            >
              <ThemedText style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>카테고리 관리</ThemedText>

              <ScrollView style={{ marginTop: 12 }}>
                {categories.map(cat => (
                  <Pressable
                    key={cat.id}
                    style={{ paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#eee' }}
                    onPress={async () => {
                      if (!actionTodo) return;
                      const currentIds = actionTodo.categories.map(c => c.id);
                      const nextIds = currentIds.includes(cat.id)
                        ? currentIds.filter(id => id !== cat.id)
                        : [...currentIds, cat.id];

                      try {
                        const headers = await getAuthHeaders();
                        await axios.put(`${API_URL}/todos/${actionTodo.id}/`, { category_ids: nextIds }, { headers });
                        await fetchTodosByDate(selected);
                      } catch (err) {
                        console.error('[update categories] error:', err);
                        if (Platform.OS === 'web') window.alert('카테고리 업데이트 실패');
                        else Alert.alert('오류', '카테고리 업데이트 실패');
                      }
                    }}
                  >
                    <ThemedText style={{ fontSize: 16 }}>
                      {cat.text} {actionTodo?.categories.some(c => c.id === cat.id) ? '✅' : ''}
                    </ThemedText>
                  </Pressable>
                ))}

                {/* 카테고리 초기화 */}
                <Pressable
                  style={{ paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center', marginTop: 10, backgroundColor: '#eee', borderRadius: 10 }}
                  onPress={async () => {
                    if (!actionTodo) return;
                    try {
                      const headers = await getAuthHeaders();
                      await axios.put(`${API_URL}/todos/${actionTodo.id}/`, { category_ids: [] }, { headers });
                      await fetchTodosByDate(selected);
                    } catch (err) {
                      console.error('[clear categories] error:', err);
                      if (Platform.OS === 'web') window.alert('카테고리 초기화 실패');
                      else Alert.alert('오류', '카테고리 초기화 실패');
                    }
                  }}
                >
                  <ThemedText style={{ fontSize: 16 }}>카테고리 초기화</ThemedText>
                </Pressable>
              </ScrollView>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// -------------------- 사용자 정보 수정 컴포넌트 --------------------
function InformationContent({ userName, setUserName }: { userName: string; setUserName: (v: string) => void }) {
  const navigation = useNavigation<any>();
  const [localName, setLocalName] = useState(userName);
  const { colors } = React.useContext(ColorContext);
  const [email, setEmail] = useState(''); // 이메일 상태 추가


  const getAuthHeaders = async () => {
    const token = await tokenStorage.getItem();
    console.log('[home.tsx] token:', token ? 'exists' : 'missing');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await axios.get(`${API_URL}/users/me/`, { headers });
        if (res.data) {
          if (res.data.name) {
            setUserName(res.data.name);
            setLocalName(res.data.name);
          }
          if (res.data.email) {
            setEmail(res.data.email); // 이메일 상태 업데이트
          }
        }
      } catch (err) {
        console.error('[fetchUserName] error:', err);
      }
    };
    fetchUserName();
  }, []);

  const handleLogout = () => {
    console.log('로그아웃 클릭됨');
    router.replace('/');
  };

  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      locations={[0, 0.3, 0.7, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* 상단 헤더 */}
          <View style={styles.header}>
            <Pressable onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
              <Ionicons name="menu" size={30} color="#000" />
            </Pressable>
            <ThemedText style={{ fontSize: 23, fontWeight: '500', color: '#000' }}>설정</ThemedText>
            <View style={{ width: 28 }} />
          </View>

          <ThemedText style={{ fontSize: 25, fontWeight: '600', color: '#000', marginLeft: 15, marginTop: 10 }}>
            계정 정보
          </ThemedText>

          <View style={{ height: 2, backgroundColor: '#000', marginVertical: 8 }} />

          <View style={{ paddingHorizontal: 16, gap: 16 }}>
            <ThemedText style={{ fontSize: 16, fontWeight: '800', color: '#555', marginTop: 20 }}>이메일</ThemedText>
            <View style={styles.infoBox}>
              <Text style={{ fontSize: 16, color: '#000' }}>{email}</Text>
            </View>

            <View>
              <ThemedText style={{ fontSize: 16, fontWeight: '800', color: '#555', marginTop: 20 }}>이름</ThemedText>
              <TextInput
                style={{
                  height: 50,
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  marginTop: 8,
                  fontSize: 16,
                  color: '#000',
                }}
                value={localName}
                onChangeText={setLocalName}
                placeholder="이름 입력"
              />

              <Pressable
                style={{
                  backgroundColor: '#1f7aeb',
                  paddingVertical: 14,
                  borderRadius: 10,
                  alignItems: 'center',
                  marginTop: 50,
                }}
                onPress={() => {
                  setUserName(localName); // Drawer에 반영
                }}
              >
                <ThemedText style={{ color: '#fff', fontSize: 18, fontWeight: '600', }}>저장</ThemedText>
              </Pressable>
              
            </View>
          </View>

          <View style={{ paddingHorizontal: 80, marginTop: 10 }}>
            <Pressable
              onPress={handleLogout}
              style={{
                backgroundColor: '#ff4d4f',
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <ThemedText style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>로그아웃</ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function OptionContent() {
  const { colors, setColors } = React.useContext(ColorContext);
  const navigation = useNavigation<any>();

  const gradients = [
    ['#ffafb2ff', '#ffe0d7ff', '#ffe0d7ff', '#ffafb2ff'], // 분홍
    ['#FFD8A9', '#FFF5E1', '#FFF5E1', '#FFD8A9'], // 기본(주황)
    ['#fcff51ff', '#f8ffaaff', '#f8ffaaff', '#fcff51ff'], // 노랑
    ['#51ff44ff', '#c6ffa3ff', '#c6ffa3ff', '#51ff44ff'], // 초록
    ['#5ffff4ff', '#d2fffcff', '#d2fffcff', '#5ffff4ff'], // 하늘
    ['#b7b8ffff', '#dbf2fcff', '#dbf2fcff', '#b7b8ffff'], // 파랑
    ['#FBC2EB', '#fae6f9ff', '#fae6f9ff', '#FBC2EB'], // 보라
    ['#b5b4b4ff', '#f6f6f6', '#f6f6f6', '#b5b4b4ff'], // 회색
    ['#fff'], // 흰색
  ];

  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      locations={[0, 0.3, 0.7, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* 상단 헤더 */}
          <View style={styles.header}>
            <Pressable onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
              <Ionicons name="menu" size={30} color="#000" />
            </Pressable>
            <ThemedText style={{ fontSize: 23, fontWeight: '500', color: '#000' }}>설정</ThemedText>
            <View style={{ width: 28 }} />
          </View>

          {/* 타이틀 */}
          <ThemedText style={{ fontSize: 25, fontWeight: '600', color: '#000', marginLeft: 15, marginTop: 10 }}>
            배경 색상 선택
          </ThemedText>
          <View style={{ height: 2, backgroundColor: '#000', marginVertical: 8 }} />

          {/* 색상 옵션 (3x2 그리드) */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-start', // ✅ 위쪽으로 정렬
                alignItems: 'center',
                marginTop: 80, // ✅ 위쪽 여백 (값은 조정 가능)
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 15,
                  width: '90%',
                }}
              >
                {gradients.map((grad, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => setColors(grad)}
                    style={{
                      width: '30%',
                      aspectRatio: 2.2,
                      borderRadius: 12,
                      overflow: 'hidden', // ✅ 그라데이션이 모서리 밖으로 안 나가게
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowOffset: { width: 0, height: 2 },
                      shadowRadius: 5,
                      elevation: 3,
                      borderWidth: 1,
                      borderColor: '#000',
                    }}
                  >
                    {/* 색상 미리보기 */}
                    <LinearGradient
                      colors={grad as [string, string, ...string[]]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <ThemedText
                        style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: grad.length === 1 ? '#000' : '#333',
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6,
                        }}
                      >
                        색상 {idx + 1}
                      </ThemedText>
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>  
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}


// -------------------- CustomDrawerContent --------------------
function CustomDrawerContent({ userName, ...props }: any) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
      <View style={styles.drawerHeader}>
        <ThemedText style={styles.userText}>{userName}</ThemedText>
      </View>

      <DrawerItem
        label="오늘의 할 일"
        labelStyle={{ color: 'black', fontFamily: 'Cafe24Ssurround' }}
        onPress={() => props.navigation.navigate('Home')}
        icon={({ size }) => <Ionicons name="time-outline" size={size} color='blue' />}
      />

      <DrawerItem
        label="카테고리"
        labelStyle={{ color: 'black', fontFamily: 'Cafe24Ssurround' }}
        onPress={() => props.navigation.navigate('Category')}
        icon={({ size }) => <Ionicons name="menu-outline" size={size} color='blue' />}
      />

      <View style={{ height: 1, backgroundColor: '#aaa', marginVertical: 8, marginBottom: 15 }} />

      <ThemedText style={{ marginLeft: 16, marginBottom: 5, color: '#000', fontWeight: '600' }}>커스터마이징</ThemedText>

      <DrawerItem
        label="마이페이지"
        labelStyle={{ color: 'black', fontFamily: 'Cafe24Ssurround' }}
        onPress={() => props.navigation.navigate('MyPage')}
        icon={({ size }) => <MaterialIcons name="emoji-emotions" size={size} color='blue' />}
      />

      <View style={{ height: 1, backgroundColor: '#aaa', marginVertical: 8, marginBottom: 15 }} />

      <ThemedText style={{ marginLeft: 16, marginBottom: 5, color: '#000', fontWeight: '600' }}>설정</ThemedText>

      <DrawerItem
        label="계정 정보"
        labelStyle={{ color: 'black', fontFamily: 'Cafe24Ssurround' }}
        onPress={() => props.navigation.navigate('Info')}
        icon={({ size }) => <Ionicons name="person-outline" size={size} color='blue' />}
      />

      <DrawerItem
        label="테마"
        labelStyle={{ color: 'black', fontFamily: 'Cafe24Ssurround' }}
        onPress={() => props.navigation.navigate('Option')}
        icon={({ size }) => <Ionicons name="settings-outline" size={size} color='blue' />}
      />
    </DrawerContentScrollView>
  );
}

// -------------------- Drawer 루트 --------------------
export default function AppDrawer() {
  const [userName, setUserName] = useState('User');

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} userName={userName} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Home" component={HomeContent} />
      <Drawer.Screen name="Todos" component={TodosScreen} />
      <Drawer.Screen name="MyPage" component={MyPageScreen} />
      <Drawer.Screen name="Category" component={CategoryContent} />
      <Drawer.Screen name="Option" component={OptionContent} />
      <Drawer.Screen name="Info">
        {(props) => <InformationContent {...props} userName={userName} setUserName={setUserName} />}
      </Drawer.Screen>
      <Drawer.Screen name="Alarm" component={AlarmPage} />
    </Drawer.Navigator>
  );
}

// -------------------- 스타일 --------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 24 },
  header: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 0 },
  dateText: { fontSize: 24, fontWeight: '700', color: '#000', marginLeft: 15, fontFamily: 'Cafe24Ssurround' },
  drawerHeader: { padding: 16, marginBottom: 8 },
  userText: { fontSize: 20, fontWeight: 'bold', color: '#000', marginTop: 15 },
  menuButton: { marginRight: 8 },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#aaa',
  },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, marginBottom: 8 },
  monthText: { fontSize: 19, fontWeight: '700', fontFamily: 'Cafe24Ssurround' },
  goTodayButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 7 },
  goTodayText: { fontSize: 14, fontWeight: '600', fontFamily: 'Cafe24Ssurround' },
  dateButton: {
    width: 52,
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D2691E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  dateButtonSelected: { backgroundColor: '#1f7aeb22', borderColor: '#1f7aeb' },
  dateNumber: { fontSize: 16, fontWeight: '700', color: '#111', fontFamily: 'Cafe24Ssurround' },
  dateNumberSelected: { color: '#1f7aeb' },
  weekdayText: { fontSize: 14, fontWeight: '600', color: '#000', fontFamily: 'Cafe24Ssurround' },
  weekdaySelected: { color: '#1f7aeb', fontWeight: '600' },
  input: { height: 56, marginTop: 12, paddingHorizontal: 16, fontSize: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  addButton: { height: 30, width: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderRadius: 30, borderWidth: 3, borderColor: '#000' },
  item: {
    width: '100%',
    padding: 20,
    backgroundColor: '#f6f6f6',
    borderRadius: 8,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  itemTitle: { fontSize: 19, fontWeight: '600', fontFamily: 'Cafe24Ssurround' },
  editButton: { backgroundColor: '#fff', width: 25, height: 25, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  deleteButton: { backgroundColor: '#ff4d4f', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: '600' },
  infoBox: {
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
    fontSize: 16,
    color: '#000',
    textAlignVertical: 'center',
    lineHeight: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    paddingHorizontal: 5,
    gap: 10,
    backgroundColor: '#000',
  },
  categoryBox: {
    height: 40,
    backgroundColor: '#FFE0A3',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#8e8e8eff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  categoryText: { fontSize: 20, fontWeight: '700', color: '#000', textAlign: 'center', fontFamily: 'Cafe24Ssurround' },
});
