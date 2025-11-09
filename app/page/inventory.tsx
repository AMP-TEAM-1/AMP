import { router, Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import ConfirmationModal from '@/components/ConfirmationModal';
import ItemListView from '@/components/ItemListView';
import { ThemedText } from '@/components/themed-text';
import { Item, ItemCategory } from '@/data/items';
import { useInventory } from '@/hooks/useInventory';
import { Ionicons } from '@expo/vector-icons';

export default function InventoryScreen() {
  const { inventoryItems, carrots, loading, equipItem, fetchInventory } = useInventory();
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>('모자');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchInventory();
    }, [fetchInventory])
  );

  const handleItemPress = (item: Item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleConfirmEquip = async () => {
    if (!selectedItem) return;
    await equipItem(selectedItem);
    setIsModalVisible(false);
  };

  const handleCancelEquip = () => {
    setIsModalVisible(false);
  };

  const handleTabPress = (category: ItemCategory) => {
    setSelectedCategory(category);
  };

  return (
    <>
      {/* ItemListView에서 분리된 헤더를 여기서 직접 정의합니다. */}
      <Stack.Screen
        options={{
          headerShown: true,
          title: '인벤토리',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ paddingLeft: 10 }}>
              <Ionicons name="arrow-back" size={28} color="black" />
            </Pressable>
          ),
          headerTitleStyle: {
            fontFamily: 'Jua',
            fontSize: 20,
          },
        }}
      />

      <ConfirmationModal
        visible={isModalVisible}
        item={selectedItem}
        onClose={handleCancelEquip}
        onConfirm={handleConfirmEquip}
        mainText="착용하시겠습니까?"
        confirmButtonText="예"
        cancelButtonText="아니오"
      />

      <ItemListView
        title="인벤토리"
        items={inventoryItems}
        carrots={carrots}
        loading={loading}
        selectedCategory={selectedCategory}
        onTabPress={handleTabPress}
        onItemPress={handleItemPress}
        selectedItemId={null}
        renderItemFooter={(item) => <ThemedText style={styles.itemText}>{item.is_equipped ? '장착 중' : '보유 중'}</ThemedText>}
      />
    </>
  );
}

const styles = StyleSheet.create({
  itemText: { fontSize: 12, fontFamily: 'Jua' },
});