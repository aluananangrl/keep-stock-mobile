import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";

const produtos = [
  { nome: "Água Mineral 500ml", codigo: "COD-544", estoque: 38 },
  { nome: "Salgadinho 100g", codigo: "COD-219", estoque: 15 },
  { nome: "Refrigerante 350ml", codigo: "COD-801", estoque: 120 },
  { nome: "Café 250g", codigo: "COD-320", estoque: 60 },
];

export default function ListaProdutosScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#e1e3f0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lista de Produtos</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
          <Feather name="user" size={20} color="#e1e3f0" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {produtos.map((produto) => (
          <TouchableOpacity key={produto.codigo} style={styles.card} onPress={() => navigation.navigate("DetalhesProduto", { produto })}>
            <View style={styles.iconBox}>
              <Feather name="package" size={18} color="#aaa8ff" />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.name}>{produto.nome}</Text>
              <Text style={styles.code}>{produto.codigo}</Text>
            </View>
            <Text style={styles.stock}>{produto.estoque} un.</Text>
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
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#1a2437", borderRadius: 16, padding: 14, marginBottom: 12 },
  iconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#20283b", justifyContent: "center", alignItems: "center", marginRight: 12 },
  textWrap: { flex: 1 },
  name: { color: "#edf2ff", fontSize: 14, fontWeight: "600" },
  code: { color: "#8ea0c8", fontSize: 11, marginTop: 2 },
  stock: { color: "#f8fafc", fontSize: 12, fontWeight: "700" },
});
