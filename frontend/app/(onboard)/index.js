import React, { useState, useEffect } from "react";
import { View, Text, Image, ImageBackground, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PageContainer from "@/components/PageContainer";
import DotsView from "@/components/DotsView";
import Button from "@/components/Button";
import OnboardingStyles from "@/styles/OnboardingStyles";

import { useRouter } from "expo-router";

const Onboarding = ({ navigation }) => {
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
    if (progress >= 1) {
      // navigate to the Onboarding2 Screen
      // navigation.navigate('Onboarding2')
    }
  }, [progress, navigation]);

  const onNavigatePress = (path) => {
    router.push(path); // Replace with your target route
  };

  return (
    <ImageBackground
      source={require("@/assets/images/67f70667bbc9554c154f5613_bg.webp")}
      style={OnboardingStyles.backgroundImage}
    >
      <SafeAreaView
        style={[
          OnboardingStyles.container,
          {
            backgroundColor: "#ffffff",
          },
        ]}
      >
        <PageContainer>
          <View style={OnboardingStyles.contentContainer}>
            <Image
              source={require("@/assets/images/logo.png")}
              resizeMode="contain"
              style={OnboardingStyles.illustration}
            />
            {/* <Image
                            source={images.ornament}
                            resizeMode="contain"
                            style={OnboardingStyles.ornament}
                        /> */}

            <Image
              source={require("@/assets/images/top-logo.png")}
              style={OnboardingStyles.iTruckSeaLogo}
            />

            <View
              style={[
                OnboardingStyles.buttonContainer,
                {
                  backgroundColor: "#ffffff",
                },
              ]}
            >
              <View style={OnboardingStyles.titleContainer}>
                <Text style={[OnboardingStyles.title]}>
                  BUY & SELL SUPER APP
                </Text>
                <Text style={OnboardingStyles.subTitle}>SOLETRADE</Text>
              </View>

              {/* <Text
                            style={[
                                OnboardingStyles.description,
                                { color: colors.text },
                            ]}
                        >
                            We provide the best learning courses and great
                            mentors tailored for your needs.
                        </Text> */}

              <View style={OnboardingStyles.dotsContainer}>
                {progress < 1 && <DotsView progress={progress} numDots={4} />}
              </View>
              <Button
                title="Next"
                filled
                onPress={() => onNavigatePress("/(onboard)/onboarding2")}
                style={OnboardingStyles.nextButton}
              />
              <Button
                title="Skip"
                onPress={() => onNavigatePress("/(tabs)")}
                textColor={"#000000"}
                style={OnboardingStyles.skipButton}
              />
            </View>
          </View>
        </PageContainer>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Onboarding;
