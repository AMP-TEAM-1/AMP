import React, { useRef, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ITEM_HEIGHT = 60;     
const VISIBLE_COUNT = 5;    
const LOOP_COUNT = 100;     // 반복 횟수 (충분히 커서 사실상 무한)

export default function AlarmPage() {
  const navigation = useNavigation<any>();

  const baseHours = Array.from({ length: 12 }, (_, i) => i + 1);
  const baseMinutes = Array.from({ length: 60 }, (_, i) => i);

  // 반복 데이터를 만들어 무한 스크롤처럼
  const hours = Array.from({ length: LOOP_COUNT }, () => baseHours).flat();
  const minutes = Array.from({ length: LOOP_COUNT }, () => baseMinutes).flat();

  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isAM, setIsAM] = useState(true);

  const hourRef = useRef<FlatList>(null);
  const minuteRef = useRef<FlatList>(null);

  const initialHourIndex = baseHours.indexOf(selectedHour) + baseHours.length * Math.floor(LOOP_COUNT / 2);
  const initialMinuteIndex = selectedMinute + baseMinutes.length * Math.floor(LOOP_COUNT / 2);

  useEffect(() => {
    hourRef.current?.scrollToIndex({ index: initialHourIndex, animated: false, viewPosition: 0.5 });
    minuteRef.current?.scrollToIndex({ index: initialMinuteIndex, animated: false, viewPosition: 0.5 });
  }, []);

  const onScrollEnd = (ev: any, type: 'hour' | 'minute') => {
    const index = Math.round(ev.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    if (type === 'hour') {
      const hourValue = hours[index % baseHours.length];
      setSelectedHour(hourValue);
      // 중앙 유지
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>알람 설정</Text>

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

        {/* 시간 FlatList */}
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


      <Pressable
        style={styles.saveButton}
        onPress={() => {
          console.log(`설정 완료: ${isAM ? '오전' : '오후'} ${selectedHour}:${selectedMinute}`);
          navigation.navigate('Home');
        }}
      >
        <Text style={styles.saveButtonText}>저장</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 80 },
  label: { fontSize: 27, fontWeight: '700', marginBottom: 90 },
  pickerContainer: { flexDirection: 'row', alignItems: 'center' },
  picker: { width: 80 },
  timeItem: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  timeText: { fontSize: 28, color: '#888' },
  selectedTimeText: { color: '#1f7aeb', fontWeight: '700', fontSize: 36 },
  separator: { fontSize: 36, fontWeight: '700', marginHorizontal: 10 },
  amPmContainer: { marginRight: 15, justifyContent: 'center',},
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
  saveButton: {
    marginTop: 60,
    backgroundColor: '#1f7aeb',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
