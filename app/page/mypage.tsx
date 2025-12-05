import AppHeader from '@/components/AppHeader';
import CharacterView from '@/components/CharacterView';
import ConfirmationModal from '@/components/ConfirmationModal';
import ShopBottomSheet from '@/components/ShopBottomSheet';
import { ThemedText } from '@/components/themed-text';
import Toast from '@/components/Toast';
import { InventoryItem, Item, ShopItem } from '@/data/items';
import { useShop } from '@/hooks/useShop';
import { useShopBottomSheet } from '@/hooks/useShopBottomSheet';
import { useUserStore } from '@/store/userStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useContext, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { ColorContext } from './ColorContext';

export default function MyPageScreen() {
  const { panGesture, animatedSheetStyle, animatedRabbitStyle, selectedCategory, isSheetMinimized, isHandleTouched, handleTabPress } = useShopBottomSheet({ initialState: 'minimized' });
  const { colors } = useContext(ColorContext);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { shopItems: originalShopItems, loading } = useShop();
  const { carrots, inventoryItems, purchaseItem } = useUserStore();

  const equippedItems = inventoryItems.filter((item): item is InventoryItem & { image: any } => 'is_equipped' in item && item.is_equipped === true);
  const isShopItem = (item: Item): item is (ShopItem & { image: any; is_owned?: boolean }) => 'price' in item;
  const shopItems = originalShopItems.map(item => ({ ...item, is_owned: inventoryItems.some(invItem => invItem.item_id === item.item_id) }));

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const openPurchaseModal = (item: Item) => { if (item.is_owned) return; setSelectedItem(item); setIsModalVisible(true); };
  const confirmPurchase = async () => {
    if (!selectedItem) return;
    setIsModalVisible(false);
    const result = await purchaseItem(selectedItem);
    if (result !== true) {
      if (result === "당근 잔액이 부족합니다.") setToastMessage('‘캐롯’이 부족해요. 할 일을 완료하고 더 모아볼까요?');
      else setToastMessage(result);
      setTimeout(() => setToastMessage(null), 3300);
      setSelectedItem(null);
    }
  };
  const cancelPurchase = () => { setIsModalVisible(false); setSelectedItem(null); };
  const handleModalHide = () => { if (!toastMessage) setSelectedItem(null); };

  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        <AppHeader
          title="마이페이지"
          titleStyle={{ fontFamily: 'Cafe24Ssurround', color: theme.text }}
          headerStyle={{ backgroundColor: 'transparent', marginBottom: 10 }}
        />

        <View style={styles.characterSection}>
          <CharacterView
            carrots={carrots}
            equippedItems={equippedItems}
            isSheetMinimized={isSheetMinimized}
            isHandleTouched={isHandleTouched}
            animatedRabbitStyle={animatedRabbitStyle}
          />
        </View>
        <View style={styles.bottomSheetContainer}>
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
                <ThemedText style={[styles.itemText, { color: theme.icon }]}>보유 중</ThemedText>
              ) : (
                isShopItem(item) && (
                  <ThemedText style={[styles.itemText, { color: theme.primary }]}>🥕 {item.price}</ThemedText>
                )
              )
            }
          />
        </View>

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

        <Toast message={toastMessage} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  characterSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    pointerEvents: 'box-none',
  },
  itemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C757D',
  },
});