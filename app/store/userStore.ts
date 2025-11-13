import { API_URL, getAuthHeaders } from '@/api'; // API 설정
import { Item } from '@/data/items'; // Item 타입 경로
import axios from 'axios';
import { create } from 'zustand';

interface UserState {
  carrots: number;
  inventoryItems: Item[];
  // 1. 상태를 초기화하는 함수 (로그인 시 또는 앱 시작 시 호출)
  fetchUserData: () => Promise<void>;
  // 2. 아이템 구매 함수 (useShop -> 여기로 이동)
  purchaseItem: (item: Item) => Promise<boolean>;
  // 3. 아이템 장착 함수 (useInventory -> 여기로 이동)
  equipItem: (item: Item) => Promise<boolean>;
}

export const useUserStore = create<UserState>((set, get) => ({
  carrots: 0,
  inventoryItems: [],

  // 1. 유저 데이터 (당근 + 인벤토리) 한 번에 불러오기
  fetchUserData: async () => {
    try {
      const headers = await getAuthHeaders();
      const userRes = await axios.get(`${API_URL}/users/me/`, { headers });
      const inventoryRes = await axios.get(`${API_URL}/api/inventory`, { headers });
      
      set({ 
        carrots: userRes.data.carrot_balance,
        inventoryItems: inventoryRes.data // (필요시 imageMap 매핑)
      });
    } catch (e) {
      console.error("유저 데이터 로딩 실패", e);
    }
  },

  // 2. 아이템 구매 로직 (기존 useShop에서 가져옴)
  purchaseItem: async (item: Item) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.post(
        `${API_URL}/shop/purchase/?item_id=${item.item_id}`, 
        {}, 
        { headers }
      );
      
      // 구매 성공 시, 전역 상태의 당근 개수를 업데이트
      set({ carrots: response.data.carrot_balance });
      // 구매했으니 인벤토리 목록을 새로고침
      await get().fetchUserData(); // (더 좋은 방법은 인벤토리에 아이템만 추가하는 것)
      return true;
    } catch (error) {
      console.error("구매 실패", error);
      return false;
    }
  },

  // 3. 아이템 장착 로직 (기존 useInventory에서 가져옴)
  equipItem: async (item: Item) => {
    try {
      const headers = await getAuthHeaders();
      await axios.put(
        `${API_URL}/api/inventory/${item.item_id}/equip`,
        { item_id: item.item_id, is_equipped: true },
        { headers }
      );
      
      // 장착 성공 시, 인벤토리 상태를 새로고침하여 is_equipped 상태 반영
      await get().fetchUserData();
      return true;
    } catch (error) {
       console.error("장착 실패", error);
       return false;
    }
  },
}));