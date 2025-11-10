import { Redirect } from 'expo-router';

export default function Index() {
  // 앱이 시작될 때 항상 로그인 화면으로 이동시킵니다.
  // 로그인 성공 후의 화면 이동은 login.tsx 파일에서 처리합니다.
  return <Redirect href="/page/login" />;
}