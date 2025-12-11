import { API_URL, getAuthHeaders } from '@/api'; 
import { Item, imageMap } from '@/data/items';
import axios from 'axios';
import { create } from 'zustand';

interface UserState {
  carrots: number;
  inventoryItems: Item[];
  fetchUserData: () => Promise<void>;
  purchaseItem: (item: Item) => Promise<true | string>;
  equipItem: (item: Item) => Promise<boolean>;
  unequipItem: (item: Item) => Promise<boolean>;
}

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

  // 유저 데이터 불러오기
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

  // 아이템 구매 로직 
  purchaseItem: async (item: Item): Promise<true | string> => {
    const currentCarrots = get().carrots;
    if ('price' in item && currentCarrots < item.price) {
      return "당근 잔액이 부족합니다.";
    }

    let errorMessage = "알 수 없는 오류로 구매에 실패했습니다.";
    try {
      const headers = await getAuthHeaders();
      await axios.post(
        `${API_URL}/shop/purchase/?item_id=${item.item_id}`, 
        {}, 
        { headers }
      );
    } catch (error) {
      console.error("구매 실패", error);
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.detail || "구매 중 오류가 발생했습니다.";
      }
    }
    // 구매 후 유저 데이터 새로고침
    await get().fetchUserData();
    const updatedInventory = get().inventoryItems;
    const isPurchased = updatedInventory.some(invItem => invItem.item_id === item.item_id);

    return isPurchased ? true : errorMessage;
  },

  // 아이템 장착 로직 
  equipItem: async (item: Item) => {
    try {
      const headers = await getAuthHeaders();
      await axios.put(
        `${API_URL}/api/inventory/${item.item_id}/equip`,
        { item_id: item.item_id, is_equipped: true },
        { headers }
      );
      
      await get().fetchUserData();
      return true;
    } catch (error) {
       console.error("장착 실패", error);
       return false;
    }
  },

  // 아이템 해제 로직
  unequipItem: async (item: Item) => {
    try {
      const headers = await getAuthHeaders();
      await axios.put(
        `${API_URL}/api/inventory/${item.item_id}/equip`, 
        { item_id: item.item_id, is_equipped: false }, 
        { headers }
      );
      await get().fetchUserData();
      return true;
    } catch (error) {
      console.error("해제 실패", error);
      return false;
    }
  },
}));