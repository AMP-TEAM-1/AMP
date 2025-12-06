import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

interface TodoActionModalProps {
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onCategorySetting: () => void;
    onDelete: () => void;
}

export default function TodoActionModal({
    visible,
    onClose,
    onEdit,
    onCategorySetting,
    onDelete,
}: TodoActionModalProps) {

    const MenuRow = ({ icon, color, text, onPress, isDestructive = false }: any) => (
        <Pressable style={styles.menuRow} onPress={onPress}>
            <Ionicons name={icon} size={20} color={color} style={{ marginRight: 12 }} />
            <ThemedText style={{ fontSize: 16, color: color, fontFamily: 'Cafe24Ssurround' }}>
                {text}
            </ThemedText>
        </Pressable>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose} />

            <View style={styles.modalContainer}>
                <View style={styles.menuBox}>
                    <MenuRow icon="pencil-outline" color="#1f7aeb" text="수정하기" onPress={onEdit} />
                    <View style={styles.divider} />
                    <MenuRow icon="book-outline" color="#4CAF50" text="카테고리 설정" onPress={onCategorySetting} />
                    <View style={styles.divider} />
                    <MenuRow icon="trash-outline" color="#FF5252" text="삭제하기" onPress={onDelete} isDestructive />
                </View>

                <Pressable style={styles.cancelButton} onPress={onClose}>
                    <ThemedText style={styles.cancelText}>취소</ThemedText>
                </Pressable>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 20,
        paddingBottom: 40,
    },
    menuBox: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 12,
        overflow: 'hidden',
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        width: '100%',
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
        fontFamily: 'Cafe24Ssurround',
    },
});