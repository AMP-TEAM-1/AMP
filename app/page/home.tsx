import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MonthlyCalendar from '../components/Calendar/MonthlyCalendar';
import WeeklyCalendar from '../components/Calendar/WeeklyCalendar';
import CategoryBar from '../components/Common/CategoryBar';
import TodoActionModal from '../components/Todo/TodoActionModal';
import TodoList from '../components/Todo/TodoList';
import { ThemedText } from '../components/themed-text';
import { useCalendar } from '../hooks/useCalendar';
import { useTodos } from '../hooks/useTodos';

import { useUserStore } from '../store/userStore';
import { ColorContext } from './ColorContext';
import CustomDrawerContent from './CustomDrawerContent';
import InformationContent from './InformationContent';
import OptionContent from './OptionContent';
import AlarmPage from './alarm';
import CategoryContent from './category';
import MyPageScreen from './mypage';
import TodosScreen from './todos';

const Drawer = createDrawerNavigator();

function HomeContent() {
  const navigation = useNavigation<any>();
  const { fetchUserData } = useUserStore();
  const { colors } = React.useContext(ColorContext);

  // 1. 캘린더 훅 사용
  const {
    selectedDate,
    setSelectedDate,
    calendarViewMode,
    toggleViewMode,
    handlePrevMonth,
    handleNextMonth,
    handleGoToday,
    fadeAnim
  } = useCalendar();

  // 2. 투두 로직 훅 사용 (날짜가 바뀌면 목록도 갱신됨)
  const {
    todos,
    coloredCategories,
    addTodo,
    toggleTodo,
    updateTodoTitle,
    deleteTodo,
  } = useTodos(selectedDate);

  // 3. 로컬 UI 상태 (카테고리 선택, 모달 등)
  const [selectedCategory, setSelectedCategory] = useState<'all' | number>('all');
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedTodoAction, setSelectedTodoAction] = useState<any>(null);

  // 화면 포커스 시 유저 데이터 갱신 (당근 개수 등)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchUserData);
    return unsubscribe;
  }, [navigation]);

  // 카테고리 필터링
  const filteredTodos = selectedCategory === 'all'
    ? todos
    : todos.filter(t => t.categories.some(c => c.id === selectedCategory));

  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      locations={[0, 0.3, 0.7, 1]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>

          {/* --- 상단 헤더 --- */}
          <View style={styles.header}>
            <Pressable onPress={() => navigation.toggleDrawer()} style={styles.iconButton}>
              <Ionicons name="menu" size={28} color="#000" />
            </Pressable>

            <ThemedText style={styles.headerTitle}>
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
            </ThemedText>

            <Pressable onPress={() => navigation.navigate('MyPage')} style={styles.profileButton}>
              <Image
                source={require('../../assets/images/item/rabbit_logo.png')}
                style={styles.profileImage}
              />
            </Pressable>
          </View>

          {/* --- 캘린더 영역 (카드형 UI) --- */}
          <View style={styles.calendarCard}>
            <View style={styles.calendarControls}>
              <Pressable onPress={handleGoToday} style={styles.todayButton}>
                <ThemedText style={styles.todayText}>오늘</ThemedText>
              </Pressable>

              <Pressable onPress={toggleViewMode} style={styles.viewModeButton}>
                <Ionicons
                  name={calendarViewMode === 'horizontal' ? 'calendar-outline' : 'swap-horizontal'}
                  size={20} color="#555"
                />
              </Pressable>
            </View>

            {/* 애니메이션 적용된 캘린더 뷰 */}
            <Animated.View style={{ opacity: fadeAnim }}>
              {calendarViewMode === 'horizontal' ? (
                <WeeklyCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
              ) : (
                <MonthlyCalendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                />
              )}
            </Animated.View>

            {/* 하단 정보 (남은 할일) */}
            <View style={styles.calendarFooter}>
              <ThemedText style={styles.taskCount}>
                남은 할 일: {todos.filter(t => !t.completed).length}개
              </ThemedText>
            </View>
          </View>

          {/* --- 카테고리 바 --- */}
          <CategoryBar
            categories={coloredCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* --- 할 일 리스트 영역 --- */}
          <View style={styles.listContainer}>
            <View style={styles.listHeader}>
              <ThemedText style={styles.listTitle}>To-Do List</ThemedText>
              <Pressable
                style={styles.addButton}
                onPress={() => addTodo('새로운 할 일', selectedCategory)}
              >
                <MaterialIcons name="add" size={24} color="#fff" />
              </Pressable>
            </View>

            <TodoList
              todos={filteredTodos}
              editingId={editingTodoId}
              onToggle={(id, current) => {
                toggleTodo(id, current);
                fetchUserData(); // 완료 시 당근 업데이트
              }}
              onPressEditAction={(todo) => {
                setSelectedTodoAction(todo);
                setActionModalVisible(true);
              }}
              onChangeTitle={updateTodoTitle}
              onFinishEdit={() => setEditingTodoId(null)}
            />
          </View>

          {/* --- 액션 모달 --- */}
          <TodoActionModal
            visible={actionModalVisible}
            onClose={() => setActionModalVisible(false)}
            onEdit={() => {
              setEditingTodoId(selectedTodoAction?.id);
              setActionModalVisible(false);
            }}
            onCategorySetting={() => {
              Alert.alert('알림', '카테고리 설정은 상세 구현이 필요합니다.');
              setActionModalVisible(false);
            }}
            onAlarmSetting={() => {
              setActionModalVisible(false);
              navigation.navigate('Alarm', {
                todoId: selectedTodoAction?.id,
                todoTitle: selectedTodoAction?.title
              });
            }}
            onDelete={() => {
              if (selectedTodoAction) deleteTodo(selectedTodoAction.id);
              setActionModalVisible(false);
            }}
          />

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default function AppDrawer() {
  const [userName, setUserName] = useState('User'); // 필요시 userStore에서 가져오도록 수정 가능

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} userName={userName} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Home" component={HomeContent} />
      <Drawer.Screen name="MyPage" component={MyPageScreen} />
      <Drawer.Screen name="Category" component={CategoryContent} />
      <Drawer.Screen name="Todos" component={TodosScreen} />
      <Drawer.Screen name="Alarm" component={AlarmPage} />

      {/* 설정 및 테마 페이지 */}
      <Drawer.Screen name="Info">
        {(props) => <InformationContent {...props} userName={userName} setUserName={setUserName} />}
      </Drawer.Screen>
      <Drawer.Screen name="Option" component={OptionContent} />
    </Drawer.Navigator>
  );
}

// -------------------- Styles --------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Cafe24Ssurround',
    color: '#333',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },

  // 캘린더 카드 스타일 
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    elevation: 4,
    shadowColor: '#AEAEAE',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  calendarControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  todayButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  todayText: {
    fontSize: 12,
    fontFamily: 'Cafe24Ssurround',
    color: '#666',
  },
  viewModeButton: {
    padding: 4,
  },
  calendarFooter: {
    marginTop: 12,
    alignItems: 'center',
  },
  taskCount: {
    fontSize: 12,
    color: '#1f7aeb',
    fontWeight: 'bold',
  },

  // 리스트 영역
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  listTitle: {
    fontSize: 20,
    fontFamily: 'Cafe24Ssurround',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#1f7aeb',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#1f7aeb',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
  },
});