import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Privacy: undefined;
  HelpSupport: undefined;
  About: undefined;
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

interface ProfileOptionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  color?: string;
}

const ProfileOption: React.FC<ProfileOptionProps> = ({
  icon,
  title,
  onPress,
  color = "#4B5563",
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center px-4 py-3 bg-white rounded-xl mb-3"
  >
    <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3">
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text className="text-gray-800 font-[Poppins_500Medium] flex-1">
      {title}
    </Text>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by the Navigation component in App.tsx
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "";

  return (
    <View className="flex-1 bg-background">
      <Animated.View
        entering={FadeInDown.springify()}
        className="pt-14 pb-4 bg-white px-6"
      >
        <Text className="text-2xl text-gray-800 font-[Poppins_700Bold]">
          Profile
        </Text>
      </Animated.View>

      <ScrollView className="flex-1 px-6 pt-6">
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="items-center mb-8"
        >
          <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-3">
            <Text className="text-primaryDark text-3xl font-[Poppins_500Medium]">
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-xl text-gray-800 font-[Poppins_600SemiBold]">
            {capitalizeFirstLetter(displayName)}
          </Text>
          <Text className="text-gray-500 font-[Poppins_400Regular]">
            {user?.email}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="mb-8"
        >
          <Text className="text-gray-500 font-[Poppins_500Medium] mb-3 px-4">
            Account
          </Text>
          <ProfileOption
            icon="person-outline"
            title="Edit Profile"
            onPress={() => navigation.navigate("EditProfile")}
          />
          <ProfileOption
            icon="shield-outline"
            title="Privacy"
            onPress={() => navigation.navigate("Privacy")}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text className="text-gray-500 font-[Poppins_500Medium] mb-3 px-4">
            More
          </Text>
          <ProfileOption
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() => navigation.navigate("HelpSupport")}
          />
          <ProfileOption
            icon="information-circle-outline"
            title="About"
            onPress={() => navigation.navigate("About")}
          />
          <ProfileOption
            icon="log-out-outline"
            title="Logout"
            onPress={handleLogout}
            color="#EF4444"
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
};
