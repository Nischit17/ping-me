import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { AnimatedInput } from "../components/AnimatedInput";
import { AnimatedButton } from "../components/AnimatedButton";
import { screenTransition } from "../utils/animations";
import { BackButton } from "../components/BackButton";
import { LoadingSpinner } from "../components/LoadingSpinner";

type RootStackParamList = {
  Register: undefined;
  SignIn: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
};

type SignInScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SignIn"
>;

export const SignInScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<SignInScreenNavigationProp>();
  const { signIn } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await signIn(email, password);
      // After successful sign in, navigation to MainTabs will be handled by the Navigation component in App.tsx
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        setErrors({ email: "No account found with this email" });
      } else if (error.code === "auth/wrong-password") {
        setErrors({ password: "Incorrect password" });
      } else {
        setErrors({ password: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View className="flex-1 bg-background" {...screenTransition}>
      <BackButton onPress={() => navigation.navigate("Onboarding")} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-12">
          <Animated.View
            entering={FadeInDown.delay(100).duration(1000).springify()}
            className="mb-8"
          >
            <Text className="text-3xl mt-12 text-gray-800 font-[Poppins_700Bold]">
              Login
            </Text>
            <View className="flex-row items-center mt-2">
              <Text className="text-gray-600 font-[Poppins_400Regular]">
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text className="text-primaryDark font-[Poppins_500Medium] ml-1">
                  Create one
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(1000).springify()}
            className="space-y-4"
          >
            <AnimatedInput
              label="Email address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              error={errors.email}
            />

            <AnimatedInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              error={errors.password}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(300).duration(1000).springify()}
            className="mt-8"
          >
            <AnimatedButton
              onPress={handleSignIn}
              title="Continue"
              loading={loading}
            />
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
      {loading && <LoadingSpinner />}
    </Animated.View>
  );
};
