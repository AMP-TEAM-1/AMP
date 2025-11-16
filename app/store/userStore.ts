import { API_URL, getAuthHeaders } from '@/api'; // API 설정
import { Item, imageMap } from '@/data/items'; // Item 타입 경로
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

// 헬퍼 함수: 이미지 URL을 imageMap 키로 변환
const getImageKey = (imageUrl: string): string => {
  const filename = imageUrl.split('/').pop()?.replace('.png', '') || '';
  const keyMap: { [key: string]: string } = {
    'strawHat': 'h1', 'cowboyHat': 'h2', 'santa-hat': 'h3', 'birthdayHat': 'h4', 'chefsHat': 'h5', 'crown': 'h6',
    'heart-accessory': 'a1', 'bowtie': 'a2', 'necktie': 'a3', 'scarf': 'a4', 'dot-ribbon': 'a5', 'ribbon': 'a6',
    'tulip-bg': 'b1', 'cactus-bg': 'b2', 'snowman-bg': 'b3', 'birthday-bg': 'b4', 'cake-bg': 'b5', 'stairs-bg': 'b6'
  };
  return keyMap[filename] || imageUrl;
};


export const useUserStore = create<UserState>((set, get) => ({
  carrots: 0,
  inventoryItems: [],

  // 1. 유저 데이터 (당근 + 인벤토리) 한 번에 불러오기
  fetchUserData: async () => {
    try {
      const headers = await getAuthHeaders();
      const userRes = await axios.get(`${API_URL}/users/me/`, { headers });
      const inventoryRes = await axios.get(`${API_URL}/api/inventory`, { headers });
      
      const transformedInventory = inventoryRes.data.map((invItem: any) => {
        const imageKey = getImageKey(invItem.item.image_url);
        return {
          ...invItem.item,
          item_id: invItem.item.item_id || invItem.item.id, 
          type: invItem.item.type || invItem.item.item_type,
          is_equipped: invItem.is_equipped,
          is_owned: true,
          image: imageMap[imageKey] || imageMap['h1'],
        };
      });

      set({ 
        carrots: userRes.data.carrot_balance,
        inventoryItems: transformedInventory 
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
      
      // 구매 성공 시, 유저 데이터를 다시 불러와 상태를 동기화
      await get().fetchUserData();
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