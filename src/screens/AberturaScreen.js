import React, { useEffect } from "react";
import { Image, StatusBar, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function AberturaScreen({ navigation }) {
  useEffect(() => {
    const timeout = setTimeout(() => navigation.replace("Login"), 1250);
    return () => clearTimeout(timeout);
  }, [navigation]);
  return (
    <View style={styles.fundo}>
      <StatusBar barStyle="light-content" backgroundColor="#0a1436" />
      <Image
        source={require("../../assets/login-keepstock.png")}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <View style={styles.marca}>
        <Feather name="box" color="#8c91ff" size={50} />
        <Text style={styles.nome}>Keep{"\n"}Stock</Text>
      </View>
      <Text style={styles.slogan}>
        Controle de estoque{"\n"}na palma da mão
      </Text>
      <View style={styles.progresso}>
        <View style={styles.progressoAtivo} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: "#0a1436", alignItems: "center" },
  marca: {
    position: "absolute",
    top: "15%",
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  nome: { color: "#fff", fontSize: 38, fontWeight: "900", lineHeight: 40 },
  slogan: {
    position: "absolute",
    top: "32%",
    color: "#fff",
    textAlign: "center",
    fontSize: 19,
    fontWeight: "600",
  },
  progresso: {
    position: "absolute",
    bottom: "9%",
    width: "48%",
    height: 7,
    borderRadius: 10,
    backgroundColor: "#36426a",
  },
  progressoAtivo: {
    width: "56%",
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#8588ff",
  },
});
