import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useContext } from 'react';
import { Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { ColorContext } from './ColorContext';


export default function InitScreen() {
  const { colors } = useContext(ColorContext);
  const { width, height } = useWindowDimensions();

  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <ThemedView
        style={[
          styles.container,
          { backgroundColor: 'transparent', padding: width * 0.06, gap: height * 0.02 },
        ]}
      >
        {/* 텍스트 영역 */}
        <ThemedText
          style={[
            styles.slogan,
            { fontSize: width * 0.055, marginBottom: height * 0.012 },
          ]}
        >
          당신만의 스마트 비서 투두리스트
        </ThemedText>

        <ThemedText
          style={[
            styles.slogan2,
            { fontSize: width * 0.1, lineHeight: width * 0.1, marginBottom: height * 0.05 },
          ]}
        >
          캐롯
        </ThemedText>

        {/* 이미지 */}
        <Image
          source={require('../../assets/images/item/rabbit.png')}
          style={{
            width: width * 0.6,
            height: height * 0.3,
            marginBottom: height * 0.05,
          }}
          resizeMode="contain"
        />

        {/* 버튼 컨테이너 */}
        <View
          style={[
            styles.whiteBox,
            {
              width: width * 0.9,
              paddingVertical: height * 0.03,
              borderRadius: width * 0.05,
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: pressed ? '#D3D3D3' : '#FFB347',
                width: width * 0.8,
                height: height * 0.06,
              },
            ]}
            onPress={() => router.push('/page/login')}
          >
            <ThemedText
              style={{ color: '#000', fontSize: width * 0.04 }}
            >
              로그인
            </ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: pressed ? '#D3D3D3' : '#FFE0A3',
                width: width * 0.8,
                height: height * 0.06,
                marginTop: height * 0.015,
              },
            ]}
            onPress={() => router.push('/page/signup')}
          >
            <ThemedText
              style={{
                color: '#000',
                fontSize: width * 0.04,
                textAlign: 'center',
              }}
            >
              회원가입
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slogan: {
    color: '#3A3A3A',
    textAlign: 'center',
  },
  slogan2: {
    color: '#FF8C42',
    textAlign: 'center',
  },
  whiteBox: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    opacity: 0.8
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
});