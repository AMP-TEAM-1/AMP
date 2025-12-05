import React, { useRef } from 'react';
import { PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

interface MonthlyCalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
}

export default function MonthlyCalendar({
    selectedDate,
    onSelectDate,
    onPrevMonth,
    onNextMonth,
}: MonthlyCalendarProps) {
    const today = new Date();

    // 월간 날짜 생성 함수
    const generateMonthDays = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const firstDayOfWeek = firstDay.getDay();
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        const days: Date[] = [];

        // 이전 달
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            days.push(new Date(year, month, -i));
        }
        // 이번 달
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        // 다음 달 (42칸 채우기)
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push(new Date(year, month + 1, i));
        }
        return days;
    };

    const monthDays = generateMonthDays(selectedDate);

    // 스와이프 제스처
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20,
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx > 50) onPrevMonth();
                else if (gestureState.dx < -50) onNextMonth();
            },
        })
    ).current;

    return (
        <View {...panResponder.panHandlers} style={styles.container}>
            {/* 요일 헤더 */}
            <View style={styles.weekdayRow}>
                {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                    <View key={idx} style={styles.weekdayCell}>
                        <ThemedText style={styles.weekdayText}>{day}</ThemedText>
                    </View>
                ))}
            </View>

            {/* 날짜 그리드 */}
            <View style={styles.grid}>
                {monthDays.map((date, idx) => {
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const isToday = date.toDateString() === today.toDateString();
                    const isSameMonth = date.getMonth() === selectedDate.getMonth();

                    return (
                        <Pressable
                            key={idx}
                            onPress={() => onSelectDate(date)}
                            style={[
                                styles.dayCell,
                                isSelected && styles.selectedDay,
                                isToday && styles.today,
                                !isSameMonth && styles.otherMonth,
                            ]}
                        >
                            <ThemedText style={[styles.dayText, isSelected && { color: '#1f7aeb' }]}>
                                {date.getDate()}
                            </ThemedText>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 8 },
    weekdayRow: { flexDirection: 'row', marginBottom: 8 },
    weekdayCell: { width: '14.28%', alignItems: 'center', paddingVertical: 8 },
    weekdayText: { fontSize: 14, fontWeight: '600', color: '#666', fontFamily: 'Cafe24Ssurround' },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginVertical: 2 },
    dayText: { fontSize: 16, fontWeight: '600', fontFamily: 'Cafe24Ssurround', color: '#333' },
    selectedDay: { backgroundColor: '#1f7aeb22', borderColor: '#1f7aeb', borderWidth: 2 },
    today: { borderColor: '#FF8C42', borderWidth: 1.5 },
    otherMonth: { opacity: 0.3 },
});