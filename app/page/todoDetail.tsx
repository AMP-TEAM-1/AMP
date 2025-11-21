// --- React 및 Expo 관련 라이브러리 임포트 ---
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { tokenStorage } from '../storage';

// --- 상수 정의 ---
// 백엔드 API 서버 주소. 환경 변수에서 가져오거나 기본값을 사용합니다.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// --- 컴포넌트 정의 ---
export default function TodoDetailScreen() {
	// --- Hooks ---
	// Expo Router의 훅을 사용하여 라우팅 및 URL 파라미터 관리
	const router = useRouter();
	const params = useLocalSearchParams();
	// URL 파라미터에서 할일의 'id'를 추출합니다. (예: /todoDetail?id=1)
	const id = params.id as string | undefined;

	// --- State 관리 ---
	// 로딩 상태, 할일의 제목과 설명을 관리하는 React State
	const [loading, setLoading] = useState(false);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');

	// --- 헬퍼 함수 ---
	/**
	 * SecureStore에서 인증 토큰을 비동기적으로 가져와 API 요청 헤더를 생성합니다.
	 * @returns {Promise<object>} Authorization 헤더 객체 또는 빈 객체
	 */
	const getAuthHeaders = async () => {
		const token = await tokenStorage.getItem();
		return token ? { Authorization: `Bearer ${token}` } : {};
	};

	// --- Effects ---
	// 컴포넌트가 마운트되거나 id가 변경될 때 실행되어 해당 id의 할일 데이터를 불러옵니다.
	useEffect(() => {
		// id가 없으면 아무 작업도 하지 않습니다.
		if (!id) return;

		// 할일 데이터를 비동기적으로 가져오는 함수
		const fetchTodo = async () => {
			setLoading(true); // 로딩 상태 시작
			try {
				// 인증 헤더를 가져옵니다.
				const headers = await getAuthHeaders();
				// [개선] 특정 ID의 할일만 가져오는 API를 직접 호출하여 효율성을 높입니다.
				const res = await axios.get(`${API_URL}/todos/${id}`, { headers });
				const todo = res.data;

				// 찾은 할일의 데이터로 state를 업데이트합니다.
				setTitle(todo.title || '');
				setDescription(todo.description || '');
			} catch (err: any) {
				console.error('[fetchTodo] error', err.response || err);
				let errorMessage = '할일을 불러오는 중 오류가 발생했습니다.';

				// [개선] HTTP 상태 코드에 따라 구체적인 에러 메시지를 제공합니다.
				if (err.response?.status === 401) {
					errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
					router.replace('/'); // 로그인 화면으로 이동
				} else if (err.response?.status === 403) {
					errorMessage = '이 항목을 볼 권한이 없습니다.';
					router.back(); // 이전 화면으로 이동
				} else if (err.response?.status === 404) {
					errorMessage = '해당 할일을 찾을 수 없습니다.';
					router.back(); // 이전 화면으로 이동
				}

				if (Platform.OS === 'web') window.alert(errorMessage);
				else Alert.alert('오류', errorMessage);
			} finally {
				setLoading(false); // 작업 완료 후 로딩 상태 종료
			}
		};

		fetchTodo();
	}, [id]); // id가 변경될 때마다 이 effect를 다시 실행합니다.

	// --- 이벤트 핸들러 ---
	/**
	 * '저장' 버튼을 눌렀을 때 호출되어 할일 정보를 수정하는 함수
	 */
	const updateTodo = async () => {
		// id가 없으면 함수를 종료합니다.
		if (!id) return;
		setLoading(true); // 로딩 상태 시작
		try {
			// 인증 헤더를 가져옵니다.
			const headers = await getAuthHeaders();
			// PUT 요청으로 해당 id의 할일 데이터를 수정합니다.
			await axios.put(
				`${API_URL}/todos/${id}`,
				{ title, description }, // 수정할 데이터를 body에 담아 전송
				{ headers: { 'Content-Type': 'application/json', ...headers } }
			);
			// 수정 성공 시 사용자에게 알림을 표시합니다.
			if (Platform.OS === 'web') window.alert('수정되었습니다.');
			else Alert.alert('성공', '수정되었습니다.');
			// [개선] UX 향상을 위해 이전 화면(목록)으로 돌아갑니다.
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
			setLoading(false); // 작업 완료 후 로딩 상태 종료
		}
	};

	/**
	 * '삭제' 버튼을 눌렀을 때 호출되어 할일을 삭제하는 함수
	 */
	const deleteTodo = async () => {
		// id가 없으면 함수를 종료합니다.
		if (!id) return;
		setLoading(true); // 로딩 상태 시작
		try {
			// 인증 헤더를 가져옵니다.
			const headers = await getAuthHeaders();
			// DELETE 요청으로 해당 id의 할일을 삭제합니다.
			await axios.delete(`${API_URL}/todos/${id}`, { headers });
			// 삭제 성공 시 사용자에게 알림을 표시합니다.
			if (Platform.OS === 'web') window.alert('삭제되었습니다.');
			else Alert.alert('성공', '삭제되었습니다.');
			// [개선] UX 향상을 위해 이전 화면(목록)으로 돌아갑니다.
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
			setLoading(false); // 작업 완료 후 로딩 상태 종료
		}
	};

	// --- 렌더링 ---
	// 로딩 중일 경우, 로딩 인디케이터(스피너)를 표시합니다.
	if (loading) {
		return (
			<ThemedView style={styles.container}>
				<ActivityIndicator />
			</ThemedView>
		);
	}

	return (
		// 로딩이 끝나면 상세 정보 입력 화면을 렌더링합니다.
		<ThemedView style={styles.container}>
			<ThemedText type="title">할일 상세</ThemedText>
			{/* 제목 입력 필드 */}
			<TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="제목" placeholderTextColor="#888" />
			<TextInput
				// 설명 입력 필드 (여러 줄 입력 가능)
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

// --- 스타일 정의 ---
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
