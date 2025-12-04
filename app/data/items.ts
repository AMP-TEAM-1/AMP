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
  '장신구': 'accessory',
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

// --- 아이템별 스타일 정의 ---
// 각 아이템의 고유 ID를 키로 사용하여 위치, 크기 등을 개별적으로 조정합니다.
export const itemStyleMap: { [key: number]: any } = {
  // 모자 (type: 'hat')
  1: { width: '40%', height: '40%', top: '5%' }, // 밀짚모자
  2: { width: '45%', height: '45%', top: '2%' }, // 카우보이모자
  3: { width: '35%', height: '35%', top: '2%' }, // 요리사모자
  4: { width: '50%', height: '50%', top: '-7%' }, // 산타모자
  5: { width: '31%', height: '31%', top: '0%' }, // 생일모자
  6: { width: '35%', height: '35%', top: '3%' }, // 왕관

  // 장신구 (type: 'accessory')
  7: { width: '17%', height: '17%', top: '63%', left: '27%' }, // 하트
  8: { width: '17%', height: '17%', top: '57%' }, // 나비넥타이
  9: { width: '25%', height: '25%', top: '59%' }, // 넥타이
  10: { width: '35%', height: '35%', top: '50%', }, // 도트리본
  11: { width: '40%', height: '40%', top: '50%' }, // 스카프
  12: { width: '20%', height: '20%', top: '56%', }, // 리본

  // 배경 (type: 'background')
  13: { zIndex: -1, opacity: 0.8, top: '-2%' }, // 튤립 배경
  14: { zIndex: -1, opacity: 0.8, top: '-20%', width: '140%', height: '140%' }, // 선인장 배경
  15: { zIndex: -1, opacity: 0.8, top: '-13%', left: '-32%' }, // 눈사람 배경
  16: { zIndex: -1, opacity: 0.8, top: '-10%' }, // 생일 배경
  17: { zIndex: -1, opacity: 0.8, top: '-10%' }, // 케이크 배경
  18: { zIndex: -1, opacity: 0.8, top: '-10%' }, // 계단 배경
};

// --- 아이템 타입별 기본 스타일 ---
export const baseItemStyle: { [key: string]: any } = {
  hat: { width: '40%', height: '40%', top: '5%' },
  accessory: { width: '25%', height: '25%', top: '52%' },
  background: { zIndex: -1, opacity: 0.8, top: '-10%' },
};