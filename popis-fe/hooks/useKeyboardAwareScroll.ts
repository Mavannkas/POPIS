import { useEffect, useRef } from 'react';
import { Keyboard, ScrollView } from 'react-native';

export const useKeyboardAwareScroll = () => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 25);
    });

    return () => {
      keyboardDidShowListener?.remove();
    };
  }, []);

  return scrollViewRef;
};