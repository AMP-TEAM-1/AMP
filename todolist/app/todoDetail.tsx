import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function TodoDetailScreen() {
	const router = useRouter();
		const params = useLocalSearchParams();
	const id = params.id as string | undefined;

	const [loading, setLoading] = useState(false);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');

	const getAuthHeaders = async () => {
		const token = await SecureStore.getItemAsync('authToken');
		return token ? { Authorization: `Bearer ${token}` } : {};
	};

	useEffect(() => {
		if (!id) return;
		const fetchTodo = async () => {
			setLoading(true);
			try {
				const headers = await getAuthHeaders();
				const res = await axios.get(`${API_URL}/todos/`, { headers });
				const todo = (res.data || []).find((t: any) => String(t.id) === String(id));
				if (!todo) {
					if (Platform.OS === 'web') window.alert('해당 할일을 찾을 수 없습니다.');
					else Alert.alert('오류', '해당 할일을 찾을 수 없습니다.');
					router.replace('/todos');
					return;
				}
				setTitle(todo.title || '');
				setDescription(todo.description || '');
			} catch (err: any) {
				console.error('fetchTodo error', err);
				if (Platform.OS === 'web') window.alert('할일을 불러오는 중 오류가 발생했습니다.');
			} finally {
				setLoading(false);
			}
		};
		fetchTodo();
	}, [id]);

	const updateTodo = async () => {
		if (!id) return;
		setLoading(true);
		try {
			const headers = await getAuthHeaders();
			const res = await axios.put(
				`${API_URL}/todos/${id}`,
				{ title, description },
				{ headers: { 'Content-Type': 'application/json', ...headers } }
			);
			if (Platform.OS === 'web') window.alert('수정되었습니다.');
			else Alert.alert('성공', '수정되었습니다.');
			router.replace('/todos');
		} catch (err: any) {
			console.error('updateTodo error', err);
			if (Platform.OS === 'web') window.alert('할일 수정에 실패했습니다.');
			else Alert.alert('오류', '할일 수정에 실패했습니다.');
		} finally {
			setLoading(false);
		}
	};

	const deleteTodo = async () => {
		if (!id) return;
		setLoading(true);
		try {
			const headers = await getAuthHeaders();
			await axios.delete(`${API_URL}/todos/${id}`, { headers });
			if (Platform.OS === 'web') window.alert('삭제되었습니다.');
			else Alert.alert('성공', '삭제되었습니다.');
			router.replace('/todos');
		} catch (err: any) {
			console.error('deleteTodo error', err);
			if (Platform.OS === 'web') window.alert('할일 삭제에 실패했습니다.');
			else Alert.alert('오류', '할일 삭제에 실패했습니다.');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<ThemedView style={styles.container}>
				<ActivityIndicator />
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">할일 상세</ThemedText>
			<TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="제목" placeholderTextColor="#888" />
			<TextInput
				style={[styles.input, { height: 120 }]}
				value={description}
				onChangeText={setDescription}
				placeholder="설명"
				multiline
				placeholderTextColor="#888"
			/>

			<View style={styles.buttonsRow}>
				<Pressable style={styles.saveButton} onPress={updateTodo} disabled={loading}>
					<ThemedText style={{ color: '#fff' }}>저장</ThemedText>
				</Pressable>
				<Pressable style={styles.deleteButton} onPress={deleteTodo} disabled={loading}>
					<ThemedText style={{ color: '#fff' }}>삭제</ThemedText>
				</Pressable>
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#f5f5f5',
		alignItems: 'center',
	},
	input: {
		width: '100%',
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 12,
		borderWidth: 1,
		borderColor: '#ddd',
		marginTop: 12,
	},
	buttonsRow: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 16,
	},
	saveButton: {
		backgroundColor: '#007AFF',
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 8,
	},
	deleteButton: {
		backgroundColor: '#ff3b30',
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 8,
	},
});

