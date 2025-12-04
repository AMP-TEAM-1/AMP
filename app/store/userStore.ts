import { API_URL, getAuthHeaders } from '@/api'; // API 설정
import { Item, imageMap } from '@/data/items'; // Item 타입 경로
import axios from 'axios';
import { create } from 'zustand';

interface UserState {
  carrots: number;
  inventoryItems: Item[];
  // 1. 상태를 초기화하는 함수 (로그인 시 또는 앱 시작 시 호출)
  fetchUserData: () => Promise<void>;
  // 2. 아이템 구매 함수: 성공 시 true, 실패 시 에러 메시지(string) 반환
  purchaseItem: (item: Item) => Promise<true | string>;
  // 3. 아이템 장착 함수 (useInventory -> 여기로 이동)
  equipItem: (item: Item) => Promise<boolean>;
  // 4. 아이템 해제 함수
  unequipItem: (item: Item) => Promise<boolean>;
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
  purchaseItem: async (item: Item): Promise<true | string> => {
    // [수정] API 호출 전, 프론트엔드에서 먼저 잔액을 확인합니다.
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
      // 백엔드 버그로 인해 성공해도 500 에러가 올 수 있으므로, 에러가 발생해도 일단 계속 진행합니다.
      // 대신 실제 백엔드 에러 메시지를 저장해 둡니다.
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.detail || "구매 중 오류가 발생했습니다.";
      }
    }

    // 구매 요청 후, 성공/실패 여부와 관계없이 최신 유저 데이터를 다시 불러옵니다.
    await get().fetchUserData();
    // 다시 불러온 인벤토리 상태를 확인합니다.
    const updatedInventory = get().inventoryItems;
    const isPurchased = updatedInventory.some(invItem => invItem.item_id === item.item_id);

    // 인벤토리에 아이템이 추가되었으면 성공(true), 아니면 저장해둔 에러 메시지를 반환합니다.
    return isPurchased ? true : errorMessage;
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

  // 4. 아이템 해제 로직
  unequipItem: async (item: Item) => {
    try {
      const headers = await getAuthHeaders();
      await axios.put(
        `${API_URL}/api/inventory/${item.item_id}/equip`, // 장착/해제에 동일한 엔드포인트 사용
        { item_id: item.item_id, is_equipped: false }, // body에 item_id와 해제 상태를 명시
        { headers }
      );
      // 해제 성공 시, 인벤토리 상태를 새로고침하여 is_equipped 상태 반영
      await get().fetchUserData();
      return true;
    } catch (error) {
      console.error("해제 실패", error);
      return false;
    }
  },
}));