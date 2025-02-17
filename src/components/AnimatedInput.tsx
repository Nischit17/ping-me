import React, { useState } from "react";
import { TextInput, View, Text, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { shakeAnimation } from "../utils/animations";

const AnimatedView = Animated.createAnimatedComponent(View);

interface AnimatedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  error?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export const AnimatedInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  error,
  autoCapitalize = "none",
}: AnimatedInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: withSpring(
      isFocused ? "#B5B5FF" : error ? "#EF4444" : "#E5E7EB"
    ),
  }));

  const handleFocus = () => {
    setIsFocused(true);
    scale.value = withSpring(1.02);
  };

  const handleBlur = () => {
    setIsFocused(false);
    scale.value = withSpring(1);
  };

  const triggerShake = () => {
    translateX.value = shakeAnimation();
  };

  React.useEffect(() => {
    if (error) {
      triggerShake();
    }
  }, [error]);

  return (
    <AnimatedView style={containerStyle}>
      <Text className="text-gray-700 mb-2 font-[Poppins_400Regular]">
        {label}
      </Text>
      <AnimatedView
        style={borderStyle}
        className="relative bg-gray-50 rounded-xl border"
      >
        <TextInput
          className="p-4 font-[Poppins_400Regular]"
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-4"
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#9CA3AF"
            />
          </Pressable>
        )}
      </AnimatedView>
      {error && (
        <Text className="text-red-500 mt-1 font-[Poppins_400Regular] text-sm">
          {error}
        </Text>
      )}
    </AnimatedView>
  );
};
