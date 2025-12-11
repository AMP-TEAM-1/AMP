import { ThemedText } from '@/components/themed-text';
import { CATEGORIES, ItemCategory } from '@/data/items';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DEE2E6',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#E9ECEF', 
  },
  activeTab: {
    backgroundColor: '#FF9F43', 
    shadowColor: '#FF9F43',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tabText: {
    fontSize: 15,
    color: '#495057',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});