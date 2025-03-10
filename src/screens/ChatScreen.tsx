import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInUp,
  FadeInDown,
  SlideInRight,
} from "react-native-reanimated";
import { useAuth } from "../contexts/AuthContext";
import { BackButton } from "../components/BackButton";
import { chatService, Message } from "../services/chatService";
import { format } from "date-fns";

type RootStackParamList = {
  Chat: { chatId: string; userName: string; userId: string };
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, "Chat">;

export const ChatScreen = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!user) return;

    // Get or create chat session
    const initializeChat = async () => {
      const chatId = await chatService.getOrCreateChat(
        user.uid,
        route.params.userId
      );

      // Subscribe to messages
      const unsubscribe = chatService.subscribeToMessages(
        chatId,
        (newMessages) => {
          setMessages(newMessages);
        }
      );

      return () => unsubscribe();
    };

    initializeChat();
  }, [user, route.params.userId]);

  const sendMessage = async () => {
    if (!message.trim() || !user) return;

    try {
      await chatService.sendMessage(
        route.params.chatId,
        user.uid,
        message.trim()
      );
      setMessage("");
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.senderId === user?.uid;
    const timestamp = item.createdAt
      ? format(item.createdAt.toDate(), "h:mm a")
      : "";

    return (
      <Animated.View
        entering={
          isUser ? SlideInRight.delay(index * 50) : FadeInUp.delay(index * 50)
        }
        className={`flex-row ${isUser ? "justify-end" : "justify-start"} mb-4`}
      >
        {!isUser && (
          <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-2">
            <Text className="text-primaryDark font-[Poppins_500Medium]">
              {route.params.userName.charAt(0)}
            </Text>
          </View>
        )}
        <View
          className={`${
            isUser ? "bg-primaryDark" : "bg-white"
          } px-4 py-3 rounded-2xl max-w-[80%] shadow-sm`}
        >
          <Text
            className={`${
              isUser ? "text-white" : "text-gray-800"
            } font-[Poppins_400Regular]`}
          >
            {item.text}
          </Text>
          <View className="flex-row items-center justify-end mt-1">
            <Text
              className={`${
                isUser ? "text-white" : "text-gray-500"
              } text-xs font-[Poppins_400Regular] mr-1 opacity-80`}
            >
              {timestamp}
            </Text>
            {isUser && (
              <Ionicons
                name={
                  item.status === "read"
                    ? "checkmark-done"
                    : item.status === "delivered"
                    ? "checkmark-done-outline"
                    : "checkmark-outline"
                }
                size={16}
                color="white"
              />
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <BackButton onPress={() => navigation.goBack()} />
      <Animated.View
        entering={FadeInDown.springify()}
        className="flex-row items-center px-6 pt-20 pb-4 bg-white shadow-sm"
      >
        <View className="flex-row items-center flex-1 mt-5">
          <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
            <Text className="text-primaryDark text-lg font-[Poppins_500Medium]">
              {route.params.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="ml-3">
            <Text className="text-gray-800 font-[Poppins_500Medium] text-lg">
              {route.params.userName}
            </Text>
            <Text className="text-gray-500 font-[Poppins_400Regular]">
              Online
            </Text>
          </View>
        </View>
      </Animated.View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <Animated.View
        entering={FadeInUp.springify()}
        className="p-4 bg-white border-t border-gray-200"
      >
        <View className="flex-row items-center bg-gray-50 rounded-full px-4 py-2">
          <TextInput
            className="flex-1 font-[Poppins_400Regular] text-gray-800"
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!message.trim()}
            className={`ml-2 ${!message.trim() ? "opacity-50" : ""}`}
          >
            <Ionicons
              name="send"
              size={24}
              color={message.trim() ? "#B5B5FF" : "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};
