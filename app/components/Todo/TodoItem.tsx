import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Todo } from '../../types';
import { ThemedText } from '../themed-text';

interface TodoItemProps {
    todo: Todo;
    isEditing: boolean;
    onToggle: () => void;
    onPressEdit: () => void;
    onChangeText: (text: string) => void;
    onFinishEdit: () => void;
}

export default function TodoItem({
    todo,
    isEditing,
    onToggle,
    onPressEdit,
    onChangeText,
    onFinishEdit,
}: TodoItemProps) {

    // 카테고리 색상바 
    const categoryColor = todo.categories.length > 0 ? todo.categories[0].color : '#ccc';

    return (
        <View style={styles.cardContainer}>
            {/* 왼쪽 컬러 바 (띠) */}
            <View style={[styles.colorBar, { backgroundColor: categoryColor }]} />

            <View style={styles.contentContainer}>
                {/* 제목 및 입력 */}
                <View style={styles.textContainer}>
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={todo.title}
                            onChangeText={onChangeText}
                            onBlur={onFinishEdit}
                            autoFocus
                        />
                    ) : (
                        <Pressable onPress={onToggle}>
                            <ThemedText style={[styles.title, todo.completed && styles.completedTitle]}>
                                {todo.title}
                            </ThemedText>
                        </Pressable>
                    )}

                    {/* 카테고리 태그 및 알람 정보 */}
                    <View style={styles.metaContainer}>
                        {todo.categories.map((cat) => (
                            <View key={cat.id} style={styles.categoryTag}>
                                <ThemedText style={styles.categoryText}>{cat.text}</ThemedText>
                            </View>
                        ))}
                        {todo.alarm_time && (
                            <View style={styles.alarmTag}>
                                <Ionicons name="alarm-outline" size={12} color="#ff6b6b" />
                                <ThemedText style={styles.alarmText}>{todo.alarm_time}</ThemedText>
                            </View>
                        )}
                    </View>
                </View>

                {/* 오른쪽 버튼 영역 */}
                <View style={styles.actionContainer}>
                    {!isEditing && (
                        <Pressable onPress={onPressEdit} style={styles.iconButton}>
                            <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
                        </Pressable>
                    )}

                    <Pressable onPress={onToggle} style={styles.checkButton}>
                        {todo.completed ? (
                            <Ionicons name="checkbox" size={24} color="#1f7aeb" />
                        ) : (
                            <Ionicons name="square-outline" size={24} color="#ccc" />
                        )}
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        marginVertical: 6,
        marginHorizontal: 2,
        height: 70, // 카드 높이 고정 
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#AEAEAE',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    colorBar: {
        width: 6,
        height: '100%',
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    title: {
        fontSize: 16,
        fontFamily: 'Cafe24Ssurround',
        color: '#333',
    },
    completedTitle: {
        textDecorationLine: 'line-through',
        color: '#aaa',
    },
    input: {
        fontSize: 16,
        fontFamily: 'Cafe24Ssurround',
        borderBottomWidth: 1,
        borderColor: '#1f7aeb',
        padding: 0,
    },
    metaContainer: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    categoryTag: {
        backgroundColor: '#FFF4E0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    categoryText: {
        fontSize: 10,
        color: '#FFB74D',
        fontWeight: 'bold',
    },
    alarmTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    alarmText: {
        fontSize: 10,
        color: '#ff6b6b',
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        padding: 4,
    },
    checkButton: {
        padding: 4,
    },
});