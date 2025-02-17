import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BackButton } from "../components/BackButton";

const SocialLink = ({
  icon,
  platform,
  username,
  url,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  platform: string;
  username: string;
  url: string;
}) => (
  <TouchableOpacity
    onPress={() => Linking.openURL(url)}
    className="flex-row items-center bg-white rounded-xl p-4 mb-4"
  >
    <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-4">
      <Ionicons name={icon} size={24} color="black" />
    </View>
    <View className="flex-1">
      <Text className="text-gray-800 font-[Poppins_500Medium]">{platform}</Text>
      <Text className="text-gray-600 font-[Poppins_400Regular]">
        {username}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
  </TouchableOpacity>
);

export const AboutScreen = () => {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-background">
      <BackButton onPress={() => navigation.goBack()} />

      <ScrollView className="flex-1 pt-20">
        <Animated.View entering={FadeInDown.springify()} className="px-6 mb-8">
          <Text className="text-2xl text-gray-800 font-[Poppins_700Bold] mb-2">
            About
          </Text>
          <Text className="text-gray-600 font-[Poppins_400Regular] leading-6">
            Hi, I'm Nischit, a passionate developer with a love for creating
            beautiful and functional applications. I specialize in mobile app
            development using React Native and modern web technologies.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="px-6 mb-8"
        >
          <Text className="text-2xl text-gray-800 font-[Poppins_500Medium] mb-4">
            Connect with me
          </Text>

          <SocialLink
            icon="logo-github"
            platform="GitHub"
            username="Nischit17"
            url="https://github.com/Nischit17"
          />

          <SocialLink
            icon="logo-linkedin"
            platform="LinkedIn"
            username="Nischit DS"
            url="https://www.linkedin.com/in/nischitds/"
          />

          <SocialLink
            icon="globe-outline"
            platform="Portfolio"
            username="Nischit Portfolio"
            url="https://nischit-portfolio.netlify.app/"
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="px-6 mb-8"
        >
          <Text className="text-2xl text-gray-800 font-[Poppins_500Medium] mb-4">
            About PingMe
          </Text>

          <View className="bg-white rounded-xl p-4">
            <Text className="text-gray-600 font-[Poppins_400Regular] leading-6">
              PingMe is a modern chat application built with React Native and
              Firebase. It features real-time messaging, user authentication,
              profile management, and a beautiful UI designed with attention to
              detail.
            </Text>
            <View className="mt-4 pt-4 border-t border-gray-100">
              <Text className="text-gray-800 font-[Poppins_500Medium]">
                Technologies Used
              </Text>
              <View className="flex-row flex-wrap mt-2">
                {["React Native", "Firebase", "TypeScript", "NativeWind"].map(
                  (tech, index) => (
                    <View
                      key={index}
                      className="bg-primary px-3 py-1 rounded-full mr-2 mb-2"
                    >
                      <Text className="text-black font-[Poppins_400Regular]">
                        {tech}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          className="px-6 mb-8"
        >
          <View className="items-center">
            <Text className="text-gray-500 font-[Poppins_400Regular]">
              Version 1.0.0
            </Text>
            <Text className="text-gray-400 font-[Poppins_400Regular] mt-1">
              Made with ❤️‍🔥 by NISCHIT D S
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};
