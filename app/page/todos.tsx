import CategoryBar from '@/components/Common/CategoryBar';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useContext, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTodos } from '../hooks/useTodos';
import { Todo } from '../types';
import { ColorContext } from './ColorContext';

export default function TodosScreen() {
	const { colors } = useContext(ColorContext);
	const insets = useSafeAreaInsets();
	const [newTitle, setNewTitle] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<'all' | number>('all');

	// 오늘 날짜로 useTodos hook 사용
	const today = new Date();
	const {
		todos,
		categories,
		coloredCategories,
		fetchTodos,
		fetchCategories,
		addTodo,
		toggleTodo,
		deleteTodo,
	} = useTodos(today);

	useEffect(() => {
		fetchCategories();
	}, []);

	const handleAddTodo = async () => {
		if (!newTitle.trim()) return;
		await addTodo(newTitle, selectedCategory);
		setNewTitle('');
	};

	const handleDeleteTodo = async (id: number) => {
		await deleteTodo(id);
	};

	// 카테고리 필터링
	const filteredTodos = selectedCategory === 'all'
		? todos
		: todos.filter(todo => todo.categories.some(cat => cat.id === selectedCategory));

	const renderItem = ({ item }: { item: Todo }) => (
		<View style={styles.todoCard}>
			<Pressable
				onPress={() => toggleTodo(item.id, item.completed)}
				style={styles.todoContent}
			>
				<View style={styles.checkboxContainer}>
					<Ionicons
						name={item.completed ? 'checkbox' : 'square-outline'}
						size={24}
						color={item.completed ? '#4CAF50' : '#9CA3AF'}
					/>
				</View>
				<View style={styles.todoTextContainer}>
					<ThemedText
						style={[
							styles.todoTitle,
							item.completed && styles.completedText
						]}
					>
						{item.title}
					</ThemedText>
					{item.categories && item.categories.length > 0 && (
						<View style={styles.categoryBadgesContainer}>
							{item.categories.map((cat) => (
								<View
									key={cat.id}
									style={[
										styles.categoryBadge,
										{ backgroundColor: cat.color || '#E0E0E0' }
									]}
								>
									<ThemedText style={styles.categoryBadgeText}>
										{cat.text}
									</ThemedText>
								</View>
							))}
						</View>
					)}
				</View>
			</Pressable>
			<Pressable
				onPress={() => handleDeleteTodo(item.id)}
				style={styles.deleteButton}
			>
				<Ionicons name="trash-outline" size={20} color="#FF3B30" />
			</Pressable>
		</View>
	);

	return (
		<LinearGradient
			colors={colors as [string, string, ...string[]]}
			style={{ flex: 1 }}
		>
			<View style={[styles.container, { paddingTop: insets.top }]}>
				<View style={styles.header}>
					<ThemedText style={styles.title}>할일 목록</ThemedText>
				</View>

				{/* 카테고리 필터 바 */}
				{coloredCategories.length > 0 && (
					<CategoryBar
						categories={coloredCategories}
						selectedCategory={selectedCategory}
						onSelectCategory={setSelectedCategory}
					/>
				)}

				{/* 할 일 추가 입력 */}
				<View style={styles.inputContainer}>
					<TextInput
						style={styles.input}
						placeholder="새 할일 제목"
						value={newTitle}
						onChangeText={setNewTitle}
						placeholderTextColor="#999"
						onSubmitEditing={handleAddTodo}
						returnKeyType="done"
					/>
					<Pressable
						style={[styles.addButton, !newTitle.trim() && styles.addButtonDisabled]}
						onPress={handleAddTodo}
						disabled={!newTitle.trim()}
					>
						<Ionicons name="add" size={24} color="#fff" />
					</Pressable>
				</View>

				{/* 선택된 카테고리 표시 */}
				{selectedCategory !== 'all' && (
					<View style={styles.selectedCategoryInfo}>
						<ThemedText style={styles.selectedCategoryText}>
							{coloredCategories.find(c => c.id === selectedCategory)?.text} 카테고리에 추가됩니다
						</ThemedText>
					</View>
				)}

				{/* 할 일 목록 */}
				<FlatList
					data={filteredTodos}
					keyExtractor={(item) => String(item.id)}
					renderItem={renderItem}
					contentContainerStyle={styles.listContent}
					ListEmptyComponent={
						<View style={styles.emptyState}>
							<ThemedText style={styles.emptyText}>할일이 없습니다</ThemedText>
							<ThemedText style={styles.emptySubText}>
								{selectedCategory === 'all'
									? '새 할일을 추가해보세요'
									: '이 카테고리에 할일이 없습니다'}
							</ThemedText>
						</View>
					}
				/>
			</View>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 20,
	},
	header: {
		paddingVertical: 16,
		alignItems: 'center',
	},
	title: {
		fontSize: 22,
		fontFamily: 'Cafe24Ssurround',
	},
	inputContainer: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 16,
		marginBottom: 12,
	},
	input: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		fontFamily: 'Cafe24Ssurround',
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
	},
	addButton: {
		backgroundColor: '#FF9F43',
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#FF9F43',
		shadowOpacity: 0.3,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
		elevation: 4,
	},
	addButtonDisabled: {
		backgroundColor: '#CCCCCC',
		shadowOpacity: 0.1,
	},
	selectedCategoryInfo: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		backgroundColor: 'rgba(255, 159, 67, 0.1)',
		borderRadius: 12,
		marginBottom: 12,
	},
	selectedCategoryText: {
		fontSize: 13,
		color: '#FF9F43',
		fontFamily: 'Cafe24Ssurround',
		textAlign: 'center',
	},
	listContent: {
		paddingBottom: 20,
	},
	todoCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		marginBottom: 12,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 14,
		shadowColor: '#000',
		shadowOpacity: 0.06,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
	},
	todoContent: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	checkboxContainer: {
		marginRight: 12,
	},
	todoTextContainer: {
		flex: 1,
	},
	todoTitle: {
		fontSize: 16,
		color: '#212529',
		fontFamily: 'Cafe24Ssurround',
		marginBottom: 4,
	},
	completedText: {
		textDecorationLine: 'line-through',
		color: '#9CA3AF',
	},
	categoryBadgesContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
		marginTop: 4,
	},
	categoryBadge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
	},
	categoryBadgeText: {
		fontSize: 11,
		color: '#333',
		fontFamily: 'Cafe24Ssurround',
	},
	deleteButton: {
		marginLeft: 12,
		padding: 8,
	},
	emptyState: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 60,
	},
	emptyText: {
		fontSize: 16,
		color: '#6C757D',
		fontFamily: 'Cafe24Ssurround',
		marginBottom: 8,
	},
	emptySubText: {
		fontSize: 14,
		color: '#9CA3AF',
		fontFamily: 'Cafe24Ssurround',
	},
});
