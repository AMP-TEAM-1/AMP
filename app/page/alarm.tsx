import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { tokenStorage } from '../storage';
import { cancelNotification, requestNotificationPermissions, scheduleNotification } from '../utils/notificationService';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ITEM_HEIGHT = 60;
const VISIBLE_COUNT = 5;
const LOOP_COUNT = 100;

export default function AlarmPage() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { todoId, todoTitle, todoDate } = route.params || {};

  const baseHours = Array.from({ length: 12 }, (_, i) => i + 1);
  const baseMinutes = Array.from({ length: 60 }, (_, i) => i);

  const hours = Array.from({ length: LOOP_COUNT }, () => baseHours).flat();
  const minutes = Array.from({ length: LOOP_COUNT }, () => baseMinutes).flat();

  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isAM, setIsAM] = useState(true);
  const [loading, setLoading] = useState(false);
  const [repeatType, setRepeatType] = useState<'none' | 'daily' | 'weekly'>('none');
  const [hasAlarm, setHasAlarm] = useState(false);

  const hourRef = useRef<FlatList>(null);
  const minuteRef = useRef<FlatList>(null);

  const initialHourIndex = baseHours.indexOf(selectedHour) + baseHours.length * Math.floor(LOOP_COUNT / 2);
  const initialMinuteIndex = selectedMinute + baseMinutes.length * Math.floor(LOOP_COUNT / 2);

  // 기존 알람 시간 불러오기
  useEffect(() => {
    const loadExistingAlarm = async () => {
      if (!todoId) return;

      try {
        const token = await tokenStorage.getItem();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${API_URL}/todos/${todoId}`, { headers });

        if (response.data.alarm_time) {
          setHasAlarm(true);
          const timeStr = response.data.alarm_time;
          const [hours, minutes] = timeStr.split(':').map(Number);

          // 12시간 형식으로 변환
          if (hours >= 12) {
            setIsAM(false);
            setSelectedHour(hours === 12 ? 12 : hours - 12);
          } else {
            setIsAM(true);
            setSelectedHour(hours === 0 ? 12 : hours);
          }
          setSelectedMinute(minutes);

          // 반복 타입 설정
          if (response.data.alarm_repeat_type) {
            setRepeatType(response.data.alarm_repeat_type);
          }
        } else {
          setHasAlarm(false);
        }
      } catch (error) {
        console.error('Error loading existing alarm:', error);
      }
    };

    loadExistingAlarm();
  }, [todoId]);

  useEffect(() => {
    hourRef.current?.scrollToIndex({ index: initialHourIndex, animated: false, viewPosition: 0.5 });
    minuteRef.current?.scrollToIndex({ index: initialMinuteIndex, animated: false, viewPosition: 0.5 });
  }, []);

  const onScrollEnd = (ev: any, type: 'hour' | 'minute') => {
    const index = Math.round(ev.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    if (type === 'hour') {
      const hourValue = hours[index % baseHours.length];
      setSelectedHour(hourValue);
      hourRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    } else {
      const minuteValue = minutes[index % baseMinutes.length];
      setSelectedMinute(minuteValue);
      minuteRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    }
  };

  const renderHour = ({ item, index }: { item: number; index: number }) => (
    <Pressable
      style={styles.timeItem}
      onPress={() => {
        setSelectedHour(item);
        hourRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }}
    >
      <Text style={[styles.timeText, item === selectedHour && styles.selectedTimeText]}>
        {item.toString().padStart(2, '0')}
      </Text>
    </Pressable>
  );

  const renderMinute = ({ item, index }: { item: number; index: number }) => (
    <Pressable
      style={styles.timeItem}
      onPress={() => {
        setSelectedMinute(item);
        minuteRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }}
    >
      <Text style={[styles.timeText, item === selectedMinute && styles.selectedTimeText]}>
        {item.toString().padStart(2, '0')}
      </Text>
    </Pressable>
  );

  // 알람 삭제 핸들러
  const handleDeleteAlarm = async () => {
    if (!todoId) return;

    // 확인 대화상자
    const confirmDelete = () => {
      if (Platform.OS === 'web') {
        return window.confirm('알람을 삭제하시겠습니까?');
      } else {
        return new Promise((resolve) => {
          Alert.alert(
            '알람 삭제',
            '알람을 삭제하시겠습니까?',
            [
              { text: '취소', style: 'cancel', onPress: () => resolve(false) },
              { text: '삭제', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });
      }
    };

    const confirmed = await confirmDelete();
    if (!confirmed) return;

    setLoading(true);

    try {
      // 백엔드에서 알람 제거
      const token = await tokenStorage.getItem();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.put(
        `${API_URL}/todos/${todoId}/`,
        { alarm_time: null, alarm_repeat_type: null },
        { headers }
      );

      // 로컬 알림 취소
      await cancelNotification(todoId);

      if (Platform.OS === 'web') window.alert('알람이 삭제되었습니다.');
      else Alert.alert('성공', '알람이 삭제되었습니다.');

      navigation.navigate('Home');
    } catch (error) {
      console.error('Error deleting alarm:', error);
      if (Platform.OS === 'web') window.alert('알람 삭제에 실패했습니다.');
      else Alert.alert('오류', '알람 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 알람 저장 핸들러
  const handleSaveAlarm = async () => {
    if (!todoId) {
      if (Platform.OS === 'web') window.alert('할일 정보를 찾을 수 없습니다.');
      else Alert.alert('오류', '할일 정보를 찾을 수 없습니다.');
      return;
    }

    setLoading(true);

    try {
      // 알림 권한 요청 (web이 아닐 때만)
      if (Platform.OS !== 'web' as any) {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
          if (Platform.OS === 'web' as any) window.alert('알림 권한이 필요합니다.');
          else Alert.alert('알림 권한 필요', '설정에서 알림 권한을 허용해주세요.');
          setLoading(false);
          return;
        }
      }

      // 24시간 형식으로 변환
      let hour24 = selectedHour;
      if (!isAM && selectedHour !== 12) {
        hour24 = selectedHour + 12;
      } else if (isAM && selectedHour === 12) {
        hour24 = 0;
      }

      const alarmTimeStr = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
      const repeatTypeValue = repeatType === 'none' ? null : repeatType;

      // 백엔드에 알람 시간 저장
      const token = await tokenStorage.getItem();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.put(
        `${API_URL}/todos/${todoId}/`,
        {
          alarm_time: alarmTimeStr,
          alarm_repeat_type: repeatTypeValue
        },
        { headers }
      );

      // 로컬 알림 예약 (web이 아닐 때만)
      if (Platform.OS !== 'web' && todoDate) {
        await scheduleNotification(todoId, todoTitle || '할일', alarmTimeStr, todoDate, repeatTypeValue || undefined);
      }

      const repeatMsg = repeatType === 'daily' ? ' (매일 반복)' : repeatType === 'weekly' ? ' (매주 반복)' : '';
      console.log(`알람 저장 완료: ${isAM ? '오전' : '오후'} ${selectedHour}:${selectedMinute.toString().padStart(2, '0')}${repeatMsg}`);

      if (Platform.OS === 'web') window.alert(`알람이 설정되었습니다.${repeatMsg}`);
      else Alert.alert('성공', `알람이 설정되었습니다.${repeatMsg}`);

      navigation.navigate('Home');
    } catch (error) {
      console.error('Error saving alarm:', error);
      if (Platform.OS === 'web') window.alert('알람 설정에 실패했습니다.');
      else Alert.alert('오류', '알람 설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 뒤로가기 버튼 */}
      <Pressable
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="#000" />
      </Pressable>

      <Text style={styles.label}>알람 설정</Text>

      {todoTitle && (
        <Text style={styles.todoTitle}>{todoTitle}</Text>
      )}

      {/* 반복 옵션 */}
      <View style={styles.repeatContainer}>
        <Text style={styles.repeatLabel}>반복:</Text>
        <View style={styles.repeatButtons}>
          <Pressable
            style={[styles.repeatButton, repeatType === 'none' && styles.repeatButtonSelected]}
            onPress={() => setRepeatType('none')}
          >
            <Text style={[styles.repeatButtonText, repeatType === 'none' && styles.repeatButtonTextSelected]}>
              없음
            </Text>
          </Pressable>
          <Pressable
            style={[styles.repeatButton, repeatType === 'daily' && styles.repeatButtonSelected]}
            onPress={() => setRepeatType('daily')}
          >
            <Text style={[styles.repeatButtonText, repeatType === 'daily' && styles.repeatButtonTextSelected]}>
              매일
            </Text>
          </Pressable>
          <Pressable
            style={[styles.repeatButton, repeatType === 'weekly' && styles.repeatButtonSelected]}
            onPress={() => setRepeatType('weekly')}
          >
            <Text style={[styles.repeatButtonText, repeatType === 'weekly' && styles.repeatButtonTextSelected]}>
              매주
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.pickerContainer}>
        <View style={[styles.amPmContainer, { height: ITEM_HEIGHT * VISIBLE_COUNT, justifyContent: 'center' }]}>
          <Pressable
            style={[styles.amPmButton, isAM && styles.amPmSelected]}
            onPress={() => setIsAM(true)}
          >
            <Text style={[styles.amPmText, isAM && styles.amPmTextSelected]}>오전</Text>
          </Pressable>
          <Pressable
            style={[styles.amPmButton, !isAM && styles.amPmSelected]}
            onPress={() => setIsAM(false)}
          >
            <Text style={[styles.amPmText, !isAM && styles.amPmTextSelected]}>오후</Text>
          </Pressable>
        </View>

        <FlatList
          ref={hourRef}
          data={hours}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={renderHour}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={(ev) => onScrollEnd(ev, 'hour')}
          style={[styles.picker, { height: ITEM_HEIGHT * VISIBLE_COUNT }]}
          getItemLayout={(data, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
        />

        <Text style={styles.separator}>:</Text>

        <FlatList
          ref={minuteRef}
          data={minutes}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={renderMinute}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={(ev) => onScrollEnd(ev, 'minute')}
          style={[styles.picker, { height: ITEM_HEIGHT * VISIBLE_COUNT }]}
          getItemLayout={(data, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
        />
      </View>

      {/* 버튼 영역 */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveAlarm}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>{loading ? '저장 중...' : '저장'}</Text>
        </Pressable>

        {hasAlarm && (
          <Pressable
            style={[styles.deleteButton, loading && styles.saveButtonDisabled]}
            onPress={handleDeleteAlarm}
            disabled={loading}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.deleteButtonText}>알람 삭제</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 50 },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  label: { fontSize: 27, fontWeight: '700', marginBottom: 10 },
  todoTitle: { fontSize: 18, fontWeight: '600', color: '#555', marginBottom: 20, textAlign: 'center', paddingHorizontal: 20 },

  // 반복 옵션 스타일
  repeatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  repeatLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  repeatButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  repeatButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  repeatButtonSelected: {
    backgroundColor: '#1f7aeb',
    borderColor: '#1f7aeb',
  },
  repeatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  repeatButtonTextSelected: {
    color: '#fff',
  },

  pickerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  picker: { width: 80 },
  timeItem: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  timeText: { fontSize: 28, color: '#888' },
  selectedTimeText: { color: '#1f7aeb', fontWeight: '700', fontSize: 36 },
  separator: { fontSize: 36, fontWeight: '700', marginHorizontal: 10 },
  amPmContainer: { marginRight: 15, justifyContent: 'center', },
  amPmButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    marginBottom: 10,
  },
  amPmSelected: { backgroundColor: '#1f7aeb' },
  amPmText: { fontSize: 18, fontWeight: '700', color: '#888' },
  amPmTextSelected: { color: '#fff' },

  // 버튼 컨테이너
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 40,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#1f7aeb',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  // 삭제 버튼
  deleteButton: {
    backgroundColor: '#ff4d4f',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
