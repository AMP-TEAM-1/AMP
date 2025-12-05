import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

export const useCalendar = () => {
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState<Date>(today);
    const [calendarViewMode, setCalendarViewMode] = useState<'horizontal' | 'monthly'>('horizontal');

    // 뷰 전환 애니메이션을 위한 값
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // 1. 저장된 뷰 모드 불러오기
    useEffect(() => {
        const loadViewMode = async () => {
            try {
                const saved = await AsyncStorage.getItem('calendarViewMode');
                if (saved === 'horizontal' || saved === 'monthly') {
                    setCalendarViewMode(saved);
                }
            } catch (e) {
                console.error('Failed to load view mode', e);
            }
        };
        loadViewMode();
    }, []);

    // 2. 뷰 모드 변경 시 저장
    useEffect(() => {
        AsyncStorage.setItem('calendarViewMode', calendarViewMode).catch(console.error);
    }, [calendarViewMode]);

    // 3. 핸들러 함수들
    const handlePrevMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(selectedDate.getMonth() - 1);
        setSelectedDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(selectedDate.getMonth() + 1);
        setSelectedDate(newDate);
    };

    const toggleViewMode = () => {
        // 페이드 아웃 -> 모드 변경 -> 페이드 인
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => {
            setCalendarViewMode(prev => prev === 'horizontal' ? 'monthly' : 'horizontal');
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }).start();
        });
    };

    const handleGoToday = () => {
        setSelectedDate(today);
    };

    return {
        today,
        selectedDate,
        setSelectedDate,
        calendarViewMode,
        toggleViewMode,
        handlePrevMonth,
        handleNextMonth,
        handleGoToday,
        fadeAnim
    };
};