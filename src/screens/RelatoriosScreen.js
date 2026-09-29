import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function RelatoriosScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#e1e3f0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatórios</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
          <Feather name="user" size={20} color="#e1e3f0" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {[
          { title: "Vendas do mês", value: "R$ 18.450" },
          { title: "Saídas", value: "1.240 un." },
          { title: "Entradas", value: "1.060 un." },
        ].map((item) => (
          <View key={item.title} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
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
  card: { backgroundColor: "#1a2437", borderRadius: 16, padding: 18, marginBottom: 16 },
  cardTitle: { color: "#8ea0c8", fontSize: 12 },
  cardValue: { color: "#f8fafc", fontSize: 28, fontWeight: "700", marginTop: 8 },
});
