import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Category } from '../../types';
import { ThemedText } from '../themed-text';

interface CategorySelectionModalProps {
    visible: boolean;
    onClose: () => void;
    categories: Category[];
    selectedCategoryIds: number[];
    onConfirm: (categoryIds: number[]) => void;
}

export default function CategorySelectionModal({
    visible,
    onClose,
    categories,
    selectedCategoryIds,
    onConfirm,
}: CategorySelectionModalProps) {
    const [tempSelected, setTempSelected] = useState<number[]>(selectedCategoryIds);

    // 모달이 열릴 때 선택 상태 초기화
    React.useEffect(() => {
        if (visible) {
            setTempSelected(selectedCategoryIds);
        }
    }, [visible, selectedCategoryIds]);

    const toggleCategory = (categoryId: number) => {
        setTempSelected(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleConfirm = () => {
        onConfirm(tempSelected);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose} />

            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <ThemedText style={styles.title}>카테고리 선택</ThemedText>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </Pressable>
                    </View>

                    <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
                        {categories.map((category) => {
                            const isSelected = tempSelected.includes(category.id);
                            return (
                                <Pressable
                                    key={category.id}
                                    style={[
                                        styles.categoryItem,
                                        isSelected && styles.categoryItemSelected
                                    ]}
                                    onPress={() => toggleCategory(category.id)}
                                >
                                    <View style={styles.categoryContent}>
                                        <View
                                            style={[
                                                styles.colorDot,
                                                { backgroundColor: category.color || '#E0E0E0' }
                                            ]}
                                        />
                                        <ThemedText style={styles.categoryText}>
                                            {category.text}
                                        </ThemedText>
                                    </View>
                                    {isSelected && (
                                        <Ionicons name="checkmark" size={24} color="#4CAF50" />
                                    )}
                                </Pressable>
                            );
                        })}

                        {categories.length === 0 && (
                            <View style={styles.emptyState}>
                                <ThemedText style={styles.emptyText}>
                                    카테고리가 없습니다
                                </ThemedText>
                                <ThemedText style={styles.emptySubText}>
                                    카테고리 페이지에서 추가해주세요
                                </ThemedText>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.footer}>
                        <Pressable
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <ThemedText style={styles.cancelButtonText}>취소</ThemedText>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.confirmButton]}
                            onPress={handleConfirm}
                        >
                            <ThemedText style={styles.confirmButtonText}>확인</ThemedText>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        maxHeight: '70%',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Cafe24Ssurround',
    },
    closeButton: {
        padding: 4,
    },
    categoryList: {
        maxHeight: 300,
        paddingHorizontal: 20,
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#F8F9FA',
    },
    categoryItemSelected: {
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    categoryContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    colorDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    categoryText: {
        fontSize: 16,
        fontFamily: 'Cafe24Ssurround',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F0F0F0',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'Cafe24Ssurround',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    confirmButtonText: {
        fontSize: 16,
        color: '#fff',
        fontFamily: 'Cafe24Ssurround',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'Cafe24Ssurround',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        fontFamily: 'Cafe24Ssurround',
    },
});
