import { Platform } from 'react-native';

const tintColorLight = '#FF9F43'; // 메인 포인트 컬러 (오렌지)
const tintColorDark = '#fff';

// 🎨 프로덕션 레벨 색상 팔레트
export const Palette = {
  primary: '#FF9F43',   // 따뜻한 오렌지 (메인 컬러)
  secondary: '#FDCB6E', // 밝은 옐로우 (보조 컬러)
  background: '#F8F9FA', // 오프 화이트 배경 (깔끔한 느낌)
  card: '#FFFFFF',       // 카드 배경 (순수 흰색)
  text: '#212529',       // 진한 텍스트 (가독성 최우선)
  subText: '#6C757D',    // 중간 회색 텍스트
  accent: '#E17055',     // 강조 (코랄 레드)
  shadow: '#00000015',   // 그림자 (15% 투명도)
  border: '#DEE2E6',     // 경계선 색상
  overlay: '#00000080',  // 오버레이 배경 (50% 투명도)
};

export const Colors = {
  light: {
    text: Palette.text,
    background: Palette.background,
    tint: tintColorLight,
    icon: Palette.subText,
    tabIconDefault: Palette.subText,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// 🔤 타이포그래피 시스템
export const Typography = {
  // 폰트 패밀리
  fontFamily: {
    heading: 'Cafe24Ssurround',  // 제목용 (브랜드 정체성)
    body: Platform.select({      // 본문용 (가독성 우선)
      ios: 'System',
      android: 'Roboto',
      default: 'sans-serif',
    }),
    number: Platform.select({    // 숫자용 (명확성)
      ios: 'System',
      android: 'Roboto',
      default: 'sans-serif',
    }),
  },

  // 폰트 크기
  fontSize: {
    h1: 28,
    h2: 24,
    h3: 20,
    h4: 18,
    body: 16,
    caption: 14,
    small: 12,
  },
};

