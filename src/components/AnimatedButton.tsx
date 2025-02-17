import React from "react";
import { Text, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { pressAnimation, pressOutAnimation } from "../utils/animations";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  loading?: boolean;
}

export const AnimatedButton = ({
  onPress,
  title,
  disabled = false,
  variant = "primary",
  loading = false,
}: AnimatedButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = pressAnimation();
  };

  const handlePressOut = () => {
    scale.value = pressOutAnimation();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={animatedStyle}
      className={`w-full py-4 rounded-xl items-center shadow-sm ${
        disabled || loading ? "opacity-70" : ""
      } ${
        variant === "primary"
          ? "bg-primaryDark"
          : "bg-white border border-primaryDark"
      }`}
    >
      <Text
        className={`font-[Poppins_500Medium] text-lg ${
          variant === "primary" ? "text-white" : "text-primaryDark"
        }`}
      >
        {loading ? "Please wait..." : title}
      </Text>
    </AnimatedPressable>
  );
};
