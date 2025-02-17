import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BackButton } from "../components/BackButton";
import { db } from "../config/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types";
import { LoadingSpinner } from "../components/LoadingSpinner";

type RootStackParamList = {
  NewChat: undefined;
  Chat: { chatId: string; userName: string };
};

type NewChatScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "NewChat"
>;

export const NewChatScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NewChatScreenNavigationProp>();
  const { user: currentUser } = useAuth();

  const searchUsers = async (searchText: string) => {
    if (!searchText.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("email", ">=", searchText.toLowerCase()),
        where("email", "<=", searchText.toLowerCase() + "\uf8ff")
      );

      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs
        .map((doc) => doc.data() as User)
        .filter((user) => user.id !== currentUser?.id); // Exclude current user

      setUsers(usersList);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (selectedUser: User) => {
    navigation.navigate("Chat", {
      chatId: `${currentUser?.id}_${selectedUser.id}`,
      userName: selectedUser.displayName || selectedUser.email.split("@")[0],
    });
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      onPress={() => handleUserSelect(item)}
      className="flex-row items-center px-4 py-3 bg-white rounded-xl mb-3"
    >
      <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-4">
        {item.photoURL ? (
          <Image
            source={{ uri: item.photoURL }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <Text className="text-primaryDark text-xl font-[Poppins_500Medium]">
            {item.displayName?.[0].toUpperCase() || item.email[0].toUpperCase()}
          </Text>
        )}
      </View>
      <View className="flex-1">
        <Text className="text-gray-800 font-[Poppins_500Medium] text-base">
          {item.displayName || item.email.split("@")[0]}
        </Text>
        <Text className="text-gray-500 font-[Poppins_400Regular]">
          {item.email}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <BackButton onPress={() => navigation.goBack()} />

      <View className="flex-1 px-6 pt-20">
        <Animated.View entering={FadeInDown.springify()} className="mb-6">
          <Text className="text-2xl text-gray-800 font-[Poppins_700Bold] mb-2">
            New Chat
          </Text>
          <Text className="text-gray-600 font-[Poppins_400Regular]">
            Search for users to start a conversation
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="mb-6"
        >
          <View className="flex-row items-center bg-white rounded-xl px-4 py-2">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 font-[Poppins_400Regular]"
              placeholder="Search by email..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchUsers(text);
              }}
              autoCapitalize="none"
            />
          </View>
        </Animated.View>

        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={() =>
            searchQuery ? (
              <Text className="text-center text-gray-500 font-[Poppins_400Regular]">
                No users found
              </Text>
            ) : null
          }
        />
      </View>

      {loading && <LoadingSpinner />}
    </View>
  );
};
