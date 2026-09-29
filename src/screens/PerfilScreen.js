import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

export default function PerfilScreen({ navigation }) {
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";
  const palette = isDarkTheme
    ? {
        background: "#101827",
        header: "#101827",
        text: "#edf2ff",
        muted: "#8ea0c8",
        card: "#1a2437",
        cardSoft: "#1f2950",
        border: "#2b3954",
        input: "#1a2437",
        accent: "#7c83ff",
        action: "#dbeafe",
      }
    : {
        background: "#f4f7fb",
        header: "#ffffff",
        text: "#1d2433",
        muted: "#60708a",
        card: "#ffffff",
        cardSoft: "#edf3ff",
        border: "#dfe6f3",
        input: "#ffffff",
        accent: "#4b5de0",
        action: "#2d436a",
      };

  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);

  async function carregarPerfil() {
    try {
      const response = await api.me();
      const dados = response?.data?.user || response?.data || null;
      setPerfil(dados);
    } catch (error) {
      console.log("Erro ao carregar perfil:", error?.response?.data || error?.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPerfil();
  }, []);

  const nomeCompleto = perfil?.nome || "Usuário";
  const email = perfil?.email || "email@exemplo.com";
  const cargo = perfil?.perfil || "Funcionário";
  const iniciais = nomeCompleto
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() || "")
    .join("") || "US";

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.header, { backgroundColor: palette.header }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={palette.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: palette.text }]}>Perfil</Text>

        <TouchableOpacity>
          <Feather name="edit-2" size={18} color={palette.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarWrap}>
          <View style={[styles.avatarCircle, { backgroundColor: palette.cardSoft, borderColor: palette.accent }]}>
            <Text style={[styles.avatarText, { color: palette.text }]}>{iniciais}</Text>
          </View>
        </View>

        <Text style={[styles.userName, { color: palette.text }]}>{carregando ? "Carregando..." : nomeCompleto}</Text>
        <Text style={[styles.userRole, { color: palette.muted }]}>{cargo}</Text>

        <View style={[styles.infoCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={palette.accent} />
            <Text style={[styles.infoText, { color: palette.text }]}>{email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={palette.accent} />
            <Text style={[styles.infoText, { color: palette.text }]}>{perfil?.telefone || "+55 (11) 00000-0000"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={palette.accent} />
            <Text style={[styles.infoText, { color: palette.text }]}>{perfil?.unidade || "Unidade Central"}</Text>
          </View>
        </View>

        <View style={[styles.groupCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.groupTitle, { color: palette.text }]}>Informações pessoais</Text>

          <View style={[styles.sectionRow, { borderBottomColor: palette.border }]}>
            <Text style={[styles.sectionLabel, { color: palette.muted }]}>Nome completo</Text>
            <Text style={[styles.sectionValue, { color: palette.text }]}>{nomeCompleto}</Text>
          </View>

          <View style={[styles.sectionRow, { borderBottomColor: palette.border }]}>
            <Text style={[styles.sectionLabel, { color: palette.muted }]}>Cargo</Text>
            <Text style={[styles.sectionValue, { color: palette.text }]}>{cargo}</Text>
          </View>

          <View style={[styles.sectionRow, { borderBottomColor: palette.border }]}>
            <Text style={[styles.sectionLabel, { color: palette.muted }]}>Departamento</Text>
            <Text style={[styles.sectionValue, { color: palette.text }]}>{perfil?.departamento || "Logística"}</Text>
          </View>
        </View>

        <View style={[styles.groupCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.groupTitle, { color: palette.text }]}>Segurança e acesso</Text>

          <TouchableOpacity style={styles.linkRow}>
            <Text style={[styles.linkText, { color: palette.text }]}>Alterar senha</Text>
            <Feather name="chevron-right" size={18} color={palette.action} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow}>
            <Text style={[styles.linkText, { color: palette.text }]}>Dispositivos conectados</Text>
            <Feather name="chevron-right" size={18} color={palette.action} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: palette.card }]} onPress={() => navigation.navigate("Login")}>
          <Text style={[styles.logoutText, { color: palette.text }]}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101827",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
  },
  headerTitle: {
    color: "#edf2ff",
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  avatarWrap: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1f2950",
    borderWidth: 2,
    borderColor: "#7c83ff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#edf2ff",
    fontSize: 28,
    fontWeight: "700",
  },
  userName: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  userRole: {
    color: "#8ea0c8",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
  },
  infoCard: {
    backgroundColor: "#1a2437",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  infoText: {
    color: "#e2e8f0",
    fontSize: 13,
    marginLeft: 12,
  },
  groupCard: {
    backgroundColor: "#1a2437",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  groupTitle: {
    color: "#edf2ff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2b3954",
  },
  sectionLabel: {
    color: "#8ea0c8",
    fontSize: 12,
  },
  sectionValue: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "600",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2b3954",
  },
  linkText: {
    color: "#e2e8f0",
    fontSize: 13,
  },
  logoutButton: {
    marginTop: 8,
    backgroundColor: "#413c62",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  logoutText: {
    color: "#f8fafc",
    fontWeight: "700",
  },
});
