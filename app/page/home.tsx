import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Animated, Image, Pressable, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MonthlyCalendar from '../components/Calendar/MonthlyCalendar';
import WeeklyCalendar from '../components/Calendar/WeeklyCalendar';
import CategoryBar from '../components/Common/CategoryBar';
import CategorySelectionModal from '../components/Common/CategorySelectionModal';
import TodoActionModal from '../components/Todo/TodoActionModal';
import TodoList from '../components/Todo/TodoList';
import { ThemedText } from '../components/themed-text';

import { Colors } from '../constants/theme';
import { useCalendar } from '../hooks/useCalendar';
import { useTodos } from '../hooks/useTodos';
import { useUserStore } from '../store/userStore';
import { ColorContext } from './ColorContext';

import CustomDrawerContent from './CustomDrawerContent';
import InformationContent from './InformationContent';
import OptionContent from './OptionContent';
import CategoryContent from './category';
import MyPageScreen from './mypage';
import TodosScreen from './todos';

const Drawer = createDrawerNavigator();

function HomeContent() {
  const navigation = useNavigation<any>();
  const { fetchUserData } = useUserStore();
  const { colors } = React.useContext(ColorContext);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

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

  const {
    todos,
    coloredCategories,
    addTodo,
    toggleTodo,
    updateTodoTitle,
    deleteTodo,
    updateTodoCategory,
  } = useTodos(selectedDate);

  const [selectedCategory, setSelectedCategory] = useState<'all' | number>('all');
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedTodoAction, setSelectedTodoAction] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchUserData);
    return unsubscribe;
  }, [navigation]);

  const filteredTodos = selectedCategory === 'all'
    ? todos
    : todos.filter(t => t.categories.some(c => c.id === selectedCategory));

  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      locations={[0, 0.5, 1]}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View style={styles.container}>

          {/* [1] 상단 헤더 영역 - 날짜 포맷 변경 */}
          <View style={styles.header}>
            <Pressable onPress={() => navigation.toggleDrawer()} style={styles.iconButton}>
              <Ionicons name="menu" size={28} color={theme.text} />
            </Pressable>

            {/* 년도 월 일 형식으로 변경 */}
            <ThemedText style={styles.headerTitle}>
              {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
            </ThemedText>

            <Pressable onPress={() => navigation.navigate('MyPage')} style={styles.profileButton}>
              <Image
                source={require('../../assets/images/item/rabbit_logo.png')}
                style={styles.profileImage}
              />
            </Pressable>
          </View>

          {/* [2] 캘린더 카드 영역 - 월 이동 버튼 추가 */}
          <View style={styles.calendarCard}>
            <View style={styles.calendarControls}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Pressable onPress={handleGoToday} style={styles.todayButton}>
                  <ThemedText style={styles.todayText}>오늘</ThemedText>
                </Pressable>

                {/* 월 이동 화살표 (월간 뷰일 때만 표시하거나 항상 표시) */}
                {calendarViewMode === 'monthly' && (
                  <View style={styles.arrowContainer}>
                    <Pressable onPress={handlePrevMonth} style={styles.arrowButton}>
                      <Ionicons name="chevron-back" size={20} color={theme.icon} />
                    </Pressable>
                    <Pressable onPress={handleNextMonth} style={styles.arrowButton}>
                      <Ionicons name="chevron-forward" size={20} color={theme.icon} />
                    </Pressable>
                  </View>
                )}
              </View>

              <Pressable onPress={toggleViewMode} style={styles.viewModeButton}>
                <Ionicons
                  name={calendarViewMode === 'horizontal' ? 'calendar-outline' : 'swap-horizontal'}
                  size={20} color={theme.icon}
                />
              </Pressable>
            </View>

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

            <View style={styles.calendarFooter}>
              <ThemedText style={styles.taskCount}>
                남은 할 일 <ThemedText style={{ color: theme.primary, fontWeight: 'bold' }}>
                  {todos.filter(t => !t.completed).length}
                </ThemedText>개
              </ThemedText>
            </View>
          </View>

          {/* [3] 카테고리 바 */}
          <CategoryBar
            categories={coloredCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* [4] 할 일 리스트 */}
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
                fetchUserData();
              }}
              onPressEditAction={(todo) => {
                setSelectedTodoAction(todo);
                setActionModalVisible(true);
              }}
              onChangeTitle={updateTodoTitle}
              onFinishEdit={() => setEditingTodoId(null)}
            />
          </View>

          {/* [5] 모달 */}
          <TodoActionModal
            visible={actionModalVisible}
            onClose={() => setActionModalVisible(false)}
            onEdit={() => {
              setEditingTodoId(selectedTodoAction?.id);
              setActionModalVisible(false);
            }}
            onCategorySetting={() => {
              setActionModalVisible(false);
              setCategoryModalVisible(true);
            }}
            onDelete={() => {
              if (selectedTodoAction) deleteTodo(selectedTodoAction.id);
              setActionModalVisible(false);
            }}
          />

          {/* 카테고리 선택 모달 */}
          <CategorySelectionModal
            visible={categoryModalVisible}
            onClose={() => setCategoryModalVisible(false)}
            categories={coloredCategories}
            selectedCategoryIds={selectedTodoAction?.categories?.map((c: any) => c.id) || []}
            onConfirm={async (categoryIds: number[]) => {
              if (selectedTodoAction) {
                await updateTodoCategory(selectedTodoAction.id, categoryIds);
              }
            }}
          />

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default function AppDrawer() {
  const [userName, setUserName] = useState('User');

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} userName={userName} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Home" component={HomeContent} />
      <Drawer.Screen name="MyPage" component={MyPageScreen} />
      <Drawer.Screen name="Category" component={CategoryContent} />
      <Drawer.Screen name="Todos" component={TodosScreen} />
      <Drawer.Screen name="Info">
        {(props) => <InformationContent {...props} userName={userName} setUserName={setUserName} />}
      </Drawer.Screen>
      <Drawer.Screen name="Option" component={OptionContent} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconButton: { padding: 8 },
  headerTitle: {
    fontSize: 20, // 폰트 사이즈 조정
    fontFamily: 'Cafe24Ssurround',
    color: '#212529',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#F8F9FA',
    overflow: 'hidden',
    elevation: 2,
  },
  profileImage: { width: '100%', height: '100%' },

  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  calendarControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrowContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  arrowButton: {
    padding: 4,
  },
  todayButton: {
    backgroundColor: '#E9ECEF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  todayText: {
    fontSize: 14,
    fontFamily: 'Cafe24Ssurround',
    color: '#212529',
  },
  viewModeButton: { padding: 4 },
  calendarFooter: { marginTop: 16, alignItems: 'center' },
  taskCount: { fontSize: 14, color: '#6C757D', fontFamily: 'Cafe24Ssurround' },

  listContainer: { flex: 1 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listTitle: {
    fontSize: 22,
    fontFamily: 'Cafe24Ssurround',
    color: '#212529',
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
});