import { ThemedText } from '@/components/themed-text';
import { CATEGORIES, ItemCategory } from '@/data/items';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

/**
 * '모자', '장신구', '배경' 등 아이템 카테고리를 선택할 수 있는 탭 UI 컴포넌트입니다.
 * 선택된 탭에 따라 다른 아이템 목록을 필터링하는 데 사용됩니다.
 */

interface CategoryTabsProps {
  selectedCategory: ItemCategory | null;
  onTabPress: (category: ItemCategory) => void;
}

export default function CategoryTabs({ selectedCategory, onTabPress }: CategoryTabsProps) {
  return (
    <View style={styles.tabContainer}>
      {CATEGORIES.map((category) => (
        <Pressable
          key={category}
          style={[styles.tab, selectedCategory === category && styles.activeTab]}
          onPress={() => onTabPress(category)}
        >
          <ThemedText style={[styles.tabText, selectedCategory === category && styles.activeTabText]}>
            {category}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#E8730D8A',
  },
  tabText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Jua', // Jua 폰트 적용
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});