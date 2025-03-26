import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BackButton } from "../components/BackButton";

const PrivacySection = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => (
  <View className="bg-white rounded-xl p-4 mb-4">
    <Text className="text-gray-800 font-[Poppins_500Medium] text-base mb-2">
      {title}
    </Text>
    <Text className="text-gray-600 font-[Poppins_400Regular]">{content}</Text>
  </View>
);

export const PrivacyScreen = () => {
  const navigation = useNavigation();

  const privacyContent = [
    {
      title: "Data Collection",
      content:
        "We collect minimal personal information necessary for the functioning of the app, including your email, phone number, bio, and profile information. Your online status is also tracked to enhance the messaging experience.",
    },
    {
      title: "Message Privacy",
      content:
        "Your messages are encrypted and stored securely. We do not read or share your private conversations. When you delete a message, it is permanently removed from our servers. Edited messages maintain a history of changes for transparency.",
    },
    {
      title: "Profile Information",
      content:
        "Your profile information (including display name, bio, phone number, and online status) is visible to other users. You can control what information you share in your profile settings.",
    },
    {
      title: "Message Status",
      content:
        "Message status indicators (sent, delivered, and read) are visible to all participants in a conversation. Your online/offline status is visible to all users.",
    },
    {
      title: "Third-Party Services",
      content:
        "We use Firebase for authentication, data storage, and push notifications. Please refer to Firebase's privacy policy for more information about data handling.",
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <BackButton onPress={() => navigation.goBack()} />

      <ScrollView className="flex-1 pt-20">
        <Animated.View entering={FadeInDown.springify()} className="px-6 mb-6">
          <Text className="text-2xl text-gray-800 font-[Poppins_700Bold] mb-2">
            Privacy
          </Text>
          <Text className="text-gray-600 font-[Poppins_400Regular]">
            Your privacy is important to us
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="px-6"
        >
          {privacyContent.map((section, index) => (
            <PrivacySection
              key={index}
              title={section.title}
              content={section.content}
            />
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
};
