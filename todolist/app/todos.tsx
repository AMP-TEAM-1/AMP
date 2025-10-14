import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

type Todo = {
	id: number;
	title: string;
	description?: string;
	completed?: boolean;
};

export default function TodosScreen() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [loading, setLoading] = useState(false);
	const [newTitle, setNewTitle] = useState('');
	const [refreshing, setRefreshing] = useState(false);

	const getAuthHeaders = async () => {
		const token = await SecureStore.getItemAsync('authToken');
		console.log('[Auth Debug] Token from SecureStore:', token ? 'exists' : 'missing');
		return token ? { Authorization: `Bearer ${token}` } : {};
	};

	const fetchTodos = useCallback(async () => {
		setLoading(true);
		try {
			const headers = await getAuthHeaders();
			console.log('[Debug] Fetching todos with headers:', headers);
			const res = await axios.get(`${API_URL}/todos/`, { headers });
			setTodos(res.data || []);
		} catch (err: any) {
			console.error('[fetchTodos] Detailed error:', {
				message: err.message,
				status: err.response?.status,
				data: err.response?.data,
				headers: err.response?.headers,
				config: {
					url: err.config?.url,
					headers: err.config?.headers,
					method: err.config?.method,
				}
			});

			let errorMessage = '할일 목록을 불러오는 중 오류가 발생했습니다.';
			if (err.response?.status === 401) {
				errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
				router.replace('/');  // 로그인 페이지로 리디렉션
			} else if (err.response?.status === 403) {
				errorMessage = '접근 권한이 없습니다.';
			} else if (!err.response) {
				errorMessage = '서버에 연결할 수 없습니다. API 주소와 네트워크를 확인해주세요.';
			}

			if (Platform.OS === 'web') {
				window.alert(errorMessage + ' (자세한 내용은 브라우저 콘솔을 확인하세요)');
			}
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, []);

	useEffect(() => {
		fetchTodos();
	}, [fetchTodos]);

	const createTodo = async () => {
		if (!newTitle.trim()) return;
		setLoading(true);
		try {
			const headers = await getAuthHeaders();
			console.log('[Debug] Creating todo with headers:', headers);
			const res = await axios.post(
				`${API_URL}/todos/`,
				{ title: newTitle },
				{ headers: { 'Content-Type': 'application/json', ...headers } }
			);
			console.log('[Debug] Todo created successfully:', res.data);
			setTodos((s) => [res.data, ...s]);
			setNewTitle('');
		} catch (err: any) {
			console.error('[createTodo] Detailed error:', {
				message: err.message,
				status: err.response?.status,
				data: err.response?.data,
				headers: err.response?.headers,
				config: {
					url: err.config?.url,
					headers: err.config?.headers,
					method: err.config?.method,
					data: err.config?.data
				}
			});

			let errorMessage = '할일 생성에 실패했습니다.';
			if (err.response?.status === 401) {
				errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
				router.replace('/');  // 로그인 페이지로 리디렉션
			} else if (err.response?.status === 403) {
				errorMessage = '할일을 생성할 권한이 없습니다.';
			} else if (!err.response) {
				errorMessage = '서버에 연결할 수 없습니다. API 주소와 네트워크를 확인해주세요.';
			}

			if (Platform.OS === 'web') {
				window.alert(errorMessage + ' (자세한 내용은 브라우저 콘솔을 확인하세요)');
			}
		} finally {
			setLoading(false);
		}
	};

	const deleteTodo = async (id: number) => {
		setLoading(true);
		try {
			const headers = await getAuthHeaders();
			console.log('[Debug] Deleting todo with headers:', headers);
			await axios.delete(`${API_URL}/todos/${id}`, { headers });
			console.log('[Debug] Todo deleted successfully:', id);
			setTodos((s) => s.filter((t) => t.id !== id));
		} catch (err: any) {
			console.error('[deleteTodo] Detailed error:', {
				message: err.message,
				status: err.response?.status,
				data: err.response?.data,
				headers: err.response?.headers,
				config: {
					url: err.config?.url,
					headers: err.config?.headers,
					method: err.config?.method
				}
			});

			let errorMessage = '할일 삭제에 실패했습니다.';
			if (err.response?.status === 401) {
				errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
				router.replace('/');
			} else if (err.response?.status === 403) {
				errorMessage = '할일을 삭제할 권한이 없습니다.';
			} else if (!err.response) {
				errorMessage = '서버에 연결할 수 없습니다. API 주소와 네트워크를 확인해주세요.';
			}

			if (Platform.OS === 'web') {
				window.alert(errorMessage + ' (자세한 내용은 브라우저 콘솔을 확인하세요)');
			}
		} finally {
			setLoading(false);
		}
	};

	const renderItem = ({ item }: { item: Todo }) => (
		<Pressable
			style={styles.item}
			onPress={() => router.push({ pathname: '/todoDetail', params: { id: String(item.id) } })}
		>
			<View style={{ flex: 1 }}>
				<ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
			{item.description ? <ThemedText type="subtitle">{item.description}</ThemedText> : null}
			</View>
			<View style={styles.itemActions}>
				<Pressable onPress={() => deleteTodo(item.id)} style={styles.deleteButton}>
					<ThemedText style={{ color: '#fff' }}>삭제</ThemedText>
				</Pressable>
			</View>
		</Pressable>
	);

	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">할일 목록</ThemedText>

			<View style={styles.inputRow}>

				<TextInput
					style={styles.input}
					placeholder="새 할일 제목"
					value={newTitle}
					onChangeText={setNewTitle}
					placeholderTextColor="#888"
				/>
				<Pressable style={styles.addButton} onPress={createTodo} disabled={loading}>
					{loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={{ color: '#fff' }}>추가</ThemedText>}
				</Pressable>
			</View>

			{loading && !refreshing ? (
				<ActivityIndicator style={{ marginTop: 24 }} />
			) : (
				<FlatList
					data={todos}
					keyExtractor={(item) => String(item.id)}
					renderItem={renderItem}
					style={{ width: '100%' }}
					refreshing={refreshing}
					onRefresh={() => { setRefreshing(true); fetchTodos(); }}

					ListEmptyComponent={<ThemedText>할일이 없습니다.</ThemedText>}
				/>
			)}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		alignItems: 'center',
		backgroundColor: '#f5f5f5',
	},
	inputRow: {
		width: '100%',
		flexDirection: 'row',
		gap: 8,
		marginBottom: 12,
	},
	input: {
		flex: 1,
		height: 44,
		backgroundColor: '#fff',
		paddingHorizontal: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	addButton: {
		height: 44,
		paddingHorizontal: 12,
		backgroundColor: '#007AFF',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 8,
	},
	item: {
		width: '100%',
		padding: 12,
		backgroundColor: '#fff',
		borderRadius: 8,
		marginBottom: 8,
		flexDirection: 'row',
		alignItems: 'center',
	},
	itemTitle: {
		fontSize: 16,
		fontWeight: '600',
	},
	itemActions: {
		marginLeft: 12,
	},
	deleteButton: {
		backgroundColor: '#ff3b30',
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 6,
	},
});

