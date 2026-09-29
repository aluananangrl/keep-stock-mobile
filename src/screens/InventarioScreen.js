import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const produtos = [
  { nome: "Água Mineral 500ml", estoque: 38, status: "Baixo" },
  { nome: "Salgadinho 100g", estoque: 15, status: "Crítico" },
  { nome: "Refrigerante 350ml", estoque: 120, status: "Normal" },
];

export default function InventarioScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#e1e3f0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventário</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
          <Feather name="user" size={20} color="#e1e3f0" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {produtos.map((item) => (
          <TouchableOpacity key={item.nome} style={styles.productRow} onPress={() => navigation.navigate("DetalhesProduto", { produto: item })}>
            <View style={styles.iconBox}>
              <Feather name="package" size={18} color="#aaa8ff" />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.nome}</Text>
              <Text style={styles.productStock}>Estoque: {item.estoque} un.</Text>
            </View>
            <Text style={[styles.status, item.status === "Crítico" ? styles.red : item.status === "Baixo" ? styles.amber : styles.green]}>{item.status}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#101827" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 18 },
  headerTitle: { color: "#edf2ff", fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2437",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  iconBox: { width: 38, height: 38, borderRadius: 10, backgroundColor: "#20283b", justifyContent: "center", alignItems: "center", marginRight: 12 },
  productInfo: { flex: 1 },
  productName: { color: "#edf2ff", fontSize: 14, fontWeight: "600" },
  productStock: { color: "#8ea0c8", fontSize: 11, marginTop: 3 },
  status: { fontSize: 10, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12 },
  red: { backgroundColor: "rgba(248,113,113,0.12)", color: "#f87171" },
  amber: { backgroundColor: "rgba(251,191,36,0.12)", color: "#fbbf24" },
  green: { backgroundColor: "rgba(52,211,153,0.12)", color: "#34d399" },
});
