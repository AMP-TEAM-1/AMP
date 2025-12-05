import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Category } from '../../types';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: 'all' | number;
  onSelectCategory: (id: 'all' | number) => void;
}

export default function CategoryBar({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryBarProps) {
  // 'ALL' 카테고리를 포함한 리스트 생성
  const data = [{ id: -1, text: 'ALL', color: '#eee' } as Category, ...categories];

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isAll = item.id === -1;
          // 선택 여부 판별 (ALL인 경우와 일반 카테고리인 경우)
          const isSelected = isAll
            ? selectedCategory === 'all'
            : selectedCategory === item.id;

          return (
            <Pressable
              onPress={() => onSelectCategory(isAll ? 'all' : item.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? '#1f7aeb' : (item.color || '#f0f0f0'),
                  borderColor: isSelected ? '#1f7aeb' : 'transparent',
                }
              ]}
            >
              <Text
                style={[
                  styles.text,
                  { color: isSelected ? '#fff' : (isAll ? '#666' : '#333') }
                ]}
              >
                {item.text}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    justifyContent: 'center',
  },
  listContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Cafe24Ssurround',
  },
});