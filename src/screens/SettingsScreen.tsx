import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { BackButton } from "../components/BackButton";

type RootStackParamList = {
  Settings: undefined;
  Privacy: undefined;
  HelpSupport: undefined;
  About: undefined;
};

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Settings"
>;

const SettingItem = ({
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
    className="flex-row items-center p-4 bg-white mb-2 rounded-xl"
  >
    <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
      <Ionicons name={icon} size={20} color="#B5B5FF" />
    </View>
    <View className="flex-1 ml-4">
      <Text className="text-gray-800 font-[Poppins_600SemiBold] text-base">
        {title}
      </Text>
      <Text className="text-gray-500 font-[Poppins_400Regular] text-sm">
        {subtitle}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

export const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  return (
    <View className="flex-1 bg-background">
      <BackButton onPress={() => navigation.goBack()} />
      <ScrollView className="flex-1 px-6 pt-20">
        <Text className="text-2xl text-gray-800 font-[Poppins_700Bold] mb-6">
          Settings
        </Text>

        <SettingItem
          icon="shield-checkmark"
          title="Privacy"
          subtitle="Manage your privacy settings"
          onPress={() => navigation.navigate("Privacy")}
        />

        <SettingItem
          icon="help-circle"
          title="Help & Support"
          subtitle="Get help or contact support"
          onPress={() => navigation.navigate("HelpSupport")}
        />

        <SettingItem
          icon="information-circle"
          title="About"
          subtitle="Learn more about PingMe"
          onPress={() => navigation.navigate("About")}
        />
      </ScrollView>
    </View>
  );
};
