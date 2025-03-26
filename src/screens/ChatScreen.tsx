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
  Alert,
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
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

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
  const [isOnline, setIsOnline] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (!user) return;

    // Get or create chat session
    const initializeChat = async () => {
      const chatId = await chatService.getOrCreateChat(
        user.uid,
        route.params.userId
      );

      // Mark messages as read when entering chat
      await chatService.markMessagesAsRead(chatId, user.uid);

      // Subscribe to messages
      const unsubscribe = chatService.subscribeToMessages(
        chatId,
        (newMessages) => {
          setMessages(newMessages);
        }
      );

      // Subscribe to user status
      const unsubscribeStatus = chatService.subscribeToUserStatus(
        route.params.userId,
        (online) => {
          setIsOnline(online);
        }
      );

      return () => {
        unsubscribe();
        unsubscribeStatus();
      };
    };

    initializeChat();
  }, [user, route.params.userId]);

  useEffect(() => {
    if (!route.params.chatId || !user?.uid) return;

    // Mark messages as read when the chat is opened
    chatService.markMessagesAsRead(route.params.chatId, user.uid);

    // Listen for message updates
    const messagesRef = collection(db, `chats/${route.params.chatId}/messages`);
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(updatedMessages);
    });

    return () => {
      unsubscribe();
    };
  }, [route.params.chatId, user?.uid]);

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

  const handleLongPress = (message: Message) => {
    if (message.senderId === user?.uid) {
      setSelectedMessage(message);
      Alert.alert("Message Options", "What would you like to do?", [
        {
          text: "Edit",
          onPress: () => {
            setIsEditing(true);
            setEditText(message.text);
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Delete Message",
              "Are you sure you want to delete this message?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => handleDeleteMessage(message),
                },
              ]
            );
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    }
  };

  const handleDeleteMessage = async (message: Message) => {
    try {
      await chatService.deleteMessage(route.params.chatId, message.id);
    } catch (error) {
      console.error("Error deleting message:", error);
      Alert.alert("Error", "Failed to delete message");
    }
  };

  const handleEditMessage = async () => {
    if (!selectedMessage || !editText.trim()) return;

    try {
      await chatService.editMessage(
        route.params.chatId,
        selectedMessage.id,
        editText.trim()
      );
      setIsEditing(false);
      setSelectedMessage(null);
      setEditText("");
    } catch (error) {
      console.error("Error editing message:", error);
      Alert.alert("Error", "Failed to edit message");
    }
  };

  const renderMessage = ({ item: message }: { item: Message }) => (
    <TouchableOpacity
      onLongPress={() => handleLongPress(message)}
      activeOpacity={0.7}
      className={`flex-row ${
        message.senderId === user?.uid ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <View
        className={`rounded-2xl px-4 py-2 max-w-[80%] ${
          message.senderId === user?.uid ? "bg-primary" : "bg-gray-200"
        }`}
      >
        <Text
          className={`text-base font-[Poppins_400Regular] ${
            message.senderId === user?.uid ? "text-white" : "text-gray-800"
          }`}
        >
          {message.isDeleted ? "This message was deleted" : message.text}
          {message.isEdited && !message.isDeleted && (
            <Text className="text-xs italic"> (edited)</Text>
          )}
        </Text>
        {message.senderId === user?.uid && (
          <View className="flex-row justify-end items-center mt-1">
            <Text className="text-xs text-gray-200 mr-1">
              {message.createdAt
                ? format(message.createdAt.toDate(), "h:mm a")
                : ""}
            </Text>
            {message.status === "sent" && (
              <Ionicons
                name="checkmark"
                size={16}
                color="rgba(229, 231, 235, 0.8)"
              />
            )}
            {message.status === "delivered" && (
              <Ionicons
                name="checkmark-done"
                size={16}
                color="rgba(229, 231, 235, 0.8)"
              />
            )}
            {message.status === "read" && (
              <Ionicons name="checkmark-done" size={16} color="#4CAF50" />
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

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
            <Text
              className={`font-[Poppins_400Regular] ${
                isOnline ? "text-green-500" : "text-gray-500"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
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

      {isEditing ? (
        <View className="flex-row items-center p-2 bg-gray-100">
          <TextInput
            className="flex-1 bg-white rounded-full px-4 py-2 mr-2"
            value={editText}
            onChangeText={setEditText}
            placeholder="Edit message..."
          />
          <TouchableOpacity
            onPress={handleEditMessage}
            className="bg-primary rounded-full p-2"
          >
            <Ionicons name="checkmark" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsEditing(false);
              setSelectedMessage(null);
              setEditText("");
            }}
            className="bg-gray-400 rounded-full p-2 ml-2"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-row items-center p-2 bg-gray-100">
          <TextInput
            className="flex-1 bg-white rounded-full px-4 py-2 mr-2"
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!message.trim()}
            className={`rounded-full p-2 ${
              message.trim() ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};
