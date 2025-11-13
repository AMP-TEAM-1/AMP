import { ThemedText } from '@/components/themed-text';
import { Item } from '@/data/items';
import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';

/**
 * 아이템 목록을 3열 그리드 형태로 보여주는 재사용 가능한 컴포넌트입니다.
 * 상점, 인벤토리 등에서 아이템 목록을 표시하는 데 사용됩니다.
 */

interface ItemGridProps {
  items: Item[];
  onItemPress: (item: Item) => void;
  renderItemFooter: (item: Item) => React.ReactNode;
  selectedItemId?: number | null;
}

export default function ItemGrid({ items, onItemPress, renderItemFooter, selectedItemId }: ItemGridProps) {
  const renderItem = ({ item }: { item: Item }) => (
    <Pressable
      style={[
        styles.itemContainer,
        (selectedItemId === item.item_id || item.is_owned || item.is_equipped) && styles.itemSelected,
      ]}
      onPress={() => {
        // 이미 보유한 아이템은 선택 이벤트를 발생시키지 않습니다.
        if (!item.is_owned) onItemPress(item);
      }}
    >
      <View style={styles.itemImage}>
        {item.image ? (
          <Image source={item.image} style={styles.itemImageContent} resizeMode="contain" />
        ) : (
          <ThemedText style={{ fontSize: 40 }}>{'❓'}</ThemedText>
        )}
      </View>
      {renderItemFooter(item)}
    </Pressable>
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => String(item.item_id)}
      numColumns={3}
      contentContainerStyle={styles.itemList}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>아이템이 없습니다.</ThemedText>
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
  },
  itemImageContent: {
    width: '90%',
    height: '90%',
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontFamily: 'Jua', color: '#B3B3B3', fontSize: 16 },
});