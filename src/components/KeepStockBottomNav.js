import { BRAND_COLORS } from "../context/colors";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function KeepStockBottomNav({
  activeTab = "inicio",
  navigation,
}) {
  return (
    <View style={styles.container}>
      {/* Aba Início */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => {
          if (navigation) navigation.navigate("Home");
        }}
      >
        <Feather
          name="home"
          size={20}
          color={activeTab === "inicio" ? BRAND_COLORS.highlight : "#94a3b8"}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "inicio" && styles.tabTextActive,
          ]}
        >
          Início
        </Text>
      </TouchableOpacity>

      {/* Botão Central Scanner */}
      <TouchableOpacity
        style={styles.scannerWrapper}
        activeOpacity={0.85}
        onPress={() => {
          if (navigation) navigation.navigate("CameraScanner");
        }}
      >
        <View style={styles.scannerCircle}>
          <Feather name="camera" size={22} color={BRAND_COLORS.ink} />
        </View>
        <Text
          style={[
            styles.tabText,
            activeTab === "scanner" && styles.tabTextActive,
          ]}
        >
          Scanner
        </Text>
      </TouchableOpacity>

      {/* Aba Visualizar */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => {
          if (navigation) navigation.navigate("ListaProdutos");
        }}
      >
        <Feather
          name="eye"
          size={20}
          color={activeTab === "visualizar" ? BRAND_COLORS.highlight : "#94a3b8"}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "visualizar" && styles.tabTextActive,
          ]}
        >
          Visualizar
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#161f32",
    borderTopWidth: 1,
    borderTopColor: "#1f2a40",
    paddingTop: 10,
    paddingBottom: 24,
    height: 78,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
  },
  scannerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -24,
    width: 80,
  },
  scannerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: BRAND_COLORS.pale,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BRAND_COLORS.highlight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 4,
    borderWidth: 3,
    borderColor: "#161f32",
  },
  tabText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#94a3b8",
    marginTop: 3,
  },
  tabTextActive: {
    color: BRAND_COLORS.highlight,
    fontWeight: "700",
  },
});
