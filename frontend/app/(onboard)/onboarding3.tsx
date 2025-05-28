import React, { useState, useEffect } from "react";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PageContainer from "@/components/PageContainer";
import DotsView from "@/components/DotsView";
import Button from "@/components/Button";
import Onboarding1Styles from "@/styles/OnboardingStyles";
import { COLORS } from "@/constants";
import { useRouter } from "expo-router";

const Onboarding3 = () => {
  const [progress, setProgress] = useState(0);
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
    if (progress >= 2) {
      // navigate to the Onboarding4 Screen
      router.push("/(tabs)");
    }
  }, [progress]);

  return (
    <SafeAreaView
      style={[
        Onboarding1Styles.container,
        {
          backgroundColor: "#ffffff",
        },
      ]}
    >
      <PageContainer>
        <View style={Onboarding1Styles.contentContainer}>
          <Image
            source={require("@/assets/images/top-logo.png")}
            resizeMode="contain"
            style={Onboarding1Styles.illustration}
          />
          <Image
            source={require("@/assets/images/shoead.jpg")}
            resizeMode="contain"
            style={Onboarding1Styles.ornament}
          />
          <View
            style={[
              Onboarding1Styles.buttonContainer,
              {
                backgroundColor: "#ffffff",
                paddingBottom: 50,
              },
            ]}
          >
            <View style={Onboarding1Styles.titleContainer}>
              <Text
                style={[Onboarding1Styles.title, { color: COLORS.brandColor }]}
              >
                Organized
              </Text>
              <Text style={Onboarding1Styles.subTitle}>
                A Premium BUY & SELL
              </Text>
            </View>

            <Text
              style={[
                Onboarding1Styles.description,
                { color: COLORS.brandColor },
              ]}
            >
              Discover thousands of products, ensuring your shopping experience.
            </Text>

            <View style={Onboarding1Styles.dotsContainer}>
              {progress < 1 && <DotsView progress={progress} numDots={4} />}
            </View>
            <Button
              title="Browse"
              filled
              onPress={() => router.push("/(tabs)")}
              style={Onboarding1Styles.nextButton}
            />
          </View>
        </View>
      </PageContainer>
    </SafeAreaView>
  );
};

export default Onboarding3;
