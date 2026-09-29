import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";

const notificacoes = [
  {
    id: 1,
    titulo: "Low Stock: Água Mineral",
    mensagem: "O estoque do item Água Mineral 500ml está em nível crítico. Restam apenas 12 unidades.",
    categoria: "Atenção",
    data: "Hoje",
    cor: "#f96d6d",
    icone: "alert-triangle",
    botao: "Ver item",
  },
  {
    id: 2,
    titulo: "New Movement: Entrada de 445",
    mensagem: "João Silva adicionou 500 unidades de Papel Sulfite A4 ao estoque. Total: #8420.",
    categoria: "Sucesso",
    data: "Ontem",
    cor: "#63d2ff",
    icone: "package",
    botao: "Detalhes",
  },
  {
    id: 3,
    titulo: "System Update",
    mensagem: "O KeepStock foi atualizado para a versão 4.2. Novos relatórios e ajustes de performance.",
    categoria: "Sistema",
    data: "Ontem",
    cor: "#b7a8ff",
    icone: "bell",
    botao: "Abrir",
  },
  {
    id: 4,
    titulo: "New Movement: Saida",
    mensagem: "Maria Santos removeu 50 unidades de Tecido Mecânico para o pedido #1042.",
    categoria: "Estoque",
    data: "Ontem",
    cor: "#ffd76a",
    icone: "arrow-up-right",
    botao: "Ver ajuste",
  },
];

export default function NotificacoesScreen({ navigation }) {
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  const palette = isDarkTheme
    ? {
        background: "#1b1b1d",
        header: "#1b1b1d",
        text: "#e1e3f0",
        muted: "#858b9f",
        card: "#172035",
        border: "#303a55",
        surface: "#20283b",
        action: "#2d436a",
        bottom: "#151b2e",
      }
    : {
        background: "#f4f7fb",
        header: "#ffffff",
        text: "#1d2433",
        muted: "#60708a",
        card: "#ffffff",
        border: "#dfe6f3",
        surface: "#eef3ff",
        action: "#dfe8ff",
        bottom: "#f1f4fb",
      };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.header, { backgroundColor: palette.header }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="menu" size={22} color={palette.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: palette.text }]}>KeepStock</Text>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="bell" size={20} color={palette.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentWrap}>
        <Text style={[styles.title, { color: palette.text }]}>Notificações</Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {notificacoes.map((item) => (
            <View key={item.id} style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <View style={[styles.badge, { backgroundColor: item.cor }]}>
                <Feather name={item.icone} size={18} color="#fff" />
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: palette.text }]}>{item.titulo}</Text>
                  <Text style={[styles.cardDate, { color: palette.muted }]}>{item.data}</Text>
                </View>

                <Text style={[styles.cardMessage, { color: palette.muted }]}>{item.mensagem}</Text>

                <View style={styles.footerRow}>
                  <Text style={[styles.category, { color: palette.muted }]}>{item.categoria}</Text>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: palette.action }]}>
                    <Text style={[styles.actionText, { color: isDarkTheme ? "#edf2ff" : "#1d2433" }]}>{item.botao}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.bottomNav, { backgroundColor: palette.bottom, borderTopColor: palette.border }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Feather name="home" size={18} color={palette.muted} />
          <Text style={[styles.navText, { color: palette.muted }]}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("CameraScanner")}>
          <Feather name="camera" size={18} color={palette.muted} />
          <Text style={[styles.navText, { color: palette.muted }]}>Scanner</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Perfil")}>
          <Feather name="user" size={18} color={palette.muted} />
          <Text style={[styles.navText, { color: palette.muted }]}>Perfil</Text>
        </TouchableOpacity>
      </View>
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
  contentWrap: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  content: {
    paddingBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    marginRight: 8,
  },
  cardDate: {
    fontSize: 11,
  },
  cardMessage: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  category: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  actionButton: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 10,
    paddingBottom: 22,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },
  navText: {
    fontSize: 11,
    marginTop: 4,
  },
});
