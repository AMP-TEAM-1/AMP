// --- 타입 정의 ---
export type ItemCategory = '모자' | '장신구' | '배경';

// API 명세서에 맞는 타입 정의

// /api/v1/shop/items 응답 아이템
export type ShopItem = {
  item_id: number;
  name: string;
  price: number;
  type: string;
};

// /api/v1/inventory 응답 아이템
export type InventoryItem = {
  item_id: number;
  name: string;
  type: string;
  is_equipped: boolean;
};

// 프론트엔드에서 사용할 통합 아이템 타입 (이미지 경로 등 추가 정보 포함)
export type Item = (ShopItem | InventoryItem) & {
  image: any; // require()의 반환 타입
  is_owned?: boolean; // 아이템 보유 여부
};

// --- 상수 정의 ---
export const CATEGORIES: ItemCategory[] = ['모자', '장신구', '배경'];

export const CATEGORY_MAP: Record<ItemCategory, string> = {
  '모자': 'hat',
  '장신구': 'accessories',
  '배경': 'background',
};

// --- 이미지 리소스 ---
export const imageMap: { [key: string]: any } = {
  // 모자
  // 'h1': require('@/assets/images/item/strawHat.png'),
  // 'h2': require('@/assets/images/item/cowboyHat.png'),
  // 'h3': require('@/assets/images/item/chefsHat.png'),
  // 'h4': require('@/assets/images/item/santa-hat.png'),
  // 'h5': require('@/assets/images/item/birthdayHat.png'),
  // 'h6': require('@/assets/images/item/crown.png'),
  'h1': require('../../assets/images/item/strawHat.png'),
  'h2': require('../../assets/images/item/cowboyHat.png'),
  'h3': require('../../assets/images/item/chefsHat.png'),
  'h4': require('../../assets/images/item/santa-hat.png'),
  'h5': require('../../assets/images/item/birthdayHat.png'),
  'h6': require('../../assets/images/item/crown.png'),
  
  // 장신구
  // 'a1': require('@/assets/images/item/heart-accessory.png'),
  // 'a2': require('@/assets/images/item/bowtie.png'),
  // 'a3': require('@/assets/images/item/necktie.png'),
  // 'a4': require('@/assets/images/item/dot-ribbon.png'),
  // 'a5': require('@/assets/images/item/scarf.png'),
  // 'a6': require('@/assets/images/item/ribbon.png'),
  'a1': require('../../assets/images/item/heart-accessory.png'),
  'a2': require('../../assets/images/item/bowtie.png'),
  'a3': require('../../assets/images/item/necktie.png'),
  'a4': require('../../assets/images/item/dot-ribbon.png'),
  'a5': require('../../assets/images/item/scarf.png'),
  'a6': require('../../assets/images/item/ribbon.png'),
  
  // 배경
  // 'b1': require('@/assets/images/item/tulip-bg.png'),
  // 'b2': require('@/assets/images/item/cactus-bg.png'),
  // 'b3': require('@/assets/images/item/snowman-bg.png'),
  // 'b4': require('@/assets/images/item/birthday-bg.png'),
  // 'b5': require('@/assets/images/item/cake-bg.png'),
  // 'b6': require('@/assets/images/item/stairs-bg.png'),
  'b1': require('../../assets/images/item/tulip-bg.png'),
  'b2': require('../../assets/images/item/cactus-bg.png'),
  'b3': require('../../assets/images/item/snowman-bg.png'),
  'b4': require('../../assets/images/item/birthday-bg.png'),
  'b5': require('../../assets/images/item/cake-bg.png'),
  'b6': require('../../assets/images/item/stairs-bg.png'),
};

// --- UI 테스트용 임시 데이터 ---
export const mockShopItems: Item[] = [
  { item_id: 1, name: '밀짚모자', price: 50, type: 'hat', image: imageMap['h1'] },
  { item_id: 2, name: '카우보이 모자', price: 70, type: 'hat', image: imageMap['h2'] },
  { item_id: 6, name: '왕관', price: 200, type: 'hat', image: imageMap['h6'] },
  { item_id: 7, name: '하트 장식', price: 30, type: 'accessory', image: imageMap['a1'] },
  { item_id: 8, name: '나비 넥타이', price: 40, type: 'accessory', image: imageMap['a2'] },
  { item_id: 13, name: '튤립 배경', price: 100, type: 'background', image: imageMap['b1'] },
];

export const mockInventoryItems: Item[] = [
  { item_id: 1, name: '밀짚모자', type: 'hat', is_equipped: true, image: imageMap['h1'] },
  { item_id: 3, name: '요리사 모자', type: 'hat', is_equipped: false, image: imageMap['h3'] },
  { item_id: 8, name: '나비 넥타이', type: 'accessory', is_equipped: true, image: imageMap['a2'] },
  { item_id: 10, name: '땡땡이 리본', type: 'accessory', is_equipped: false, image: imageMap['a4'] },
  { item_id: 18, name: '계단 배경', type: 'background', is_equipped: false, image: imageMap['b6'] },
];