import { Item } from '@/data/items';
import { useUserStore } from '@/store/userStore';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

export function useInventory() {
  const { inventoryItems, carrots, equipItem, fetchUserData } = useUserStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loading = false;

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  const handleEquip = async (item: Item) => {
    return await equipItem(item);
  };

  return {
    inventoryItems,
    carrots,
    loading,
    fetchInventory: fetchUserData,
    equipItem,
    selectedCategory,
    setSelectedCategory,
    handleEquip
  };
}