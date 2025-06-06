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

  function calculateRemainingTime() {
    const currentDate = new Date().getTime();
    const remainingTime = Math.max(0, targetDateTime - currentDate);
    return remainingTime;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(calculateRemainingTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
    <Text
      style={{
        color: remainingTime > 0 ? "white" : "red",
        paddingHorizontal: 10,
        fontSize: fontSize ? fontSize : 14,
      }}
    >
      {remainingTime > 0 && displayTime}
    </Text>
  );
};

export default GlobalTimer;

const styles = StyleSheet.create({});
