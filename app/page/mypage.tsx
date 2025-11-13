import AppHeader from '@/components/AppHeader';
import { ThemedText } from '@/components/themed-text';

import CharacterView from '@/components/CharacterView';
import ConfirmationModal from '@/components/ConfirmationModal';
import ShopBottomSheet from '@/components/ShopBottomSheet';
import Toast from '@/components/Toast';
import { ThemedView } from '@/components/themed-view';
import { InventoryItem, Item, ShopItem } from '@/data/items';
import { useShop } from '@/hooks/useShop';
import { useShopBottomSheet } from '@/hooks/useShopBottomSheet';
import { useUserStore } from '@/store/userStore';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyPageScreen() {
  const {
    panGesture,
    animatedSheetStyle,
    animatedRabbitStyle,
    selectedCategory,
    isSheetMinimized,
    isHandleTouched,
    handleTabPress,
  } = useShopBottomSheet({ initialState: 'minimized' });

  // useShop 훅은 상점 아이템과 '구매' 기능만 담당
  const { shopItems: originalShopItems, loading, purchaseItem } = useShop();
  // 2. '당근'과 '장착된 아이템' 정보는 전역 스토어에서 직접 가져옴
  const { carrots, inventoryItems } = useUserStore();
  const equippedItems = inventoryItems.filter(
    (item): item is InventoryItem & { image: any } => 'is_equipped' in item && item.is_equipped
  );

  const isShopItem = (item: Item): item is (ShopItem & { image: any; is_owned?: boolean }) => {
    return 'price' in item;
  };

  const shopItems = originalShopItems.map(item => ({
    ...item,
    is_owned: inventoryItems.some(invItem => invItem.item_id === item.item_id)
  }));

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const openPurchaseModal = (item: Item) => {
    if (item.is_owned) return; // 이미 보유한 아이템은 모달을 열지 않음
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  // 실제 구매를 처리하는 함수
  const confirmPurchase = async () => {
    if (!selectedItem) return;
    setIsModalVisible(false);
    const success = await purchaseItem(selectedItem);
    if (!success) {
      setToastMessage('‘캐롯’이 부족해요. 할 일을 완료하고 더 모아볼까요?');
      // Toast가 사라진 후 메시지를 null로 초기화하여 다시 띄울 수 있게 함
      setTimeout(() => setToastMessage(null), 3300); // duration + animation time
      setSelectedItem(null); // 구매 실패 시 아이템 선택 해제
    }
  };

  const cancelPurchase = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  // 모달이 완전히 사라진 후 실행될 콜백 함수
  const handleModalHide = () => {
    // 구매 확인 모달이 닫힐 때, 구매 실패가 아닌 경우(취소 등) 선택을 해제합니다.
    if (!toastMessage) setSelectedItem(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <AppHeader title="마이페이지" titleStyle={{ fontFamily: 'Jua' }} />

        <ConfirmationModal
          visible={isModalVisible}
          item={selectedItem}
          onClose={cancelPurchase}
          onConfirm={confirmPurchase}
          onModalHide={handleModalHide}
          mainText={selectedItem && isShopItem(selectedItem) ? `🥕 ${selectedItem.price}` : ''}
          confirmButtonText="구매하기"
          cancelButtonText="취소"
        />

        {/* 하단 아이템 상점 (Bottom Sheet) */}
        <ShopBottomSheet
          panGesture={panGesture}
          animatedStyle={animatedSheetStyle}
          loading={loading}
          shopItems={shopItems}
          selectedCategory={selectedCategory}
          selectedItemId={selectedItem?.item_id ?? null}
          onTabPress={handleTabPress}
          onItemPress={openPurchaseModal}
          renderItemFooter={(item) =>
            item.is_owned ? (
              <ThemedText style={styles.itemText}>보유 중</ThemedText>
            ) : (
              isShopItem(item) && (
                <ThemedText style={styles.itemText}>🥕 {item.price}</ThemedText>
              )
            )
          }
        />

        {/* 상단 영역 (캐릭터, 재화) */}
        <CharacterView
          carrots={carrots}
          equippedItems={equippedItems} // 장착 아이템 목록 전달
          isSheetMinimized={isSheetMinimized}
          isHandleTouched={isHandleTouched}
          animatedRabbitStyle={animatedRabbitStyle}
        />

        <Toast message={toastMessage} />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 4 },
  itemText: {
    fontSize: 12,
    fontFamily: 'Jua',
  },
});