import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface BackButtonProps {
  onPress: () => void;
  color?: string;
}

export const BackButton = ({ onPress, color = "#4B5563" }: BackButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center absolute top-12 left-6 z-10"
    >
      <Ionicons name="chevron-back" size={24} color={color} />
    </AnimatedTouchable>
  );
};
