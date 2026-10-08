import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function KeepStockHeader({
  title = "KeepStock",
  showBack = false,
  onMenuPress,
  onBackPress,
  onNotificationsPress,
}) {
  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onBackPress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={22} color="#f1f5f9" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onMenuPress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="menu" size={22} color="#f1f5f9" />
        </TouchableOpacity>
      )}

      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity
        style={styles.iconBtn}
        onPress={onNotificationsPress}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Feather name="bell" size={20} color="#f1f5f9" />
        <View style={styles.badgeDot} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    backgroundColor: "#111827",
  },
  iconBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  title: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  badgeDot: {
    position: "absolute",
    top: 6,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#60a5fa",
  },
});
