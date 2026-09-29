import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function ConfirmacaoMovimentoScreen({ navigation, route }) {
  const produto = route?.params?.produto || {
    nome: "Água Mineral 500ml",
    quantidade: 38,
    tipo: "Entrada",
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#e2e8f0" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Confirmação</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Feather name="check" size={30} color="#0b1724" />
        </View>

        <Text style={styles.title}>Operação realizada!</Text>
        <Text style={styles.subtitle}>Estoque atualizado com sucesso no sistema.</Text>

        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Produto</Text>
          <Text style={styles.resultValue}>{produto.nome}</Text>

          <View style={styles.rowBetween}>
            <Text style={styles.resultLabel}>Quantidade</Text>
            <Text style={styles.quantity}>{produto.quantidade || 38} un.</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.resultLabel}>Tipo</Text>
            <Text style={[styles.quantity, styles.typeText]}>{produto.tipo || "Entrada"}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.primaryButtonText}>Novo scan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.secondaryButtonText}>Voltar ao início</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101827",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    marginTop: 12,
  },
  headerTitle: {
    color: "#edf2ff",
    fontSize: 18,
    fontWeight: "700",
  },
  headerPlaceholder: {
    width: 20,
  },
  card: {
    backgroundColor: "#1b2438",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#6ee7b7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#a9b7d5",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 18,
  },
  resultBox: {
    width: "100%",
    backgroundColor: "#141f30",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  resultLabel: {
    color: "#9aa8c6",
    fontSize: 11,
    marginBottom: 6,
  },
  resultValue: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  quantity: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "700",
  },
  typeText: {
    color: "#6ee7b7",
  },
  primaryButton: {
    width: "100%",
    backgroundColor: "#aaa8ff",
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
