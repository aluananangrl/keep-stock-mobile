import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function ResultadoLeituraScreen({ navigation, route }) {
  const codigo = route?.params?.codigo || "WHS-01";
  const produto = route?.params?.produto || {
    nome: "Água Mineral 500ml",
    codigo: "COD-544",
    local: "Setor A",
    estoque: 38,
    valor: "R$ 4,90",
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#e2e8f0" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Resultado da Leitura</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
          <Feather name="user" size={18} color="#e2e8f0" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.productHeader}>
          <View style={styles.imageBox}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
              }}
              style={styles.image}
            />
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productName}>{produto.nome}</Text>
            <Text style={styles.productMeta}>Código: {produto.codigo || codigo}</Text>
            <Text style={styles.productMeta}>Local: {produto.local}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Estoque atual</Text>
          <Text style={styles.infoValue}>{produto.estoque} un.</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Valor unitário</Text>
          <Text style={styles.infoValue}>{produto.valor}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("CameraScanner")}>
            <Text style={styles.secondaryButtonText}>Novo scan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("ConfirmacaoMovimento", { produto: { ...produto, quantidade: produto.estoque } })}
          >
            <Text style={styles.primaryButtonText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101827",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 18,
  },
  headerTitle: {
    color: "#edf2ff",
    fontSize: 18,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#1b2438",
    borderRadius: 22,
    padding: 18,
    marginTop: 10,
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  imageBox: {
    width: 90,
    height: 90,
    borderRadius: 18,
    overflow: "hidden",
    marginRight: 16,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  productMeta: {
    color: "#a9b7d5",
    fontSize: 12,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#2b3954",
  },
  infoLabel: {
    color: "#9aa8c6",
    fontSize: 12,
  },
  infoValue: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#aaa8ff",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#1a2244",
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#1f293a",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#e2e8f0",
    fontWeight: "700",
  },
});
