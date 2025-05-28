import { StyleSheet } from "react-native";
import { COLORS, FONTS, SIZES } from "@/constants";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    height: "100%",
  },
  illustration: {
    height: SIZES.width * 0.57,
    width: SIZES.width * 0.57,
    position: "absolute",
    bottom: 490,
    borderRadius: 20,
  },
  ornament: {
    position: "absolute",
    bottom: -10,
    zIndex: -99,
  },
  iTruckSeaLogo: {
    width: 200,
    height: 80,
    position: "absolute",
    bottom: 400,
    zIndex: -99,
    borderRadius: 10, // Half of the width/height for a circular border
    objectFit: "cover",
  },
  titleContainer: {
    marginVertical: 18,
    alignItems: "center",
    position: "relative",
  },
  title: {
    ...FONTS.h2,
    color: COLORS.primary,
    textTransform: "uppercase",
    textAlign: "center",
  },
  subTitle: {
    ...FONTS.h2,
    color: COLORS.primary,
    textAlign: "center",
    textTransform: "uppercase",
    marginTop: 8,
  },
  description: {
    ...FONTS.body3,
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 16,
  },
  dotsContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  buttonContainer: {
    width: SIZES.width,
    position: "absolute",
    bottom: -35,
    padding: 22,
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
    height: 360,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  nextButton: {
    width: SIZES.width - 44,
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    marginTop: 22,
  },
  skipButton: {
    width: SIZES.width - 44,
    marginBottom: SIZES.padding,
    backgroundColor: "transparent",
    borderColor: COLORS.primary,
  },
  backgroundImage: {
    height: "100%",
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default styles;
