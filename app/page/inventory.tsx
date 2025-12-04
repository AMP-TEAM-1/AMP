import { useFocusEffect } from 'expo-router';
import React, { useCallback, useContext, useState } from 'react';
import { StyleSheet, TextStyle, View } from 'react-native';

import AppHeader from '@/components/AppHeader';
import ConfirmationModal from '@/components/ConfirmationModal';
import ItemListView from '@/components/ItemListView';
import { ThemedText } from '@/components/themed-text';
import { Item, ItemCategory } from '@/data/items'; // ItemCategory 임포트 유지
import { useUserStore } from '@/store/userStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorContext } from './ColorContext';

// 아이템 타입에 따른 한글 이름을 매핑합니다.
const ITEM_TYPE_KOREAN: { [key: string]: string } = {
  hat: '모자',
  accessory: '장신구',
  background: '배경',
};

export default function InventoryScreen() {
  // useInventory 대신 userStore 사용
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

  // 화면이 포커스될 때마다 fetchUserData 호출
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  const handleItemPress = (item: Item) => {
    // 이미 장착된 아이템인지 확인
    if (item.is_equipped) {
      setModalMainText('해제하시겠습니까?');
      setModalTextStyle({}); // 기본 폰트 크기
      setSelectedItem(item);
      setIsModalVisible(true);
      return;
    }

    // 선택한 아이템과 같은 타입의 아이템 중 이미 장착된 것이 있는지 확인
    const currentlyEquipped = inventoryItems.find(
      (invItem) => invItem.type === item.type && invItem.is_equipped
    );

    if (currentlyEquipped) {
      const itemTypeName = ITEM_TYPE_KOREAN[item.type] || '아이템';
      setModalMainText(`이미 ${itemTypeName}을(를) 착용하고 있어요.\n새로운 ${itemTypeName}(으)로 교체할까요?`);
      setModalTextStyle({ fontSize: 16 }); // 교체 시 폰트 크기 작게
    } else {
      setModalMainText('착용하시겠습니까?');
      setModalTextStyle({}); // 기본 폰트 크기
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
    setSelectedItem(null); // 모달이 닫힐 때 선택된 아이템 초기화
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
          onConfirm={handleConfirm}
          mainText={modalMainText}
          mainTextStyle={modalTextStyle}
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
              {item.is_equipped ? '장착 중' : '보유 중'}
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
    fontSize: 13,
    fontFamily: 'Cafe24Ssurround',
  },
});
