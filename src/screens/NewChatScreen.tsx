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
      const q = query(usersRef, orderBy("email"), limit(50));

      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as User)
        )
        .filter((user) => user.uid !== currentUser.uid);

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
      const searchLower = searchText.toLowerCase();

      // Search by email
      const q = query(
        usersRef,
        orderBy("email"),
        where("email", ">=", searchLower),
        where("email", "<=", searchLower + "\uf8ff"),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as User)
        )
        .filter((user) => user.uid !== currentUser.uid);

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
            <Text className="text-center text-gray-500 font-[Poppins_400Regular]">
              {loading ? "Loading users..." : "No users found"}
            </Text>
          )}
        />
      </View>

      {loading && <LoadingSpinner />}
    </View>
  );
};
