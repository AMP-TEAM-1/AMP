//UI 개발 및 테스트를 위해 로컬 JSON 파일(shopItems.json)을 임시 데이터로 사용하고 있으며,
// 실제 서버와 통신하는 API 연동 로직은 주석 처리되어 있습니다.
import { ThemedText } from '@/components/themed-text';
import { useNavigation } from '@react-navigation/native';

import AppHeader from '@/components/AppHeader';
import CharacterView from '@/components/CharacterView';
import ConfirmationModal from '@/components/ConfirmationModal';
import ShopBottomSheet from '@/components/ShopBottomSheet';
import Toast from '@/components/Toast';
import { ThemedView } from '@/components/themed-view';
import { Item } from '@/data/items';
import { useShop } from '@/hooks/useShop';
import { useShopBottomSheet } from '@/hooks/useShopBottomSheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ColorContext } from './ColorContext';

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

  const navigation = useNavigation<any>();
  const { colors } = useContext(ColorContext);
  const { shopItems, carrots, loading, purchaseItem } = useShop();
  const [isModalVisible, setIsModalVisible] = useState(false);
  // [수정] 컴포넌트가 직접 아이템 선택 상태를 관리합니다.
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 구매 모달을 여는 함수
  const openPurchaseModal = (item: Item) => {
    if (item.is_owned) return; // 이미 보유한 아이템은 모달을 열지 않음
    setSelectedItem(item); // 아이템 선택
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
    // 모달을 먼저 닫고, 애니메이션이 끝난 후 selectedItem을 null로 설정합니다.
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  // 모달이 완전히 사라진 후 실행될 콜백 함수
  const handleModalHide = () => {
    // 구매 확인 모달이 닫힐 때, 구매 실패가 아닌 경우(취소 등) 선택을 해제합니다.
    if (!toastMessage) setSelectedItem(null);
  };

  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      locations={[0, 0.35, 0.65, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          {/* Stack.Screen 대신 AppHeader 컴포넌트를 사용합니다. */}
          <AppHeader title="마이페이지" style={{ backgroundColor: 'transparent' }} />

          <ConfirmationModal
            visible={isModalVisible}
            item={selectedItem}
            onClose={cancelPurchase}
            onConfirm={confirmPurchase}
            onModalHide={handleModalHide}
            mainText={`🥕 ${selectedItem?.price}`}
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
            selectedItemId={selectedItem?.item_id} // 이 prop이 ShopBottomSheet에 전달되어야 합니다.
            onTabPress={handleTabPress}
            onItemPress={openPurchaseModal}
            renderItemFooter={(item) =>
              item.is_owned ? (
                <ThemedText style={styles.itemText}>보유 중</ThemedText>
              ) : (
                <ThemedText style={styles.itemText}>🥕 {item.price}</ThemedText>
              )
            }
          />

          {/* 상단 영역 (캐릭터, 재화) */}
          <CharacterView
            carrots={carrots}
            isSheetMinimized={isSheetMinimized}
            isHandleTouched={isHandleTouched}
            animatedRabbitStyle={animatedRabbitStyle}
          />

          <Toast message={toastMessage} />
        </ThemedView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1, backgroundColor: 'transparent', paddingTop: 4 },
  itemText: {
    fontSize: 12,
  },
});