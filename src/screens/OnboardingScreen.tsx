import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import ReAnimated, {
  FadeInDown,
  FadeOut,
  SlideInDown,
  BounceIn,
  FlipInYRight,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

type RootStackParamList = {
  Onboarding: undefined;
  Register: undefined;
  SignIn: undefined;
};

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Onboarding"
>;

const carouselData = [
  {
    icon: "chatbubbles-outline" as const,
    title: "Connect Instantly",
    description:
      "Chat with friends and family in real-time with a modern and intuitive interface.",
  },
  {
    icon: "people-outline" as const,
    title: "Group Conversations",
    description:
      "Create groups for family, friends, or work teams and stay connected with everyone.",
  },
  {
    icon: "images-outline" as const,
    title: "Share Moments",
    description:
      "Share photos, videos, and documents instantly with your contacts.",
  },
  {
    icon: "notifications-outline" as const,
    title: "Stay Updated",
    description:
      "Get instant notifications when someone messages you or mentions you in a group.",
  },
];

export const OnboardingScreen = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = new Animated.Value(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation<OnboardingScreenNavigationProp>();

  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  useEffect(() => {
    // Hide splash screen after 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash) {
      const interval = setInterval(() => {
        const nextIndex =
          currentIndex === carouselData.length - 1 ? 0 : currentIndex + 1;
        setCurrentIndex(nextIndex);
        scrollViewRef.current?.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [currentIndex, showSplash]);

  if (!fontsLoaded) {
    return null;
  }

  if (showSplash) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ReAnimated.View
          entering={BounceIn.duration(1000)}
          className="items-center"
        >
          <ReAnimated.Text
            entering={FlipInYRight.delay(500).duration(1000)}
            className="text-4xl font-[Poppins_700Bold] text-primaryDark"
          >
            PingMe
          </ReAnimated.Text>
          <ReAnimated.Text
            entering={FadeInDown.delay(1000).duration(500)}
            className="text-gray-600 font-[Poppins_400Regular] mt-2"
          >
            Connect with everyone
          </ReAnimated.Text>
        </ReAnimated.View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-between">
        {/* Carousel Section */}
        <View className="flex-1 justify-center">
          <Animated.ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            className="flex-1"
          >
            {carouselData.map((item, index) => (
              <View
                key={index}
                style={{ width }}
                className="items-center justify-center px-8"
              >
                <View className="items-center">
                  <View className="w-40 h-40 rounded-full mb-8 bg-primary items-center justify-center shadow-lg">
                    <Ionicons name={item.icon} size={56} color="#B5B5FF" />
                  </View>
                  <Text className="text-2xl text-gray-800 mb-4 font-[Poppins_700Bold] text-center">
                    {item.title}
                  </Text>
                  <Text className="text-center text-gray-600 font-[Poppins_400Regular] px-4 leading-6">
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.ScrollView>
        </View>

        {/* Bottom Section */}
        <View className="px-8 pb-8">
          {/* Dots Indicator */}
          <View className="flex-row justify-center space-x-2 mb-8">
            {carouselData.map((_, index) => (
              <View
                key={index}
                className={`h-2 w-2 rounded-full ${
                  currentIndex === index ? "bg-primaryDark" : "bg-gray-200"
                }`}
              />
            ))}
          </View>

          {/* Buttons */}
          <View className="space-y-4">
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              className="w-full bg-primaryDark py-4 rounded-xl items-center shadow-sm"
            >
              <Text className="text-white font-[Poppins_500Medium] text-lg">
                Register
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("SignIn")}
              className="w-full bg-white py-4 rounded-xl items-center border border-primaryDark shadow-sm"
            >
              <Text className="text-primaryDark font-[Poppins_500Medium] text-lg">
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
