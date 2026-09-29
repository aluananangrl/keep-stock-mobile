import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function HistoricoScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#e1e3f0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
          <Feather name="user" size={20} color="#e1e3f0" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {[
          { titulo: "Entrada", detalhe: "12 unidades · 08:40", tipo: "mais" },
          { titulo: "Saída", detalhe: "5 unidades · 09:15", tipo: "menos" },
          { titulo: "Ajuste", detalhe: "Inventário · 10:50", tipo: "mais" },
        ].map((item) => (
          <View key={item.titulo} style={styles.itemRow}>
            <View style={[styles.dot, item.tipo === "mais" ? styles.dotGreen : styles.dotRed]} />
            <View style={styles.textWrap}>
              <Text style={styles.itemTitle}>{item.titulo}</Text>
              <Text style={styles.itemDetail}>{item.detalhe}</Text>
            </View>
            <Text style={[styles.value, item.tipo === "mais" ? styles.valueGreen : styles.valueRed]}>{item.tipo === "mais" ? "+" : "-"}</Text>
          </View>
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
  itemRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#1a2437", borderRadius: 16, padding: 16, marginBottom: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  dotGreen: { backgroundColor: "#34d399" },
  dotRed: { backgroundColor: "#f87171" },
  textWrap: { flex: 1 },
  itemTitle: { color: "#e2e8f0", fontSize: 14, fontWeight: "700" },
  itemDetail: { color: "#8ea0c8", fontSize: 11, marginTop: 3 },
  value: { fontSize: 18, fontWeight: "700" },
  valueGreen: { color: "#34d399" },
  valueRed: { color: "#f87171" },
});
