import React, { useEffect, useRef } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '../themed-text';

interface WeeklyCalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

const TOTAL_DAYS = 100000;
const CENTER_INDEX = Math.floor(TOTAL_DAYS / 2);

export default function WeeklyCalendar({ selectedDate, onSelectDate }: WeeklyCalendarProps) {
    const flatListRef = useRef<FlatList<number>>(null);
    const screenWidth = Dimensions.get('window').width;

    // 레이아웃 계산
    const visibleCount = 8;
    const spacing = 4;
    const horizontalPadding = 16;
    const totalSpacing = spacing * (visibleCount - 1);
    const itemWidth = (screenWidth - totalSpacing - horizontalPadding) / visibleCount;

    // 인덱스로부터 날짜 계산
    const getDateFromIndex = (index: number) => {
        const today = new Date();
        const diff = index - CENTER_INDEX;
        const date = new Date(today);
        date.setDate(today.getDate() + diff);
        return date;
    };

    // 선택된 날짜로 스크롤 이동 
    useEffect(() => {
        // 간단한 구현을 위해 초기 위치만 중앙으로 
        flatListRef.current?.scrollToIndex({ index: CENTER_INDEX, animated: false, viewPosition: 0.5 });
    }, []);

    return (
        <FlatList<number>
            ref={flatListRef}
            data={Array.from({ length: TOTAL_DAYS }).map((_, i) => i)}
            horizontal
            keyExtractor={(item) => item.toString()}
            initialScrollIndex={CENTER_INDEX}
            getItemLayout={(_, index) => ({
                length: itemWidth + spacing,
                offset: (itemWidth + spacing) * index,
                index,
            })}
            renderItem={({ item: index }) => {
                const date = getDateFromIndex(index);
                const isSelected = date.toDateString() === selectedDate.toDateString();
                return (
                    <Pressable
                        onPress={() => onSelectDate(date)}
                        style={[
                            styles.dateButton,
                            { width: itemWidth },
                            isSelected && styles.selected,
                        ]}
                    >
                        <ThemedText style={[styles.weekday, isSelected && styles.selectedText]}>
                            {['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}
                        </ThemedText>
                        <ThemedText style={[styles.dayNum, isSelected && styles.selectedText]}>
                            {date.getDate()}
                        </ThemedText>
                    </Pressable>
                );
            }}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4 }}
        />
    );
}

const styles = StyleSheet.create({
    dateButton: {
        height: 52,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'transparent', // 기본 테두리 투명
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 4,
        backgroundColor: '#fff',
    },
    selected: {
        backgroundColor: '#1f7aeb22',
        borderColor: '#1f7aeb',
    },
    weekday: { fontSize: 12, color: '#888', fontFamily: 'Cafe24Ssurround', marginBottom: 2 },
    dayNum: { fontSize: 16, fontWeight: '700', color: '#111', fontFamily: 'Cafe24Ssurround' },
    selectedText: { color: '#1f7aeb' },
});