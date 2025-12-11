import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { tokenStorage } from '../storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;


export default function TodoDetailScreen() {

	const router = useRouter();
	const params = useLocalSearchParams();
	const id = params.id as string | undefined;
	const [loading, setLoading] = useState(false);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');

	const getAuthHeaders = async () => {
		const token = await tokenStorage.getItem();
		return token ? { Authorization: `Bearer ${token}` } : {};
	};

	useEffect(() => {
		if (!id) return;

		// 할일 데이터를 비동기적으로 가져오는 함수
		const fetchTodo = async () => {
			setLoading(true); 
			try {
				const headers = await getAuthHeaders();
				const res = await axios.get(`${API_URL}/todos/${id}`, { headers });
				const todo = res.data;

				setTitle(todo.title || '');
				setDescription(todo.description || '');
			} catch (err: any) {
				console.error('[fetchTodo] error', err.response || err);
				let errorMessage = '할일을 불러오는 중 오류가 발생했습니다.';

				if (err.response?.status === 401) {
					errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
					router.replace('/'); 
				} else if (err.response?.status === 403) {
					errorMessage = '이 항목을 볼 권한이 없습니다.';
					router.back(); 
				} else if (err.response?.status === 404) {
					errorMessage = '해당 할일을 찾을 수 없습니다.';
					router.back(); 
				}

				if (Platform.OS === 'web') window.alert(errorMessage);
				else Alert.alert('오류', errorMessage);
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
			await axios.put(
				`${API_URL}/todos/${id}`,
				{ title, description }, 
				{ headers: { 'Content-Type': 'application/json', ...headers } }
			);

			if (Platform.OS === 'web') window.alert('수정되었습니다.');
			else Alert.alert('성공', '수정되었습니다.');
			router.back();

		} catch (err: any) {
			console.error('[updateTodo] error', err.response || err);
			let errorMessage = '할일 수정에 실패했습니다.';

			if (err.response?.status === 401) {
				errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
				router.replace('/');
			} else if (err.response?.status === 403) {
				errorMessage = '이 항목을 수정할 권한이 없습니다.';
			}

			if (Platform.OS === 'web') window.alert(errorMessage);
			else Alert.alert('오류', errorMessage);
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
			router.back();

		} catch (err: any) {
			console.error('[deleteTodo] error', err.response || err);
			let errorMessage = '할일 삭제에 실패했습니다.';

			if (err.response?.status === 401) {
				errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
				router.replace('/');
			} else if (err.response?.status === 403) {
				errorMessage = '이 항목을 삭제할 권한이 없습니다.';
			}

			if (Platform.OS === 'web') window.alert(errorMessage);
			else Alert.alert('오류', errorMessage);
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
			{/* 제목 입력 필드 */}
			<TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="제목" placeholderTextColor="#888" />
			<TextInput
				style={[styles.input, { height: 120 }]}
				value={description}
				onChangeText={setDescription}
				placeholder="설명"
				multiline
				placeholderTextColor="#888"
			/>

			{/* 저장 및 삭제 버튼 */}
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
