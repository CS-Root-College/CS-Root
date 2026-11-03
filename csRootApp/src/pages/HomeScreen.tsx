
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StatusBar,
} from "react-native";

interface HomeScreenProps {
  isLoggedIn?: boolean;
  username?: string;
  onLogin?: () => void;
  onRegister?: () => void;
  onNavigate?: (screen: string) => void;
}

const HomeScreen = ({
  isLoggedIn = false,
  username = "Developer",
  onLogin,
  onRegister,
  onNavigate,
}: HomeScreenProps) => {
  const features = [
    {
      title: "Problems",
      description: "Practice coding problems",
      icon: "</>",
      screen: "Problems",
    },
    {
      title: "Contests",
      description: "Compete with developers",
      icon: "T",
      screen: "Contests",
    },
    {
      title: "Leaderboard",
      description: "See the top coders",
      icon: "#",
      screen: "Leaderboard",
    },
    {
      title: "Community",
      description: "Connect with developers",
      icon: "C",
      screen: "Community",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0B0F14]">
      <StatusBar
        backgroundColor="#0B0F14"
        barStyle="light-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 35 }}
      >
        <View className="px-5 pt-4">

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]">
                <Text className="text-xl font-black text-[#0B0F14]">
                  C
                </Text>
              </View>

              <Text className="text-2xl font-extrabold text-white">
                CS <Text className="text-[#EAB308]">Root</Text>
              </Text>
            </View>

            {isLoggedIn && (
              <Pressable
                onPress={() => onNavigate?.("Profile")}
                className="h-10 w-10 items-center justify-center rounded-full border border-[#252D38] bg-[#151B23]"
              >
                <Text className="font-bold text-white">
                  {username.charAt(0).toUpperCase()}
                </Text>
              </Pressable>
            )}
          </View>

          <View className="mt-12">
            <Text className="text-sm font-semibold uppercase tracking-[3px] text-[#EAB308]">
              {isLoggedIn ? "YOUR JOURNEY CONTINUES" : "WELCOME TO CS ROOT"}
            </Text>

            <Text className="mt-4 text-4xl font-extrabold leading-[48px] text-white">
              {isLoggedIn
                ? `Welcome back,\n${username}.`
                : "Master the art\nof coding."}
            </Text>

            <Text className="mt-4 text-base leading-7 text-[#929BA8]">
              {isLoggedIn
                ? "Keep solving problems, participate in contests and become a better developer."
                : "A platform built for developers to practice, compete and grow their programming skills."}
            </Text>

            {!isLoggedIn && (
              <View className="mt-7 flex-row gap-3">
                <Pressable
                  onPress={onRegister}
                  className="flex-1 items-center rounded-xl bg-[#EAB308] py-4 active:opacity-80"
                >
                  <Text className="font-bold text-[#0B0F14]">
                    Get Started
                  </Text>
                </Pressable>

                <Pressable
                  onPress={onLogin}
                  className="flex-1 items-center rounded-xl border border-[#343D49] bg-[#151B23] py-4 active:opacity-80"
                >
                  <Text className="font-bold text-white">
                    Login
                  </Text>
                </Pressable>
              </View>
            )}

            {isLoggedIn && (
              <Pressable
                onPress={() => onNavigate?.("Problems")}
                className="mt-7 items-center rounded-xl bg-[#EAB308] py-4"
              >
                <Text className="font-bold text-[#0B0F14]">
                  Continue Practicing
                </Text>
              </Pressable>
            )}
          </View>

          <View className="mt-12 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-white">
              Explore Platform
            </Text>
            <Text className="text-sm text-[#929BA8]">
              Discover more
            </Text>
          </View>

          <View className="mt-5 flex-row flex-wrap justify-between gap-y-4">
            {features.map((feature) => (
              <Pressable
                key={feature.title}
                onPress={() => onNavigate?.(feature.screen)}
                className="w-[48%] rounded-2xl border border-[#252D38] bg-[#151B23] p-4 active:opacity-70"
              >
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#29250F]">
                  <Text className="text-xl font-extrabold text-[#EAB308]">
                    {feature.icon}
                  </Text>
                </View>

                <Text className="mt-5 text-lg font-bold text-white">
                  {feature.title}
                </Text>

                <Text className="mt-2 text-sm leading-5 text-[#929BA8]">
                  {feature.description}
                </Text>

                <Text className="mt-5 text-lg text-[#EAB308]">
                  Explore →
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="mt-10 rounded-2xl border border-[#39321A] bg-[#19170F] p-5">
            <Text className="text-xs font-bold uppercase tracking-[2px] text-[#EAB308]">
              BUILT FOR DEVELOPERS
            </Text>

            <Text className="mt-3 text-2xl font-extrabold text-white">
              Think. Code. Compete.
            </Text>

            <Text className="mt-3 text-sm leading-6 text-[#929BA8]">
              Improve your problem-solving skills, challenge yourself
              and track your journey as a developer.
            </Text>
          </View>

          <View className="mt-10 items-center">
            <Text className="text-sm font-bold text-[#929BA8]">
              CS Root
            </Text>
            <Text className="mt-2 text-xs text-[#626C79]">
              Built for the love of programming.
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
