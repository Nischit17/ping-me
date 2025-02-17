import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import LottieView from "lottie-react-native";

type RootStackParamList = {
  Home: undefined;
  Chat: { chatId: string; userName: string };
  Profile: undefined;
  NewChat: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

interface ChatPreview {
  id: string;
  userName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar?: string;
}

const DUMMY_CHATS: ChatPreview[] = [
  {
    id: "1",
    userName: "John Doe",
    lastMessage: "Hey, how are you?",
    timestamp: "2 min ago",
    unreadCount: 2,
  },
  {
    id: "2",
    userName: "Jane Smith",
    lastMessage: "The meeting is at 3 PM",
    timestamp: "1 hour ago",
    unreadCount: 0,
  },
  // Add more dummy chats here
];

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        {/* <LottieView
          source={require("../../assets/animations/chat-loading.json")}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        /> */}
      </View>
    );
  }

  const renderChatItem = ({
    item,
    index,
  }: {
    item: ChatPreview;
    index: number;
  }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 100).springify()}
      className="mb-4"
    >
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Chat", {
            chatId: item.id,
            userName: item.userName,
          })
        }
        className="flex-row items-center px-4 py-3 bg-white rounded-xl shadow-sm"
      >
        <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-4">
          {item.avatar ? (
            <Image
              source={{ uri: item.avatar }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <Text className="text-primaryDark text-lg font-[Poppins_500Medium]">
              {item.userName.charAt(0)}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-800 font-[Poppins_500Medium] text-base">
              {item.userName}
            </Text>
            <Text className="text-gray-500 text-sm font-[Poppins_400Regular]">
              {item.timestamp}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mt-1">
            <Text
              className="text-gray-500 font-[Poppins_400Regular]"
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
            {item.unreadCount > 0 && (
              <View className="bg-primaryDark rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-[Poppins_500Medium]">
                  {item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-background">
      <Animated.View
        entering={FadeInDown.springify()}
        className="flex-row justify-between items-center px-6 pt-14 pb-4 bg-white shadow-sm"
      >
        <View>
          <Text className="text-2xl text-gray-800 font-[Poppins_700Bold]">
            Chats
          </Text>
          <Text className="text-gray-500 font-[Poppins_400Regular]">
            {DUMMY_CHATS.length} conversations
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          className="w-10 h-10 rounded-full bg-primary items-center justify-center"
        >
          <Text className="text-primaryDark text-lg font-[Poppins_500Medium]">
            {user?.email?.charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <FlatList
        data={DUMMY_CHATS}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity
        onPress={() => navigation.navigate("NewChat")}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primaryDark rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="chatbubble-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};
