import { CATEGORY_MAP, Item, ItemCategory } from '@/data/items';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import CategoryTabs from './CategoryTabs';
import ItemGrid from './ItemGrid';

interface ShopBottomSheetProps {
  // 애니메이션과 제스처 관련 props
  panGesture: ReturnType<typeof Gesture.Pan>;
  animatedStyle: Record<string, unknown>;

  // 데이터 및 상태 관련 props
  loading: boolean;
  shopItems: Item[];
  selectedCategory: ItemCategory | null;
  selectedItemId: number | null;

  // 이벤트 핸들러 props
  onTabPress: (category: ItemCategory) => void;
  onItemPress: (item: Item) => void;
  renderItemFooter: (item: Item) => React.ReactNode;
}


/*
 * 마이페이지 하단에 표시되는 아이템 상점 Bottom Sheet 컴포넌트입니다.
 * 사용자는 이 시트를 위아래로 드래그하거나, 카테고리 탭을 눌러 아이템을 탐색하고 구매할 수 있습니다.
 * @param panGesture - 시트를 드래그하기 위한 제스처 핸들러
 * @param animatedStyle - 시트의 애니메이션(위치 이동)을 위한 스타일
 * @param loading - 아이템 목록 로딩 상태
 * @param shopItems - 상점에 표시될 전체 아이템 목록
 * @param selectedCategory - 현재 선택된 아이템 카테고리
 * @param selectedItemId - 현재 구매를 위해 선택된 아이템 ID
 * @param onTabPress - 카테고리 탭을 눌렀을 때 호출되는 함수
 * @param onItemPress - 아이템을 눌렀을 때 호출되는 함수
 * @param renderItemFooter - 각 아이템 카드 하단에 표시될 추가 UI(예: 가격, 보유 중)
 */
export default function ShopBottomSheet({
  panGesture,
  animatedStyle,
  loading,
  shopItems,
  selectedCategory,
  selectedItemId,
  onTabPress,
  onItemPress,
  renderItemFooter,
}: ShopBottomSheetProps) {
  return (
    <Animated.View style={[styles.bottomSheet, animatedStyle]}>
      {/* 상단 핸들 제스처 영역 */}
      <GestureDetector gesture={panGesture}>
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
      </GestureDetector>

      {/* 카테고리 탭 */}
      <CategoryTabs selectedCategory={selectedCategory} onTabPress={onTabPress} />

      {/* 아이템 목록 */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <ItemGrid
          items={
            selectedCategory
              ? shopItems.filter(
                  (item) => item.type.toLowerCase() === CATEGORY_MAP[selectedCategory]
                )
              : []
          }
          onItemPress={onItemPress}
          selectedItemId={selectedItemId}
          renderItemFooter={renderItemFooter}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'transparent', // 배경을 투명하게 변경
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    borderTopWidth: 1, // 상단 경계선 추가
    borderTopColor: 'rgba(255, 255, 255, 0.3)', // 반투명 경계선 색상
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    // @ts-ignore: 'grab' is a valid cursor value for web
    cursor: 'grab',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
  },
  itemText: {
    fontSize: 12,
    fontFamily: 'Jua',
  },
});