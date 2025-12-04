import React from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';

/**
 * 아이템 목록을 표시하는 재사용 가능한 UI 컴포넌트입니다.
 * 상점, 인벤토리 등 다양한 화면에서 아이템 목록을 보여주는 데 사용됩니다.
 * 카테고리별 필터링, 로딩 상태 표시, 아이템 그리드 렌더링 기능을 포함합니다.
 */

import { CATEGORY_MAP, Item, ItemCategory } from '@/data/items';
import CategoryTabs from './CategoryTabs';
import ItemGrid from './ItemGrid';
import { ThemedView } from './themed-view';

interface ItemListViewProps {
  title: string;
  items: Item[];
  loading: boolean;
  selectedCategory: ItemCategory | null;
  selectedItemId: number | null;
  onTabPress: (category: ItemCategory) => void;
  onItemPress: (item: Item) => void;
  mode?: 'shop' | 'inventory';
  renderItemFooter: (item: Item) => React.ReactNode;
  containerStyle?: ViewStyle; // 컨테이너에 적용할 추가 스타일
}

export default function ItemListView({
  mode = 'shop',
  title,
  items,
  loading,
  selectedCategory,
  selectedItemId,
  onTabPress,
  onItemPress,
  renderItemFooter,
  containerStyle,
}: ItemListViewProps) {
  const filteredItems = selectedCategory
    ? items.filter((item) => item.type === CATEGORY_MAP[selectedCategory])
    : [];

  return (
    <View style={[styles.container, containerStyle]}>
      <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <CategoryTabs selectedCategory={selectedCategory} onTabPress={onTabPress} />

        {loading ? (
          <ActivityIndicator style={{ flex: 1 }} size="large" />
        ) : (
          <ItemGrid
            mode={mode}
            items={filteredItems}
            onItemPress={onItemPress}
            selectedItemId={selectedItemId}
            renderItemFooter={renderItemFooter}
          />
        )}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
