import { useLanguage } from "@/context/LanguageContext";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text } from "react-native";

const GlobalTimer = ({
  itemPublishTime,
  fontSize,
}: {
  itemPublishTime: string;
  fontSize: number;
}) => {
  const targetDateTime = new Date(itemPublishTime).getTime();
  const [remainingTime, setRemainingTime] = useState(calculateRemainingTime);
  const localDate = new Date(itemPublishTime);
  const { language } = useLanguage();

  function calculateRemainingTime() {
    const currentDate = new Date().getTime();
    const remainingTime = targetDateTime - currentDate;
    return remainingTime;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(calculateRemainingTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (remainingTime <= 0) {
    return (
      <>
        <Text
          style={{
            color: "#aaa",
            paddingHorizontal: 10,
            fontSize: fontSize ? fontSize - 2 : 12,
          }}
        >
          {localDate.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        <Text
          style={{
            color: "red",
            paddingHorizontal: 10,
            fontSize: fontSize ? fontSize : 14,
          }}
        >
          {language === "en" ? "Launched" : "เริ่มขาย"}
        </Text>
      </>
    );
  }

  const days = Math.floor(remainingTime / (86400 * 1000));
  const hours = Math.floor((remainingTime % (86400 * 1000)) / (3600 * 1000));
  const minutes = Math.floor((remainingTime % (3600 * 1000)) / (60 * 1000));
  const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

  const displayTime = `${days.toString().padStart(2, "0")}d : ${hours
    .toString()
    .padStart(2, "0")}h : ${minutes.toString().padStart(2, "0")}m : ${seconds
    .toString()
    .padStart(2, "0")}s`;

  return (
    <>
      <Text
        style={{
          color: "#aaa",
          paddingHorizontal: 10,
          fontSize: fontSize ? fontSize - 2 : 12,
        }}
      >
        {localDate.toLocaleString(language === "th" ? "th-TH" : "en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      <Text
        style={{
          color: "white",
          paddingHorizontal: 10,
          fontSize: fontSize ? fontSize : 14,
        }}
      >
        {displayTime}
      </Text>
    </>
  );
};

export default GlobalTimer;

const styles = StyleSheet.create({});
