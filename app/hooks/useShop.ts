import { API_URL, getAuthHeaders } from '@/api';
import { Item } from '@/data/items';
import { useUserStore } from '@/store/userStore';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

export function useShop() {
  // 1. 상점 아이템 목록은 이 훅의 로컬 상태로 관리
  const [shopItems, setShopItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. 당근, 구매 함수는 전역 스토어에서 가져옴
  const { carrots, purchaseItem } = useUserStore();

  const fetchShopItems = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const shopRes = await axios.get(`${API_URL}/shop/items`, { headers });
      // (is_owned 속성 처리를 위해 인벤토리와 비교하는 로직이 필요할 수 있음)
      setShopItems(shopRes.data); 
    } catch (error) {
      console.error('상점 정보 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShopItems();
  }, [fetchShopItems]);

  // 3. 반환 값 변경
  return { shopItems, carrots, loading, purchaseItem, fetchShopData: fetchShopItems };
}