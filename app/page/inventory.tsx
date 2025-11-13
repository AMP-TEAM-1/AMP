import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useContext, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, View } from 'react-native';

import ConfirmationModal from '@/components/ConfirmationModal';
import ItemListView from '@/components/ItemListView';
import { ThemedText } from '@/components/themed-text';
import { Item, ItemCategory } from '@/data/items';
import { useInventory } from '@/hooks/useInventory';
import { Ionicons } from '@expo/vector-icons';
import { ColorContext } from './ColorContext';

export default function InventoryScreen() {
  const { inventoryItems, carrots, loading, equipItem, fetchInventory } = useInventory();
  const { colors } = useContext(ColorContext);
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
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      locations={[0, 0.35, 0.65, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        {/* ItemListView에서 분리된 헤더를 여기서 직접 정의합니다. */}
        <Stack.Screen
          options={{
            headerShown: true,
            title: '인벤토리',
            headerTitleAlign: 'center',
            headerShadowVisible: false,
            headerTransparent: true, // 헤더를 투명하게 만듭니다.
            headerLeft: () => (
              <Pressable onPress={() => router.back()} style={{ paddingLeft: 10 }}>
                <Ionicons name="arrow-back" size={28} color="black" />
              </Pressable>
            ),
            headerTitleStyle: {
              fontFamily: 'Jua',
              fontSize: 20,
              color: '#000',
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

        {/* 보유한 당근 개수를 표시하는 영역 (마이페이지와 동일한 위치) */}
        <View style={styles.carrotContainer}>
          <ThemedText style={styles.carrotText}>🥕 {carrots}</ThemedText>
        </View>

        <View style={{ flex: 1, backgroundColor: 'transparent', paddingTop: 110 }}>
          <ItemListView
            title="인벤토리"
            items={inventoryItems}
            loading={loading}
            selectedCategory={selectedCategory}
            onTabPress={handleTabPress}
            onItemPress={handleItemPress}
            selectedItemId={null}
            renderItemFooter={(item) => (
              <ThemedText style={styles.itemText}>{item.is_equipped ? '장착 중' : '보유 중'}</ThemedText>
            )}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  carrotContainer: {
    position: 'absolute',
    top: 60, // 헤더의 높이(60px)만큼 아래로 내려서 겹치지 않게 합니다.
    left: 20,
    paddingVertical: 11,
    backgroundColor: 'transparent',
    zIndex: 10, // 다른 UI 요소 위에 표시되도록 zIndex 추가
  },
  carrotText: {
    fontSize: 18,
    fontFamily: 'Jua',
    fontWeight: 'bold',
  },
  itemText: { fontSize: 12, fontFamily: 'Jua' },
});