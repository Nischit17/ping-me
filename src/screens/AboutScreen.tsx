import React from "react";
import { View, Text, ScrollView, Image, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { BackButton } from "../components/BackButton";

const InfoSection = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => (
  <View className="mb-6">
    <Text className="text-lg text-gray-800 font-[Poppins_600SemiBold] mb-2">
      {title}
    </Text>
    <Text className="text-gray-600 font-[Poppins_400Regular] leading-6">
      {content}
    </Text>
  </View>
);

export const AboutScreen = () => {
  const navigation = useNavigation();
  const appVersion = "1.0.0"; // Replace with actual version number

  return (
    <View className="flex-1 bg-background">
      <BackButton onPress={() => navigation.goBack()} />
      <ScrollView className="flex-1 px-6 pt-20">
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-4">
            <Ionicons name="chatbubbles" size={40} color="#B5B5FF" />
          </View>
          <Text className="text-2xl text-gray-800 font-[Poppins_700Bold]">
            PingMe
          </Text>
          <Text className="text-gray-500 font-[Poppins_400Regular]">
            Version {appVersion}
          </Text>
        </View>

        <InfoSection
          title="About PingMe"
          content="PingMe is a modern messaging app designed to keep you connected with friends and family. With features like real-time messaging, read receipts, message editing, and secure communications, PingMe makes staying in touch easy and safe."
        />

        <InfoSection
          title="Features"
          content="• Real-time messaging with online status\n• Message editing and deletion\n• Read receipts with status indicators\n• Online/offline status tracking\n• Enhanced profile customization\n• Push notifications\n• Secure end-to-end encryption\n• User-friendly interface\n• Bio and phone number fields"
        />

        <InfoSection
          title="Security"
          content="Your privacy and security are our top priorities. All messages are encrypted and securely transmitted. We never store deleted messages on our servers, and edited messages maintain transparency with edit indicators."
        />

        <InfoSection
          title="Technology"
          content="PingMe is built with React Native and Firebase, leveraging modern technologies to provide a seamless messaging experience. We continuously update our app with new features and security improvements."
        />

        <InfoSection
          title="Open Source"
          content="PingMe is built with React Native and Firebase, leveraging modern technologies to provide a seamless messaging experience."
        />

        <View className="mt-4 mb-8">
          <Text className="text-center text-gray-500 font-[Poppins_400Regular]">
            Made with ❤️ by the PingMe Team
          </Text>
          <Text
            className="text-center text-primary font-[Poppins_400Regular] mt-2"
            onPress={() => Linking.openURL("https://pingme.com")}
          >
            www.pingme.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};
