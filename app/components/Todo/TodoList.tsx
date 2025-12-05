import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Todo } from '../../types';
import TodoItem from './TodoItem';

interface TodoListProps {
    todos: Todo[];
    editingId: number | null;
    onToggle: (id: number, current: boolean) => void;
    onPressEditAction: (todo: Todo) => void;
    onChangeTitle: (id: number, text: string) => void;
    onFinishEdit: (id: number, text: string) => void;
}

export default function TodoList({
    todos,
    editingId,
    onToggle,
    onPressEditAction,
    onChangeTitle,
    onFinishEdit,
}: TodoListProps) {

    if (todos.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>할 일이 없습니다 ✨</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={todos}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 80 }}
            renderItem={({ item }) => (
                <TodoItem
                    todo={item}
                    isEditing={editingId === item.id}
                    onToggle={() => onToggle(item.id, item.completed)}
                    onPressEdit={() => onPressEditAction(item)}
                    onChangeText={(text) => onChangeTitle(item.id, text)}
                    onFinishEdit={() => onFinishEdit(item.id, item.title)}
                />
            )}
        />
    );
}

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#aaa',
        fontFamily: 'Cafe24Ssurround',
    },
});