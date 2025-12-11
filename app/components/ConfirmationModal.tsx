import { ThemedText } from '@/components/themed-text';
import { Item } from '@/data/items';
import React from 'react';
import { Image, Modal, Pressable, StyleSheet, TextStyle, View } from 'react-native';

interface ConfirmationModalProps {
  visible: boolean;
  item: Item | null;
  onClose: () => void;
  onConfirm: () => void;
  onModalHide?: () => void; 
  mainText: string;
  confirmButtonText: string;
  mainTextStyle?: TextStyle;
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
  mainTextStyle,
  cancelButtonText = '취소',
}: ConfirmationModalProps) {

  const handleCancel = () => {
    onClose();

    if (onModalHide) {
      onModalHide();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel} 
    >
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
            <ThemedText style={[styles.modalText, mainTextStyle]}>
              {mainText}
            </ThemedText>
            <View style={styles.modalButtonContainer}>
              <Pressable style={[styles.modalButton, styles.confirmButton]} onPress={onConfirm}>
                <ThemedText style={styles.modalButtonText}>{confirmButtonText}</ThemedText>
              </Pressable>

              {/* 취소 버튼에 handleCancel 연결 */}
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={handleCancel}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 24, 
    paddingVertical: 35,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
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
    fontSize: 20,
    fontFamily: 'Cafe24Ssurround',
    color: '#212529',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#FF9F43',
    shadowColor: '#FF9F43',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: '#E9ECEF',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});