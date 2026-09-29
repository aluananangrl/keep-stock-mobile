import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function DashboardScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#e1e3f0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
          <Feather name="user" size={18} color="#e1e3f0" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Produtos</Text>
            <Text style={styles.statValue}>256</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Movimentos</Text>
            <Text style={styles.statValue}>1.245</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.statCardWide}>
            <Text style={styles.statLabel}>Estoque baixo</Text>
            <Text style={styles.alertValue}>12 itens</Text>
          </View>
        </View>

        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>Últimos alertas</Text>
          {[
            "Água Mineral 500ml",
            "Salgadinho 100g",
            "Refrigerante 350ml",
          ].map((item, index) => (
            <View key={item} style={styles.listRow}>
              <View style={[styles.dot, index === 0 ? styles.dotRed : index === 1 ? styles.dotAmber : styles.dotGreen]} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#101827" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerTitle: { color: "#edf2ff", fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  cardRow: { flexDirection: "row", marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: "#1a2437",
    borderRadius: 16,
    padding: 18,
    marginRight: 10,
  },
  statCardWide: {
    flex: 1,
    backgroundColor: "#1a2437",
    borderRadius: 16,
    padding: 18,
  },
  statLabel: { color: "#8ea0c8", fontSize: 11 },
  statValue: { color: "#f8fafc", fontSize: 28, fontWeight: "700", marginTop: 10 },
  alertValue: { color: "#fbbf24", fontSize: 24, fontWeight: "700", marginTop: 10 },
  listCard: { backgroundColor: "#1a2437", borderRadius: 18, padding: 18 },
  sectionTitle: { color: "#edf2ff", fontSize: 16, fontWeight: "700", marginBottom: 12 },
  listRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  dotRed: { backgroundColor: "#f87171" },
  dotAmber: { backgroundColor: "#fbbf24" },
  dotGreen: { backgroundColor: "#34d399" },
  listText: { color: "#e2e8f0", fontSize: 13 },
});
