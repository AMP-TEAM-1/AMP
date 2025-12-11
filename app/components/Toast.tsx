import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';

interface ToastProps {
  message: string | null;
  duration?: number;
}

export default function Toast({ message, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const toastAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (message) {
      setVisible(true);
      Animated.sequence([
        Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(duration),
        Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }
  }, [message, duration, toastAnim]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          opacity: toastAnim,
          transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        },
      ]}
    >
      <ThemedText style={styles.toastText}>{message}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000, 
  },
  toastText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});