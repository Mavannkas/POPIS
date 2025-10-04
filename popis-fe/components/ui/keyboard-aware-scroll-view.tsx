import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, ScrollViewProps } from 'react-native';
import { useKeyboardAwareScroll } from '@/hooks/useKeyboardAwareScroll';

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  keyboardVerticalOffset?: number;
}

export const KeyboardAwareScrollView: React.FC<KeyboardAwareScrollViewProps> = ({
  children,
  keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0,
  ...scrollViewProps
}) => {
  const scrollViewRef = useKeyboardAwareScroll();

  return (
    <KeyboardAvoidingView 
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView 
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};