import { useFocusEffect } from 'expo-router';
import React, { useCallback, useContext, useState } from 'react';
import { StyleSheet, TextStyle, View } from 'react-native';

import AppHeader from '@/components/AppHeader';
import ConfirmationModal from '@/components/ConfirmationModal';
import ItemListView from '@/components/ItemListView';
import { ThemedText } from '@/components/themed-text';
import { Item, ItemCategory } from '@/data/items';
import { useUserStore } from '@/store/userStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorContext } from './ColorContext';

const ITEM_TYPE_KOREAN: { [key: string]: string } = {
  hat: '모자',
  accessory: '장신구',
  background: '배경',
};

export default function InventoryScreen() {
  const {
    inventoryItems,
    carrots,
    equipItem,
    unequipItem,
    fetchUserData
  } = useUserStore();

  const { colors } = useContext(ColorContext);
  const insets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('모자');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [modalMainText, setModalMainText] = useState('');
  const [modalTextStyle, setModalTextStyle] = useState<TextStyle>({});

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  const handleItemPress = (item: Item) => {
    if (item.is_equipped) {
      setModalMainText('해제하시겠습니까?');
      setModalTextStyle({});
      setSelectedItem(item);
      setIsModalVisible(true);
      return;
    }

    const currentlyEquipped = inventoryItems.find(
      (invItem) => invItem.type === item.type && invItem.is_equipped
    );

    if (currentlyEquipped) {
      const itemTypeName = ITEM_TYPE_KOREAN[item.type] || '아이템';
      setModalMainText(`이미 ${itemTypeName}을(를) 착용하고 있어요.\n새로운 ${itemTypeName}(으)로 교체할까요?`);
      setModalTextStyle({ fontSize: 16 });
    } else {
      setModalMainText('착용하시겠습니까?');
      setModalTextStyle({});
    }
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!selectedItem) return;

    if (selectedItem.is_equipped) {
      await unequipItem(selectedItem);
    } else {
      await equipItem(selectedItem);
    }
    setIsModalVisible(false);
  };

  const handleCancelEquip = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  const handleTabPress = (category: ItemCategory) => {
    setSelectedCategory(category);
  };

  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* 1. 상단 헤더 */}
        <AppHeader
          title="인벤토리"
          leftIcon="arrow-back"
          headerStyle={{ backgroundColor: 'transparent' }}
        />

        {/* 2. 당근 재화 표시 (Absolute 제거 -> Flex로 오른쪽 배치) */}
        <View style={styles.currencyBar}>
          <View style={styles.carrotBadge}>
            <ThemedText style={styles.carrotText}>🥕 {carrots}</ThemedText>
          </View>
        </View>

        <ConfirmationModal
          visible={isModalVisible}
          item={selectedItem}
          onClose={handleCancelEquip}
          onConfirm={handleConfirm}
          mainText={modalMainText}
          mainTextStyle={modalTextStyle}
          confirmButtonText="예"
          cancelButtonText="아니오"
        />

        {/* 3. 리스트 뷰 */}
        <View style={{ flex: 1 }}>
          <ItemListView
            title="인벤토리"
            items={inventoryItems}
            loading={false}
            selectedCategory={selectedCategory}
            onTabPress={handleTabPress}
            onItemPress={handleItemPress}
            selectedItemId={null}
            mode="inventory"
            renderItemFooter={(item) => (
              <ThemedText style={styles.itemText}>
                {item.is_equipped ? '장착 중' : '보유 중'}
              </ThemedText>
            )}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  currencyBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    marginTop: -10,
    marginBottom: 16,
    zIndex: 1,
  },
  carrotBadge: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  carrotText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  itemText: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
    color: '#6C757D',
  },
});