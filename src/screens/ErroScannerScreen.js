import { BRAND_COLORS } from "../context/colors";
import ScreenBackground from "../components/ScreenBackground";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function ErroScannerScreen({ navigation, route }) {
  const codigo = route?.params?.codigo || "WHS-01";

  return (
    <ScreenBackground>
<View style={[styles.container, { backgroundColor: "transparent" }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#e2e8f0" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Erro no scanner</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.warningCircle}>
          <Feather name="alert-circle" size={38} color="#ffffff" />
        </View>

        <Text style={styles.title}>Código não reconhecido</Text>
        <Text style={styles.subtitle}>
          Não foi possível identificar o código informado. Verifique o QR Code ou tente novamente.
        </Text>

        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>Código lido</Text>
          <Text style={styles.codeValue}>{codigo}</Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("CameraScanner")}>
          <Text style={styles.primaryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.secondaryButtonText}>Voltar ao início</Text>
        </TouchableOpacity>
      </View>
    </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101827",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 18,
  },
  headerTitle: {
    color: "#edf2ff",
    fontSize: 18,
    fontWeight: "700",
  },
  headerPlaceholder: {
    width: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  warningCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#f43f5e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#c9d3ee",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  codeBox: {
    width: "100%",
    backgroundColor: "#1d2438",
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
  },
  codeLabel: {
    color: "#9aa8c6",
    fontSize: 11,
    marginBottom: 6,
  },
  codeValue: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
  primaryButton: {
    width: "100%",
    backgroundColor: BRAND_COLORS.highlight,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#1a2244",
    fontWeight: "700",
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: "#1f293a",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#e2e8f0",
    fontWeight: "700",
  },
});
