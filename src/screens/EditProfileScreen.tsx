import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedInput } from "../components/AnimatedInput";
import { AnimatedButton } from "../components/AnimatedButton";
import { BackButton } from "../components/BackButton";
import { LoadingSpinner } from "../components/LoadingSpinner";
import * as ImagePicker from "expo-image-picker";
import { storage } from "../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const EditProfileScreen = () => {
  const { user, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigation = useNavigation();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      try {
        setLoading(true);
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();

        const storageRef = ref(storage, `profile_pictures/${user?.id}`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        setPhotoURL(downloadURL);
      } catch (error) {
        console.error("Error uploading image:", error);
        setError("Failed to upload image. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }

    try {
      setLoading(true);
      await updateUserProfile(displayName.trim(), photoURL || "");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <BackButton onPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6">
          <View className="h-20" />
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            className="items-center mb-8"
          >
            <TouchableOpacity onPress={pickImage} className="relative">
              <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-3">
                {photoURL ? (
                  <Image
                    source={{ uri: photoURL }}
                    className="w-24 h-24 rounded-full"
                  />
                ) : (
                  <Text className="text-primaryDark text-3xl font-[Poppins_500Medium]">
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View className="absolute bottom-2 right-0 bg-primaryDark rounded-full p-2">
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </TouchableOpacity>

            <Text className="text-gray-600 font-[Poppins_400Regular]">
              Tap to change profile picture
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            className="space-y-4"
          >
            <AnimatedInput
              label="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your display name"
              error={error}
              autoCapitalize="words"
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            className="mt-8"
          >
            <AnimatedButton
              onPress={handleSave}
              title="Save Changes"
              loading={loading}
            />
          </Animated.View>
        </View>
      </KeyboardAvoidingView>

      {loading && <LoadingSpinner />}
    </View>
  );
};
