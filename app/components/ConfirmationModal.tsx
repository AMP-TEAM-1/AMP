import { ThemedText } from '@/components/themed-text';
import { Item } from '@/data/items';
import React from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';

/**
 * 사용자에게 특정 작업을 확인받기 위한 재사용 가능한 모달(팝업) 컴포넌트입니다.
 * 아이템 구매, 장착 등 확인이 필요한 다양한 상황에서 사용됩니다.
 */

interface ConfirmationModalProps {
  visible: boolean;
  item: Item | null;
  onClose: () => void;
  onConfirm: () => void;
  onModalHide?: () => void; // 모달이 완전히 사라진 후 호출될 함수 prop 추가
  mainText: string;
  confirmButtonText: string;
  cancelButtonText?: string;
}

export default function ConfirmationModal({
  visible,
  item,
  onClose,
  onConfirm,
  onModalHide,
  mainText,
  confirmButtonText,
  cancelButtonText = '취소',
}: ConfirmationModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      onModalHide={onModalHide} // Modal이 사라진 후 onModalHide 함수를 호출
    >
      {/* item이 null일 때 모달 내용이 렌더링되지 않도록 수정 */}
      {item && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalItemImageContainer}>
              {item.image ? (
                <Image source={item.image} style={styles.modalItemImage} resizeMode="contain" />
              ) : (
                <ThemedText style={{ fontSize: 60 }}>{'❓'}</ThemedText>
              )}
            </View>
            <ThemedText style={styles.modalText}>
              {mainText}
            </ThemedText>
            <View style={styles.modalButtonContainer}>
              <Pressable style={[styles.modalButton, styles.confirmButton]} onPress={onConfirm}>
                <ThemedText style={styles.modalButtonText}>{confirmButtonText}</ThemedText>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
                <ThemedText style={[styles.modalButtonText, { color: '#4A4459' }]}>{cancelButtonText}</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 35,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalItemImageContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalItemImage: {
    width: '100%',
    height: '100%',
  },
  modalText: {
    marginBottom: 30,
    textAlign: 'center',
    fontSize: 22,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    borderRadius: 25,
    padding: 10,
    elevation: 2,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: '#E8730D8A',
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});