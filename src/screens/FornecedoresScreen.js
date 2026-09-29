import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";

const fornecedores = [
  {
    nome: "Alimentos Gênesis",
    categoria: "Food",
    tipo: "ACTIVE",
    prazo: "Há 2 dias",
    prazoValor: "45",
    cor: "#7dd3fc",
  },
  {
    nome: "LiquidFlow Distribuidora",
    categoria: "Beverage",
    tipo: "ACTIVE",
    prazo: "Hoje",
    prazoValor: "120",
    cor: "#c4b5fd",
  },
  {
    nome: "Sanitize Pro",
    categoria: "Cleaning",
    tipo: "INACTIVE",
    prazo: "Há 3 meses",
    prazoValor: "12",
    cor: "#f9a8d4",
  },
  {
    nome: "Fresh Farm Co.",
    categoria: "Food",
    tipo: "ACTIVE",
    prazo: "Há 5 dias",
    prazoValor: "68",
    cor: "#86efac",
  },
];

export default function FornecedoresScreen({ navigation }) {
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  const palette = isDarkTheme
    ? {
        background: "#1b1b1d",
        header: "#1b1b1d",
        text: "#e1e3f0",
        muted: "#858b9f",
        card: "#172035",
        cardSoft: "#20283b",
        border: "#303a55",
        tab: "#151b2e",
        tabText: "#858b9f",
        accent: "#6bffa0",
      }
    : {
        background: "#f5f7fb",
        header: "#ffffff",
        text: "#1d2433",
        muted: "#60708a",
        card: "#ffffff",
        cardSoft: "#edf3ff",
        border: "#dfe6f3",
        tab: "#f1f4fb",
        tabText: "#64748b",
        accent: "#2d6df6",
      };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.header, { backgroundColor: palette.header }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="menu" size={22} color={palette.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: palette.text }]}>KeepStock</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Notificacoes")}>
          <Feather name="bell" size={20} color={palette.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: palette.text }]}>Fornecedores</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>Gerencie e consulte seus parceiros de negócio.</Text>

        <View
          style={[
            styles.searchBox,
            { backgroundColor: palette.cardSoft, borderColor: palette.border },
          ]}
        >
          <Feather name="search" size={16} color={palette.muted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: palette.text }]}
            placeholder="Buscar fornecedor, categoria..."
            placeholderTextColor={palette.muted}
          />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterTag,
              { backgroundColor: isDarkTheme ? "#2a4268" : "#eaf0ff" },
            ]}
          >
            <Text style={[styles.filterText, { color: isDarkTheme ? "#edf2ff" : "#1d2433" }]}>Todos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTag,
              { backgroundColor: palette.cardSoft, borderColor: palette.border, borderWidth: 1 },
            ]}
          >
            <Text style={[styles.filterText, { color: palette.text }]}>Alimentos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTag,
              { backgroundColor: palette.cardSoft, borderColor: palette.border, borderWidth: 1 },
            ]}
          >
            <Text style={[styles.filterText, { color: palette.text }]}>Bebidas</Text>
          </TouchableOpacity>
        </View>

        {fornecedores.map((item) => (
          <View
            key={item.nome}
            style={[
              styles.card,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <View style={styles.cardTopRow}>
              <View style={[styles.iconBox, { backgroundColor: item.cor }]}>
                <Text style={styles.iconText}>{item.nome.slice(0, 2).toUpperCase()}</Text>
              </View>

              <View style={styles.cardMeta}>
                <Text style={[styles.category, { color: palette.text }]}>{item.categoria}</Text>
                <Text
                  style={[
                    styles.status,
                    {
                      backgroundColor: item.tipo === "ACTIVE" ? "#2ea673" : "#6b7280",
                    },
                  ]}
                >
                  {item.tipo}
                </Text>
              </View>
            </View>

            <View style={styles.cardInfoRow}>
              <Text style={[styles.label, { color: palette.muted }]}>Último Pedido</Text>
              <Text style={[styles.label, { color: palette.muted }]}>Último valor</Text>
            </View>

            <View style={styles.cardInfoRow}>
              <Text style={[styles.value, { color: palette.text }]}>{item.prazo}</Text>
              <Text style={[styles.value, { color: palette.text }]}>{item.prazoValor}</Text>
            </View>

            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: isDarkTheme ? "#dfe7ff" : "#dfe8ff" },
                ]}
              >
                <Text style={[styles.primaryText, { color: "#1d2a3d" }]}>Contato</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.infoButton,
                  { backgroundColor: palette.cardSoft, borderColor: palette.border, borderWidth: 1 },
                ]}
              >
                <Feather name="info" size={16} color={palette.text} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.addSection}>
          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor: isDarkTheme ? "#111b2e" : "#eaf0ff",
                borderColor: isDarkTheme ? "#59d4ff" : "#5a78ff",
              },
            ]}
          >
            <Feather name="plus" size={26} color={isDarkTheme ? "#0f172a" : "#1d2433"} />
          </TouchableOpacity>
          <Text style={[styles.addText, { color: palette.text }]}>Adicionar Novo</Text>
          <Text style={[styles.addSubtitle, { color: palette.muted }]}>Cadastre um novo fornecedor no sistema</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
  },
  filterTag: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  filterText: {
    fontSize: 11,
    fontWeight: "600",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    color: "#0b1220",
    fontSize: 12,
    fontWeight: "800",
  },
  cardMeta: {
    flex: 1,
    marginLeft: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  category: {
    fontSize: 13,
    fontWeight: "700",
  },
  status: {
    color: "#edf2ff",
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
  },
  cardInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  label: {
    fontSize: 11,
  },
  value: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  primaryButton: {
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  primaryText: {
    fontWeight: "700",
    fontSize: 12,
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addSection: {
    alignItems: "center",
    marginTop: 10,
  },
  addButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  addText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
  },
  addSubtitle: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 4,
  },
});
