import { Redirect } from 'expo-router';

export default function Index() {
  // 앱이 시작될 때 초기 화면을 건너뛰고 바로 로그인 화면으로 이동시킵니다.
  return <Redirect href="/page/start" />; 
}