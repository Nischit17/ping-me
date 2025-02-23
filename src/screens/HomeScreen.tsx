import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth } from "../contexts/AuthContext";
import { chatService, Chat } from "../services/chatService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { format } from "date-fns";
import { User } from "../types";

type RootStackParamList = {
  Home: undefined;
  NewChat: undefined;
  Chat: { chatId: string; userName: string; userId: string };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

export const HomeScreen = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [chatUsers, setChatUsers] = useState<Record<string, User>>({});
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = chatService.subscribeToChats(
      user.uid,
      async (newChats) => {
        setChats(newChats);

        // Fetch user details for each chat
        const userPromises = newChats.map(async (chat) => {
          const otherUserId = chat.participants.find((id) => id !== user.uid);
          if (otherUserId && !chatUsers[otherUserId]) {
            const userDoc = await getDoc(doc(db, "users", otherUserId));
            if (userDoc.exists()) {
              setChatUsers((prev) => ({
                ...prev,
                [otherUserId]: userDoc.data() as User,
              }));
            }
          }
        });

        await Promise.all(userPromises);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh logic here if needed
    setRefreshing(false);
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const otherUserId = item.participants.find((id) => id !== user?.uid);
    const otherUser = otherUserId ? chatUsers[otherUserId] : null;
    const userName =
      otherUser?.displayName || otherUser?.email?.split("@")[0] || "Unknown";
    const lastMessage = item.lastMessage?.text || "No messages yet";
    const timestamp = item.lastMessage?.createdAt
      ? format(item.lastMessage.createdAt.toDate(), "h:mm a")
      : "";

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Chat", {
            chatId: item.id,
            userName,
            userId: otherUserId || "",
          })
        }
        className="flex-row items-center px-4 py-3 bg-white rounded-xl mb-3"
      >
        <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-4">
          {otherUser?.photoURL ? (
            <Image
              source={{ uri: otherUser.photoURL }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <Text className="text-primaryDark text-xl font-[Poppins_500Medium]">
              {userName[0].toUpperCase()}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-800 font-[Poppins_500Medium] text-base">
              {userName}
            </Text>
            {timestamp && (
              <Text className="text-gray-500 text-xs font-[Poppins_400Regular]">
                {timestamp}
              </Text>
            )}
          </View>
          <Text
            numberOfLines={1}
            className="text-gray-500 font-[Poppins_400Regular]"
          >
            {lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-16">
        <Animated.View
          entering={FadeInDown.springify()}
          className="flex-row justify-between items-center mb-6"
        >
          <Text className="text-2xl text-gray-800 font-[Poppins_700Bold]">
            Chats
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("NewChat")}
            className="bg-primary rounded-full p-2"
          >
            <Ionicons name="add" size={24} color="#B5B5FF" />
          </TouchableOpacity>
        </Animated.View>

        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-gray-500 font-[Poppins_400Regular] text-center">
                No chats yet.{"\n"}Start a new conversation!
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};
