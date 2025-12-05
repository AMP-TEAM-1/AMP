import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { tokenStorage } from '../storage';
import { Category, Todo } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useTodos = (selectedDate: Date) => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [coloredCategories, setColoredCategories] = useState<Category[]>([]);

    // 날짜 포맷팅 (YYYY-MM-DD)
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // 인증 헤더
    const getHeaders = async () => {
        const token = await tokenStorage.getItem();
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // 1. 카테고리 목록 조회 및 색상 할당
    const fetchCategories = useCallback(async () => {
        try {
            const headers = await getHeaders();
            const res = await axios.get(`${API_URL}/categories/`, { headers });
            const cats: Category[] = res.data || [];

            // 색상 랜덤/순환 할당 로직
            const categoryColors = ['#FFE0A3', '#A3D8FF', '#FFA3A3', '#C8FFA3', '#E3A3FF', '#FFD1A3', '#A3FFE0'];
            const shuffled = [...categoryColors].sort(() => Math.random() - 0.5);
            const colored = cats.map((cat, index) => ({
                ...cat,
                color: shuffled[index % shuffled.length],
            }));

            setCategories(cats);
            setColoredCategories(colored);
        } catch (err) {
            console.error('[useTodos] fetchCategories error:', err);
        }
    }, []);

    // 2. 날짜별 할일 조회
    const fetchTodos = useCallback(async () => {
        try {
            const headers = await getHeaders();
            const res = await axios.get(`${API_URL}/todos/`, {
                headers,
                params: { target_date: formatDate(selectedDate) },
            });

            // 할일에 카테고리 색상 입히기
            const rawTodos: Todo[] = res.data;
            const mappedTodos = rawTodos.map(todo => ({
                ...todo,
                categories: todo.categories.map(cat => {
                    const found = coloredCategories.find(c => c.id === cat.id);
                    return found ? { ...cat, color: found.color } : cat;
                })
            }));

            setTodos(mappedTodos);
        } catch (err) {
            console.error('[useTodos] fetchTodos error:', err);
            setTodos([]);
        }
    }, [selectedDate, coloredCategories]);

    // 초기 로딩
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        if (coloredCategories.length > 0) {
            fetchTodos();
        }
    }, [fetchTodos, coloredCategories]);

    //CRUD 
    const addTodo = async (title: string, categoryId?: number | 'all') => {
        try {
            const headers = await getHeaders();
            const payload: any = { title, date: formatDate(selectedDate) };
            if (categoryId && categoryId !== 'all') {
                payload.category_ids = [categoryId];
            }
            await axios.post(`${API_URL}/todos/`, payload, { headers });
            await fetchTodos(); // 목록 갱신
        } catch (err) {
            Alert.alert('오류', '할일 추가 실패');
        }
    };

    const toggleTodo = async (id: number, currentCompleted: boolean) => {
        // 낙관적 업데이트 
        setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !currentCompleted } : t));
        try {
            const headers = await getHeaders();
            await axios.put(`${API_URL}/todos/${id}/`, { completed: !currentCompleted }, { headers });
        } catch (err) {
            // 실패시 롤백 및 알림
            setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: currentCompleted } : t));
            console.error(err);
        }
    };

    const updateTodoTitle = async (id: number, newTitle: string) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, title: newTitle } : t)); // 로컬 반영
        try {
            const headers = await getHeaders();
            await axios.put(`${API_URL}/todos/${id}/`, { title: newTitle }, { headers });
        } catch (err) {
            console.error(err);
        }
    };

    const deleteTodo = async (id: number) => {
        try {
            const headers = await getHeaders();
            await axios.delete(`${API_URL}/todos/${id}/`, { headers });
            setTodos(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            Alert.alert('오류', '삭제 실패');
        }
    };

    const updateTodoCategory = async (todoId: number, categoryIds: number[]) => {
        try {
            const headers = await getHeaders();
            await axios.put(`${API_URL}/todos/${todoId}/`, { category_ids: categoryIds }, { headers });
            await fetchTodos();
        } catch (err) {
            Alert.alert('오류', '카테고리 수정 실패');
        }
    }

    return {
        todos,
        categories,
        coloredCategories,
        fetchTodos,
        fetchCategories,
        addTodo,
        toggleTodo,
        updateTodoTitle,
        deleteTodo,
        updateTodoCategory
    };
};