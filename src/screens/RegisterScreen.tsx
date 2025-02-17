import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from "react-native-reanimated";
import { AnimatedInput } from "../components/AnimatedInput";
import { AnimatedButton } from "../components/AnimatedButton";
import { screenTransition } from "../utils/animations";
import { BackButton } from "../components/BackButton";
import { LoadingSpinner } from "../components/LoadingSpinner";

type RootStackParamList = {
  Register: undefined;
  SignIn: undefined;
  Onboarding: undefined;
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Register"
>;

export const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { signUp } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await signUp(email, password, email.split("@")[0]);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setErrors({ email: "Email is already registered" });
      } else {
        setErrors({ password: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View className="flex-1 bg-background" {...screenTransition}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1">
          <BackButton onPress={() => navigation.navigate("Onboarding")} />

          <View className="flex-1 px-6">
            <View className="h-20" /> {/* Spacer for back button */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(1000).springify()}
              className="mb-8"
            >
              <Text className="text-3xl mt-5 text-gray-800 font-[Poppins_700Bold]">
                Create an account
              </Text>
              <View className="flex-row items-center mt-2">
                <Text className="text-gray-600 font-[Poppins_400Regular]">
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
                  <Text className="text-primaryDark font-[Poppins_500Medium] ml-1">
                    Login
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
                secureTextEntry
                error={errors.password}
              />
            </Animated.View>
            <Animated.View
              entering={FadeInUp.delay(300).duration(1000).springify()}
              className="mt-8"
            >
              <AnimatedButton
                onPress={handleRegister}
                title="Continue"
                loading={loading}
              />
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>
      {loading && <LoadingSpinner />}
    </Animated.View>
  );
};
