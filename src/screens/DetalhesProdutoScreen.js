import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

export default function DetalhesProdutoScreen({ navigation }) {
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";
  const palette = isDarkTheme
    ? {
        background: "#1b1b1d",
        text: "#e1e3f0",
        muted: "#858b9f",
        accent: "#aaa8ff",
      }
    : {
        background: "#f4f7fb",
        text: "#1d2433",
        muted: "#60708a",
        accent: "#4b5de0",
      };

  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const response = await api.me();
        const dadosUsuario = response?.data?.user || response?.data || null;
        setUsuario(dadosUsuario);
      } catch (error) {
        console.log("Erro ao carregar usuário do menu:", error?.response?.data || error?.message);
      }
    }

    carregarUsuario();
  }, []);

  const nomeUsuario = usuario?.nome || "Usuário";
  const cargoUsuario = usuario?.perfil || "Gerente de Estoque";
  const iniciais = nomeUsuario
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() || "")
    .join("") || "US";

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: palette.text }]}>KeepStock</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="x" size={20} color={palette.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileBox}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{iniciais}</Text>
          </View>
        </View>

        <View>
          <Text style={[styles.greeting, { color: palette.text }]}>Olá, {nomeUsuario}!</Text>
          <Text style={[styles.role, { color: palette.muted }]}>{cargoUsuario}</Text>
        </View>
      </View>

      <View style={styles.menuList}>
        {[
          { label: "Dashboard", icon: "grid", screen: "Dashboard" },
          { label: "Inventário", icon: "package", screen: "Inventario" },
          { label: "Relatórios e Performance", icon: "bar-chart-2", screen: "Relatorios" },
          { label: "Histórico de Movimentações", icon: "clock", screen: "Historico" },
          { label: "Scanner de Código", icon: "camera", screen: "CameraScanner" },
          { label: "Detalhes do Produto", icon: "info", screen: "DetalhesProduto" },
          { label: "Lista de Produtos", icon: "list", screen: "ListaProdutos" },
          { label: "Meus Fornecedores", icon: "truck", screen: "Fornecedores" },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Feather name={item.icon} size={18} color={palette.text} />
            <Text style={[styles.menuText, { color: palette.text }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemActive]}
          onPress={() => navigation.navigate("Configuracoes")}
          activeOpacity={0.85}
        >
          <Feather name="settings" size={18} color="#ffffff" />
          <Text style={[styles.menuText, styles.menuTextActive]}>Configurações</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ==========================================================
  // CONTAINER / HEADER
  // ==========================================================

  container: {
    flex: 1,
    backgroundColor: "#1b1b1d",
    paddingHorizontal: 20,
    paddingTop: 32,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 22,
    paddingBottom: 18,
  },

  headerTitle: {
    color: "#e1e3f0",
    fontSize: 16,
    fontWeight: "600",
  },

  // ==========================================================
  // PERFIL / USUÁRIO
  // ==========================================================

  profileBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 18,
  },

  avatarWrap: {
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#dfe8ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#8aa9ff",
  },

  avatarText: {
    color: "#0f1b2d",
    fontSize: 18,
    fontWeight: "700",
  },

  greeting: {
    color: "#f2f3fa",
    fontSize: 22,
    fontWeight: "700",
  },

  role: {
    color: "#858b9f",
    fontSize: 13,
    marginTop: 2,
  },

  // ==========================================================
  // MENU
  // ==========================================================

  menuList: {
    marginTop: 10,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
  },

  menuText: {
    color: "#e1e3f0",
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
  },

  menuItemActive: {
    backgroundColor: "#aaa8ff",
  },

  menuTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
