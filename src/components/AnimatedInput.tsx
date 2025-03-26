import React, { useState } from "react";
import { TextInput, View, Text, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { shakeAnimation } from "../utils/animations";
import { FadeInDown } from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);

export interface AnimatedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
  numberOfLines?: number;
  textAlignVertical?: "auto" | "top" | "bottom" | "center";
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "number-pad";
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  autoCapitalize,
  multiline,
  numberOfLines,
  textAlignVertical,
  keyboardType,
}) => {
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
    <View className="mb-4">
      <Animated.Text
        entering={FadeInDown.delay(200).springify()}
        className="text-gray-600 font-[Poppins_500Medium] mb-2"
      >
        {label}
      </Animated.Text>
      <Animated.View
        entering={FadeInDown.delay(300).springify()}
        className={`bg-white rounded-xl px-4 py-3 ${
          error ? "border border-red-500" : ""
        }`}
      >
        <TextInput
          className="text-gray-800 font-[Poppins_400Regular]"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry && !showPassword}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={textAlignVertical}
          keyboardType={keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
      </Animated.View>
      {error && (
        <Animated.Text
          entering={FadeInDown.delay(400).springify()}
          className="text-red-500 text-sm font-[Poppins_400Regular] mt-1"
        >
          {error}
        </Animated.Text>
      )}
    </View>
  );
};
