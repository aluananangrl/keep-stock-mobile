import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

export const SCREEN_BACKGROUND = "#0B1220";

// Telas com paleta própria escura mantêm o contraste do conteúdo.
export default function ScreenBackground({ children, adaptive = false }) {
  const { theme } = useTheme();
  const light = adaptive && theme === "light";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: light ? "#F4F7FC" : SCREEN_BACKGROUND },
      ]}
    >
      <LinearGradient
        pointerEvents="none"
        accessible={false}
        colors={
          light
            ? ["#E8F0FF", "#F4F7FC", "#EFF6FF"]
            : ["#101B4B", "#0A1538", SCREEN_BACKGROUND]
        }
        locations={[0, 0.42, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
