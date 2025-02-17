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

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => (
  <View className="bg-white rounded-xl p-4 mb-4">
    <Text className="text-gray-800 font-[Poppins_500Medium] text-base mb-2">
      {question}
    </Text>
    <Text className="text-gray-600 font-[Poppins_400Regular]">{answer}</Text>
  </View>
);

const ContactOption = ({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center bg-white rounded-xl p-4 mb-4"
  >
    <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-4">
      <Ionicons name={icon} size={24} color="#B5B5FF" />
    </View>
    <View className="flex-1">
      <Text className="text-gray-800 font-[Poppins_500Medium]">{title}</Text>
      <Text className="text-gray-600 font-[Poppins_400Regular]">
        {subtitle}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
  </TouchableOpacity>
);

export const HelpSupportScreen = () => {
  const navigation = useNavigation();

  const faqs = [
    {
      question: "How do I start a new chat?",
      answer:
        "Tap the plus button in the bottom right corner of the home screen to start a new conversation.",
    },
    {
      question: "Can I delete messages?",
      answer:
        "Yes, you can delete individual messages by long-pressing on them and selecting 'Delete'.",
    },
    {
      question: "How do I change my profile picture?",
      answer:
        "Go to Profile > Edit Profile and tap on your profile picture to upload a new one.",
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <BackButton onPress={() => navigation.goBack()} />

      <ScrollView className="flex-1 pt-20">
        <Animated.View entering={FadeInDown.springify()} className="px-6 mb-6">
          <Text className="text-2xl text-gray-800 font-[Poppins_700Bold] mb-2">
            Help & Support
          </Text>
          <Text className="text-gray-600 font-[Poppins_400Regular]">
            How can we help you today?
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="px-6 mb-8"
        >
          <Text className="text-gray-800 font-[Poppins_500Medium] mb-4">
            Contact Us
          </Text>

          <ContactOption
            icon="mail-outline"
            title="Email Support"
            subtitle="support@pingme.com"
            onPress={() => Linking.openURL("mailto:support@pingme.com")}
          />

          <ContactOption
            icon="logo-twitter"
            title="Twitter Support"
            subtitle="@pingme_support"
            onPress={() =>
              Linking.openURL("https://twitter.com/pingme_support")
            }
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="px-6"
        >
          <Text className="text-gray-800 font-[Poppins_500Medium] mb-4">
            Frequently Asked Questions
          </Text>

          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
};
