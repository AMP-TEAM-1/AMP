import { useFocusEffect } from 'expo-router';
import React, { useCallback, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import AppHeader from '@/components/AppHeader';
import ConfirmationModal from '@/components/ConfirmationModal';
import ItemListView from '@/components/ItemListView';
import { ThemedText } from '@/components/themed-text';
import { Item, ItemCategory } from '@/data/items'; // ItemCategory 임포트 유지
import { useUserStore } from '@/store/userStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorContext } from './ColorContext';

export default function InventoryScreen() {
  // useInventory 대신 userStore 사용
  const { 
    inventoryItems, 
    carrots, 
    equipItem, 
    fetchUserData 
  } = useUserStore();

  const { colors } = useContext(ColorContext);
  const insets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>('모자');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // 화면이 포커스될 때마다 fetchUserData 호출
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
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
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <AppHeader
          title="인벤토리"
          leftIcon="arrow-back"
          headerStyle={{ backgroundColor: 'transparent' }}
        />

        {/* 당근 재화 표시 */}
        <View style={styles.carrotContainer}>
          <ThemedText style={styles.carrotText}>🥕 {carrots}</ThemedText>
        </View>
  
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
          containerStyle={{ paddingTop: 40 }} // 당근 개수와 겹치지 않도록 상단 여백 추가
          title="인벤토리"
          items={inventoryItems}
          carrots={carrots}
          loading={false}
          selectedCategory={selectedCategory}
          onTabPress={handleTabPress}
          onItemPress={handleItemPress}
          selectedItemId={null}
          mode="inventory"
          renderItemFooter={(item) => (
            <ThemedText style={styles.itemText}>
              {'is_equipped' in item ? (item.is_equipped ? '장착 중' : '보유 중') : '구매 가능'}
            </ThemedText>
          )}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  carrotContainer: {
    position: 'absolute',
    top: 60, // AppHeader의 높이(60px)만큼 아래로 내려서 겹치지 않게 합니다.
    left: 20,
    paddingVertical: 11,
    backgroundColor: 'transparent',
    zIndex: 1, // ItemListView 위에 표시되도록 zIndex 추가
  },
  carrotText: {
    fontSize: 18,
    fontFamily: 'Cafe24Ssurround',
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 12,
    fontFamily: 'Cafe24Ssurround',
  },
});
