import { ThemedText } from '@/components/themed-text';
import { Item } from '@/data/items';
import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';

// ✅ [수정 1] Item 타입 확장: is_equipped와 is_owned가 있을 수 있다고 정의합니다.
export type GridItem = Item & {
  is_equipped?: boolean;
  is_owned?: boolean;
};

interface ItemGridProps {
  // ✅ [수정 2] items의 타입을 Item[] 대신 확장된 GridItem[]으로 변경
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

  // ✅ [수정 3] renderItem의 인자 타입도 GridItem으로 변경
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
          // 🔹 이제 item.is_equipped에 접근해도 에러가 나지 않습니다.
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
          
          {/* 🔹 여기서도 에러가 사라집니다. */}
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
  // ... (스타일은 기존과 동일하게 유지)
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
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // 배경이 비치도록 반투명 흰색으로 변경
    borderRadius: 10,
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
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontFamily: 'Cafe24Ssurround', color: '#B3B3B3', fontSize: 16 },
  equippedItemBorder: {
    borderWidth: 2,
    borderColor: '#FF7F50', 
    backgroundColor: '#fff0e6',
  },
  equippedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4500',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  equippedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Cafe24Ssurround',
  },
});