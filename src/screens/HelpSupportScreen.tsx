import React, { useState } from "react";
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

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ = ({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <View className="mb-4 bg-white rounded-xl overflow-hidden">
    <TouchableOpacity
      onPress={onToggle}
      className="flex-row items-center justify-between p-4"
    >
      <Text className="flex-1 text-gray-800 font-[Poppins_500Medium]">
        {item.question}
      </Text>
      <Ionicons
        name={isOpen ? "chevron-up" : "chevron-down"}
        size={20}
        color="#9CA3AF"
      />
    </TouchableOpacity>
    {isOpen && (
      <View className="p-4 pt-0">
        <Text className="text-gray-600 font-[Poppins_400Regular]">
          {item.answer}
        </Text>
      </View>
    )}
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
  const [openFAQs, setOpenFAQs] = useState<number[]>([]);

  const faqs: FAQItem[] = [
    {
      question: "How do I start a new chat?",
      answer:
        "Tap the '+' button on the Chats screen to see a list of available users. Select a user to start a new conversation.",
    },
    {
      question: "How do I edit or delete messages?",
      answer:
        "Long-press on any message you've sent to see options for editing or deleting it. Edited messages will show an '(edited)' indicator. Deleted messages will be replaced with 'This message was deleted'.",
    },
    {
      question: "How do I know if someone has read my message?",
      answer:
        "Message status is shown with checkmarks: one checkmark means sent, double gray checkmarks mean delivered, and double green checkmarks mean read.",
    },
    {
      question: "How can I tell if someone is online?",
      answer:
        "Users' online status is shown in their profile and in the chat. A green dot indicates they're online, and you can see their last active time when they're offline.",
    },
    {
      question: "How do I edit my profile?",
      answer:
        "Go to your profile settings to update your display name, bio, phone number, profile picture, and other information.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we use encryption to protect your messages and personal information. Your messages are only accessible to you and the intended recipient. Deleted messages are permanently removed from our servers.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

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
            <FAQ
              key={index}
              item={faq}
              isOpen={openFAQs.includes(index)}
              onToggle={() => toggleFAQ(index)}
            />
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
};
