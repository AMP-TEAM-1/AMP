import { ThemedText } from '@/components/themed-text';
import { Item } from '@/data/items';
import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';

export type GridItem = Item & {
  is_equipped?: boolean;
  is_owned?: boolean;
};

interface ItemGridProps {
  items: GridItem[];
  onItemPress: (item: GridItem) => void;
  renderItemFooter: (item: GridItem) => React.ReactNode;
  selectedItemId?: number | null;
  mode?: 'shop' | 'inventory';
}

export default function ItemGrid({
  items,
  onItemPress,
  renderItemFooter,
  selectedItemId,
  mode = 'shop'
}: ItemGridProps) {

  const renderItem = ({ item }: { item: GridItem }) => {
    const isSelected = selectedItemId === item.item_id;

    const shouldApplyOpacity = mode === 'shop'
      ? (isSelected || item.is_owned || item.is_equipped)
      : isSelected;

    return (
      <Pressable
        style={[
          styles.itemContainer,
          shouldApplyOpacity && styles.itemSelected,
          (mode === 'inventory' && item.is_equipped) && styles.equippedItemBorder
        ]}
        onPress={() => {
          if (mode === 'shop') {
            if (!item.is_owned) onItemPress(item);
          } else {
            onItemPress(item);
          }
        }}
      >
        <View style={styles.itemImage}>
          {item.image ? (
            <Image source={item.image} style={styles.itemImageContent} resizeMode="contain" />
          ) : (
            <ThemedText style={{ fontSize: 40 }}>{'❓'}</ThemedText>
          )}
          {mode === 'inventory' && item.is_equipped && (
            <View style={styles.equippedBadge}>
              <ThemedText style={styles.equippedText}>E</ThemedText>
            </View>
          )}
        </View>
        {renderItemFooter(item)}
      </Pressable>
    );
  };

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => String(item.item_id)}
      numColumns={3}
      contentContainerStyle={styles.itemList}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            {mode === 'shop' ? '판매 중인 아이템이 없습니다.' : '보유한 아이템이 없습니다.'}
          </ThemedText>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  itemList: {
    padding: 10,
    marginHorizontal: 5,
  },
  itemContainer: {
    width: '30.33%',
    alignItems: 'center',
    marginHorizontal: '1.5%',
    marginVertical: 8,
    padding: 10,
    backgroundColor: '#FFFFFF', 
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemSelected: {
    opacity: 0.5,
  },
  itemImage: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 5,
    position: 'relative',
  },
  itemImageContent: {
    width: '90%',
    height: '90%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  },
  emptyText: {
    fontFamily: 'Cafe24Ssurround',
    color: '#B3B3B3',
    fontSize: 16
  },
  equippedItemBorder: {
    borderWidth: 2.5,
    borderColor: '#FF9F43',
    backgroundColor: '#FFF9F5',
    shadowColor: '#FF9F43',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  equippedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF6B35',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  equippedText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
});