import React, { useState, useEffect } from "react";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PageContainer from "@/components/PageContainer";
import DotsView from "@/components/DotsView";
import Button from "@/components/Button";
import Onboarding1Styles from "@/styles/OnboardingStyles";
import { COLORS } from "@/constants";
import { useRouter } from "expo-router";

const Onboarding2 = () => {
  const [progress, setProgress] = useState();
  const router = useRouter();
  useEffect(() => {
    const intervalId = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 1) {
          clearInterval(intervalId);
          return prevProgress;
        }
        return prevProgress + 0.5;
      });
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (progress >= 1) {
      // navigate to the Onboarding3 Screen
      router.push("/(onboard)/onboarding3");
    }
  }, [progress]);

  const onNavigatePress = (path) => {
    router.push(path); // Replace with your target route
  };

  return (
    <SafeAreaView style={[Onboarding1Styles.container]}>
      <View style={[Onboarding1Styles.contentContainer]}>
        <Image
          source={require("@/assets/images/top-logo.png")}
          resizeMode="contain"
          style={Onboarding1Styles.illustration}
        />
        <Image
          source={require("@/assets/images/bua-siam-models-bangkok-agency-female-thai-model-01.jpg")}
          resizeMode="contain"
          style={Onboarding1Styles.ornament}
        />
        <View
          style={[
            Onboarding1Styles.buttonContainer,
            { paddingBottom: 50, backgroundColor: "#ffffff" },
          ]}
        >
          <View style={Onboarding1Styles.titleContainer}>
            <Text
              style={[Onboarding1Styles.title, { color: COLORS.brandColor }]}
            >
              BUY & SELL SUPER APP
            </Text>
            <Text style={Onboarding1Styles.subTitle}>SOLETRADE</Text>
          </View>

          <Text
            style={[
              Onboarding1Styles.description,
              { color: COLORS.brandColor },
            ]}
          >
            Buy and sell products with ease and convenience.
          </Text>

          <View style={Onboarding1Styles.dotsContainer}>
            {progress < 1 && <DotsView progress={progress} numDots={4} />}
          </View>
          <Button
            title="Next"
            filled
            onPress={() => onNavigatePress("/(onboard)/onboarding3")}
            style={Onboarding1Styles.nextButton}
          />
          <Button
            title="Skip"
            onPress={() => onNavigatePress("/(tabs)")}
            textColor={COLORS.primary}
            style={Onboarding1Styles.skipButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding2;
