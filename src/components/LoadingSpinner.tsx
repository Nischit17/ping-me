import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export const LoadingSpinner = () => {
  return (
    <Animated.View
      entering={FadeIn}
      style={StyleSheet.absoluteFillObject}
      className="items-center justify-center bg-black/30 z-50"
    >
      <View className="bg-white p-6 rounded-2xl shadow-lg">
        <ActivityIndicator size="large" color="#B5B5FF" />
      </View>
    </Animated.View>
  );
};
