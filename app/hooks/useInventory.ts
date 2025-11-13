// useInventory.ts
import { useUserStore } from '@/store/userStore';
import { useFocusEffect } from 'expo-router'; // useFocusEffect 사용
import { useCallback } from 'react';

export function useInventory() {
  const { inventoryItems, carrots, equipItem, fetchUserData } = useUserStore();
  
  const loading = false;

  // useFocusEffect로 화면에 진입할 때마다 최신 데이터 로드
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  return { inventoryItems, carrots, loading, fetchInventory: fetchUserData, equipItem };
}