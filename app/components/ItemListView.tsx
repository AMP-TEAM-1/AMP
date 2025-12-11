import React from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';
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
  containerStyle?: ViewStyle; 
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
