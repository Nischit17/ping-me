import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BackButton } from "../components/BackButton";
import { db } from "../config/firebase";
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { chatService } from "../services/chatService";

type RootStackParamList = {
  NewChat: undefined;
  Chat: { chatId: string; userName: string; userId: string };
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

  // Load all users when the screen mounts
  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("isActive", "==", true), limit(50));

      const querySnapshot = await getDocs(q);
      console.log("Total users found:", querySnapshot.size);

      const usersList = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
          } as User;
        })
        .filter((user) => user.uid !== currentUser.uid)
        .sort((a, b) => (a.email || "").localeCompare(b.email || ""));

      console.log("Filtered users:", usersList.length);
      console.log("Users list:", usersList);

      setUsers(usersList);
    } catch (error) {
      console.error("Error loading users:", error);
      Alert.alert("Error", "Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (searchText: string) => {
    if (!currentUser || !searchText.trim()) {
      await loadAllUsers();
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("isActive", "==", true), limit(50));

      const querySnapshot = await getDocs(q);
      const searchLower = searchText.toLowerCase();
      const usersList = querySnapshot.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as User)
        )
        .filter(
          (user) =>
            user.uid !== currentUser.uid &&
            (user.email?.toLowerCase().includes(searchLower) ||
              user.displayName?.toLowerCase().includes(searchLower))
        );

      setUsers(usersList);
    } catch (error) {
      console.error("Error searching users:", error);
      Alert.alert("Error", "Failed to search users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update search when query changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchUsers(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleUserSelect = async (selectedUser: User) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const chatId = await chatService.getOrCreateChat(
        currentUser.uid,
        selectedUser.uid
      );

      navigation.navigate("Chat", {
        chatId,
        userId: selectedUser.uid,
        userName: selectedUser.displayName || selectedUser.email.split("@")[0],
      });
    } catch (error) {
      console.error("Error creating chat:", error);
      Alert.alert("Error", "Failed to create chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = searchQuery
    ? users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.displayName &&
            user.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : users;

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
            {(item.displayName || item.email)[0].toUpperCase()}
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
              placeholder="Search by email or name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>
        </Animated.View>

        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-8">
              {loading ? (
                <View className="items-center">
                  <LoadingSpinner />
                  <Text className="text-gray-500 font-[Poppins_400Regular] mt-2">
                    Loading users...
                  </Text>
                </View>
              ) : (
                <View className="items-center">
                  <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 font-[Poppins_400Regular] mt-2">
                    No users found
                  </Text>
                  <Text className="text-gray-400 font-[Poppins_400Regular] text-sm">
                    Try searching with a different term
                  </Text>
                </View>
              )}
            </View>
          )}
        />
      </View>

      {loading && <LoadingSpinner />}
    </View>
  );
};
