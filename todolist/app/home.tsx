import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, View, Text, Pressable, FlatList, StyleSheet, TextInput, Dimensions, Modal, ScrollView} from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CategoryContent from './category';
import MyPageScreen from './mypage';

const Drawer = createDrawerNavigator();

function formatMonthYear(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

// -------------------- HomeContent (원본 기능 유지) --------------------
function HomeContent() {
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
  const [todos, setTodos] = useState<{ [key: string]: { id: number; title: string; checked: boolean; categoryId?: number | 'all' }[] }>({});
  const [newTodo, setNewTodo] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [focusTodoId, setFocusTodoId] = useState<number | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionTodo, setActionTodo] = useState<{ id: number; title: string } | null>(null);
  const [categorySelectVisible, setCategorySelectVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | number>('all');
  const [newCategory, setNewCategory] = useState('');


  const selectedKey = selected.toDateString();
  const currentTodos = todos[selectedKey] || [];

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

  const [categories, setCategories] = useState<{ id: number; text: string }[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await AsyncStorage.getItem('categories');
      if (data) setCategories(JSON.parse(data));
    };
    loadCategories();

    // ✅ 화면 전환 시마다 갱신되도록 리스너 추가
    const unsubscribe = navigation.addListener('focus', loadCategories);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: CENTER_INDEX, animated: false, viewPosition: 0.5 });
    }, 150);
  }, []);

  const handleSelectDate = (index: number) => {
    const date = getDateFromIndex(index);
    setSelected(date);
    scrollToIndex(index);
  };

  const handleGoToday = () => {
    setSelected(today);
    scrollToIndex(CENTER_INDEX);
  };

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    const newItem = { id: Date.now(), title: newTodo.trim(), checked: false };
    setTodos(prev => ({
      ...prev,
      [selectedKey]: [...(prev[selectedKey] || []), newItem],
    }));
    setNewTodo('');
    setShowInput(false);
  };

  const handleCheck = (id: number) => {
    setTodos(prev => ({
      ...prev,
      [selectedKey]: (prev[selectedKey] || []).map(todo =>
        todo.id === id ? { ...todo, checked: !todo.checked } : todo
      ),
    }));
  };

  const handleEditTodo = (id: number, newTitle: string) => {
    setTodos(prev => ({
      ...prev,
      [selectedKey]: (prev[selectedKey] || []).map(todo =>
        todo.id === id ? { ...todo, title: newTitle } : todo
      ),
    }));
  };

  const handleAddCategory = () => {
  if (!newCategory.trim()) return;
  setCategories((prev) => [
    ...prev,
    { id: Date.now(), text: newCategory.trim() },
  ]);
  setNewCategory('');
};

const handleDeleteCategory = (id: number) => {
  setCategories((prev) => prev.filter((cat) => cat.id !== id));
};

  // ------------------- 수정 포커스 useEffect -------------------
  useEffect(() => {
    if (editingTodoId !== null) {
      const timer = setTimeout(() => {
        setFocusTodoId(editingTodoId);
      }, 100); // 렌더 후 포커스
      return () => clearTimeout(timer);
    }
  }, [editingTodoId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <View style={styles.container}>
        {/* 달력 헤더 */}
        <View style={{ height: 50, justifyContent: 'center', alignItems: 'center' }}>
          {/* 오늘 날짜 중앙 */}
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#000' }}>
            {today.getMonth() + 1}. {today.getDate()}. ({['일','월','화','수','목','금','토'][today.getDay()]})
          </Text>

          {/* 왼쪽 메뉴 버튼 */}
          <Pressable
            onPress={() => navigation.toggleDrawer()}
            style={{ position: 'absolute', left: 0, top: 0, width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}
          >
            <Ionicons name="menu" size={30} color="#000" />
          </Pressable>

          {/* 오른쪽 마이페이지 버튼 */}
          <Pressable
            onPress={() => navigation.navigate('MyPage')}
            style={{
              position: 'absolute',
              right: 0,
              top: 5,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#aaa',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 8,
            }}
          >
            <Text style={{ color: '#000', fontWeight: '600' }}>마이</Text>
          </Pressable>
        </View>


        {/* 무한 달력 */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Pressable onPress={handleGoToday} style={styles.goTodayButton}>
              <Text style={styles.goTodayText}>오늘</Text>
            </Pressable>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.monthText}>{formatMonthYear(selected)}</Text>
            </View>
            <View style={{ width: 60 }} />
          </View>

          <FlatList<number>
            ref={flatListRef}
            data={Array.from({ length: TOTAL_DAYS })}
            horizontal
            keyExtractor={(_, index) => index.toString()}
            initialScrollIndex={CENTER_INDEX}
            getItemLayout={(_, index) => ({
              length: itemWidth + spacing,
              offset: (itemWidth + spacing) * index,
              index,
            })}
            renderItem={({ index }) => {
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
                  <Text style={[styles.weekdayText, isSelected && styles.weekdaySelected]}>
                    {['일','월','화','수','목','금','토'][item.getDay()]}
                  </Text>
                  <Text style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>
                    {item.getDate()}
                  </Text>
                </Pressable>
              );
            }}
            showsHorizontalScrollIndicator={false}
          />
          <View style={{ alignItems: 'center', marginTop: 3, }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 18, color: '#333', fontWeight: '700' }}>
                {currentTodos.length}
              </Text>
              <Ionicons name="checkmark-outline" size={22} color="#000" />
            </View>
          </View>
        </View>

        <View style={{ height: 50, marginTop: 10 }}>
          <FlatList
            data={[{ id: 'all', text: 'ALL', isAll: true }, ...categories]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            style={{
              flexGrow: 0,       // ✅ 세로로 확장 금지
            }}
            contentContainerStyle={{
              alignItems: 'center', // ✅ 높이 고정된 범위 내 중앙 정렬
              paddingHorizontal: 10,
              gap: 10,
            }}
            renderItem={({ item }) => {
              const isSelected =
                ('isAll' in item && selectedCategory === 'all') ||
                (!('isAll' in item) && selectedCategory === item.id);

                return (
                  <Pressable
                    onPress={() =>
                      setSelectedCategory('isAll' in item ? 'all' : item.id)
                    }
                  >
                    <View
                      style={[
                        styles.categoryBox,
                        'isAll' in item
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
                              backgroundColor: isSelected ? '#1f7aeb' : '#FFE0A3',
                            },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          { color: isSelected ? '#fff' : '#000' },
                        ]}
                      >
                        {item.text}
                      </Text>
                    </View>
                  </Pressable>
                )
            }}
          />
        </View>



        {/* 할일 관리 */}
        <View style={{ flex: 1 }}>
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Pressable style={styles.addButton} onPress={() => setShowInput(prev => !prev)}>
              <MaterialIcons name="add" size={20} color="#000" />
            </Pressable>
          </View>

          {showInput && (
            <TextInput
              style={styles.input}
              placeholder="새 할일 입력"
              value={newTodo}
              onChangeText={(text) => {
                if (text.length <= 14) setNewTodo(text);
              }}
              onSubmitEditing={handleAddTodo}
              placeholderTextColor="#888"
            />
          )}

          <FlatList
            style={{ flex: 1 }}
            data={
              selectedCategory === 'all'
                ? currentTodos
                : currentTodos.filter(todo => Number(todo.categoryId) === Number(selectedCategory))
            }

            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isEditing = editingTodoId === item.id;

              return (
                <View style={styles.item}>
                  {isEditing ? (
                    <TextInput
                      style={[styles.itemTitle, { flex: 1, borderBottomWidth: 1, borderColor: '#aaa' }]}
                      value={item.title}
                      onChangeText={(text) => {
                        if (text.length <= 14) handleEditTodo(item.id, text);
                      }}
                      onBlur={() => {
                        setEditingTodoId(null);
                        setFocusTodoId(null);
                      }}
                      ref={(ref) => {
                        if (ref && focusTodoId === item.id) {
                          ref.focus();
                        }
                      }}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.itemTitle,
                        item.checked && { textDecorationLine: 'line-through', color: '#888' },
                      ]}
                    >
                      {item.title}
                    </Text>
                  )}

                  {item.categoryId && (
                    <Text style={{ fontSize: 13, color: '#1f7aeb', marginTop: 2, marginLeft: 5 }}>
                      {categories.find(c => c.id === item.categoryId)?.text || ''}
                    </Text>
                  )}

                  <View style={{ flexDirection: 'row', marginLeft: 'auto', gap: 8, alignItems: 'center' }}>
                    {!isEditing && (
                      <Pressable
                        style={styles.editButton}
                        onPress={() => {
                          if (item) {
                            setActionTodo(item);
                            setActionModalVisible(true);
                          }
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
                        backgroundColor: item.checked ? '#1f7aeb' : 'transparent',
                      }}
                      onPress={() => handleCheck(item.id)}
                    >
                      {item.checked && <Text style={{ color: 'white', fontWeight: 'bold' }}>✓</Text>}
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
                <Text style={{ fontSize: 17, color: 'blue' }}>수정하기</Text>
              </Pressable>

              <View style={{ height: 1, backgroundColor: '#ccc', width: '100%', marginVertical: 4 }} />

              {/* 카테고리 설정 */}
              <Pressable
                style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => {
                  setActionModalVisible(false);
                  setCategorySelectVisible(true); // ✅ 카테고리 선택 모달 열기
                }}
              >
                <Ionicons name="book-outline" size={20} color="green" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 17, color: 'green' }}>카테고리 설정</Text>
              </Pressable>

              <View style={{ height: 1, backgroundColor: '#ccc', width: '100%', marginVertical: 4 }} />

              {/* 알림 설정 */}
              <Pressable
                style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => {}}
              >
                <Ionicons name="notifications-outline" size={20} color="black" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 17, color: 'black' }}>알림 설정</Text>
              </Pressable>

              <View style={{ height: 1, backgroundColor: '#ccc', width: '100%', marginVertical: 4 }} />

              {/* 삭제하기 */}
              <Pressable
                style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => {
                  if (actionTodo) {
                    setTodos(prev => ({
                      ...prev,
                      [selectedKey]: (prev[selectedKey] || []).filter(
                        todo => todo.id !== actionTodo.id
                      ),
                    }));
                  }
                  setActionModalVisible(false);
                }}
              >
                <Ionicons name="trash-outline" size={20} color="red" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 17, color: 'red' }}>삭제하기</Text>
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
                <Text style={{ fontSize: 17, color: '#000' }}>취소</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* ✅ 카테고리 선택 모달 */}
        <Modal visible={categorySelectVisible} transparent animationType="fade" onRequestClose={() => setCategorySelectVisible(false)}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setCategorySelectVisible(false)} />

          <View style={{ position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 20, maxHeight: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>카테고리 관리</Text>

            {/* 카테고리 추가 */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10, height: 40 }}
                placeholder="새 카테고리 입력"
                value={newCategory}
                onChangeText={setNewCategory}
              />
              <Pressable style={{ marginLeft: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#1f7aeb', borderRadius: 8 }} onPress={handleAddCategory}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>추가</Text>
              </Pressable>
            </View>

            <ScrollView style={{ marginTop: 12 }}>
              {categories.map(cat => (
                <Pressable
                  key={cat.id}
                  style={{ paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#eee' }}
                  onPress={() => {
                    if (actionTodo) {
                      setTodos(prev => ({
                        ...prev,
                        [selectedKey]: (prev[selectedKey] || []).map(todo =>
                          todo.id === actionTodo.id ? { ...todo, categoryId: cat.id } : todo
                        ),
                      }));
                    }
                    setCategorySelectVisible(false);
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{cat.text}</Text>
                </Pressable>
              ))}

              {/* 카테고리 취소 */}
              <Pressable
                style={{ paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center', marginTop: 10, backgroundColor: '#eee', borderRadius: 10 }}
                onPress={() => {
                  if (actionTodo) {
                    setTodos(prev => ({
                      ...prev,
                      [selectedKey]: (prev[selectedKey] || []).map(todo =>
                        todo.id === actionTodo.id ? { ...todo, categoryId: undefined } : todo
                      ),
                    }));
                  }
                  setCategorySelectVisible(false);
                }}
              >
                <Text style={{ fontSize: 16 }}>카테고리 취소</Text>
              </Pressable>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// -------------------- InformationContent (이름 수정 가능) --------------------
function InformationContent({ userName, setUserName }: { userName: string; setUserName: (v: string) => void }) {
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    // 로그아웃 로직 작성 (예: 토큰 삭제, 로그인 화면 이동 등)
    console.log('로그아웃 클릭됨');
    router.replace('/');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <View style={styles.container}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
            <Ionicons name="menu" size={30} color="#000" />
          </Pressable>
          <Text style={{ fontSize: 23, fontWeight: '500', color: '#000' }}> 설정 </Text>
          <View style={{ width: 28 }} />
        </View>

        <Text style={{ fontSize: 25, fontWeight: '600', color: '#000', marginLeft: 15, marginTop: 10 }}>
          계정 정보
        </Text>

        {/* 구분선 */}
        <View style={{ height: 2, backgroundColor: '#000'}} />

        {/* 계정 정보 내용 */}
        <View style={{ paddingHorizontal: 16, gap: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#555', marginTop: 20 }}>이메일</Text>
          <View style={styles.infoBox}>
            <Text style={{ fontSize: 16, color: '#000' }}>user@example.com</Text>
          </View>

          <Text style={{ fontSize: 16, fontWeight: '800', color: '#555', marginTop: 10 }}>비밀번호</Text>
          <View style={styles.infoBox}>
            <Text style={{ fontSize: 16, color: '#000' }}>********</Text>
          </View>

          {/* 이름을 수정 가능한 TextInput으로 변경 (기본값 userName) */}
          <View>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#555', marginTop: 10 }}>이름</Text>
            <TextInput
              style={styles.infoBox}
              value={userName}
              onChangeText={(t) => setUserName(t)}
              placeholder="이름 입력"
              maxLength={30}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={{ paddingHorizontal: 80, marginTop: 30 }}>
          <Pressable
            onPress={handleLogout}
            style={{
              backgroundColor: '#ff4d4f',
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>로그아웃</Text>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}

// -------------------- CustomDrawerContent (userName 반영) --------------------
function CustomDrawerContent({ userName, ...props }: any) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
      <View style={styles.drawerHeader}>
        <Text style={styles.userText}>{userName}</Text>
      </View>

      <DrawerItem label="오늘의 할 일" onPress={() => props.navigation.navigate('Home')} />
      <DrawerItem label="카테고리" onPress={() => props.navigation.navigate('Category')} />

      <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 8 }} />
      <DrawerItem label="마이페이지" onPress={() => props.navigation.navigate('MyPage')} />

      <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 8 }} />

      <DrawerItem label="계정 정보" onPress={() => props.navigation.navigate('Info')} />
    </DrawerContentScrollView>
  );
}

// -------------------- Drawer 통합 및 userName 상태 관리 --------------------
export default function AppDrawer() {
  // 기본 이름은 'User' — InformationContent에서 변경하면 즉시 반영됩니다.
  const [userName, setUserName] = useState('User');

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} userName={userName} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Home" component={HomeContent} />
      <Drawer.Screen name="Category" component={CategoryContent} />
      <Drawer.Screen name="MyPage" component={MyPageScreen} />
      <Drawer.Screen name="Info">
        {(props) => <InformationContent {...props} userName={userName} setUserName={setUserName} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

// -------------------- 스타일 --------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 24, backgroundColor: '#fff' },
  header: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  dateText: { fontSize: 24, fontWeight: '700', color: '#000', marginLeft: 90 },
  drawerHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 8 },
  userText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
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
    borderColor: '#ccc'
  },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, marginBottom: 8 },
  monthText: { fontSize: 19, fontWeight: '700' },
  goTodayButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 7 },
  goTodayText: { fontSize: 14, fontWeight : '600' },
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
  dateNumber: { fontSize: 16, fontWeight: '700', color: '#111' },
  dateNumberSelected: { color: '#1f7aeb' },
  weekdayText: { fontSize: 14, fontWeight: '600', color: '#000' },
  weekdaySelected: { color: '#1f7aeb', fontWeight: '600' },
  input: { height: 56, marginTop: 12, paddingHorizontal: 16, fontSize: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff'},
  addButton: { height: 30, width: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderRadius: 30, borderWidth: 3, borderColor: '#000' },
  item: { width: '100%', padding: 20, backgroundColor: '#f6f6f6', borderRadius: 8, marginTop: 15, flexDirection: 'row', alignItems: 'center' },
  itemTitle: { fontSize: 19, fontWeight: '600' },
  editButton: { backgroundColor: '#fff', width: 25, height: 25, borderRadius: 18, justifyContent: 'center', alignItems: 'center',},
  deleteButton: { backgroundColor: '#ff4d4f', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: '600' },
  infoBox: {
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center', // 수직 가운데
    alignItems: 'flex-start', // 좌측 정렬
    fontSize: 16,
    color: '#000',
    textAlignVertical: 'center', // 안드로이드용
    lineHeight: 20, // iOS 보정
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  categoryText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
});
