import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

export default function ConfiguracoesScreen({ navigation }) {
  const [seguranca, setSeguranca] = useState(true);
  const [notificacoes, setNotificacoes] = useState(true);
  const [alertas, setAlertas] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const { theme, setTheme } = useTheme();

  async function carregarPerfil() {
    try {
      const response = await api.me();
      const dadosUsuario = response?.data?.user || response?.data || null;
      setUsuario(dadosUsuario);
    } catch (error) {
      console.log("Erro ao carregar dados do perfil:", error?.response?.data || error?.message);
    } finally {
      setCarregandoPerfil(false);
    }
  }

  useEffect(() => {
    carregarPerfil();
  }, []);

  function acessarPerfil() {
    navigation.navigate("Perfil");
  }

  const nomeUsuario = usuario?.nome || "Usuário";
  const emailUsuario = usuario?.email || "email@exemplo.com";
  const cargoUsuario = usuario?.perfil || "Gerente de Estoque";
  const iniciais = nomeUsuario
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() || "")
    .join("") || "US";

  const isDarkTheme = theme === "dark";

  const palette = isDarkTheme
    ? {
        background: "#1b1b1d",
        headerBackground: "#1b1b1d",
        text: "#e1e3f0",
        muted: "#858b9f",
        card: "#172035",
        cardSoft: "#20283b",
        border: "#303a55",
        surface: "#20283b",
        button: "#172035",
        buttonText: "#edf2ff",
        active: "#303a55",
      }
    : {
        background: "#f4f6fb",
        headerBackground: "#ffffff",
        text: "#1d2433",
        muted: "#60708a",
        card: "#ffffff",
        cardSoft: "#eef3ff",
        border: "#dfe6f3",
        surface: "#edf3ff",
        button: "#edf3ff",
        buttonText: "#1d2433",
        active: "#dfe8ff",
      };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.header, { backgroundColor: palette.headerBackground }]}>
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
        <Text style={[styles.greeting, { color: palette.text }]}>Configurações</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>Gerencie suas preferências e segurança da conta.</Text>

        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: palette.card, borderColor: palette.border }]}
          onPress={acessarPerfil}
          activeOpacity={0.85}
        >
          <View style={[styles.avatar, { borderColor: isDarkTheme ? "#59d4ff" : "#7a8cff" }]}>
            <Text style={[styles.avatarText, { color: palette.buttonText }]}>{iniciais}</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: palette.text }]}>
              {carregandoPerfil ? "Carregando..." : nomeUsuario}
            </Text>
            <Text style={[styles.profileRole, { color: palette.muted }]}>{cargoUsuario}</Text>
            <Text style={[styles.profileEmail, { color: palette.muted }]}>{emailUsuario}</Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.settingCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.settingHeader}>
            <View style={styles.settingTitleWrap}>
              <View style={[styles.settingIcon, { backgroundColor: palette.cardSoft }]}>
                <Feather name="shield" size={16} color="#8fe5c4" />
              </View>
              <Text style={[styles.settingTitle, { color: palette.text }]}>Segurança</Text>
            </View>
          </View>

          <View style={[styles.listRow, { borderTopColor: palette.border }]}>
            <Text style={[styles.listLabel, { color: palette.text }]}>Alterar Senha</Text>
            <Feather name="chevron-right" size={18} color={palette.text} />
          </View>

          <View style={[styles.listRow, { borderTopColor: palette.border }]}>
            <Text style={[styles.listLabel, { color: palette.text }]}>Última alteração há 30 dias</Text>
          </View>

          <View style={[styles.listRow, { borderTopColor: palette.border }]}>
            <Text style={[styles.listLabel, { color: palette.text }]}>Autenticação 2FA</Text>
            <Switch
              value={seguranca}
              onValueChange={setSeguranca}
              trackColor={{ false: "#495670", true: "#67d7ff" }}
              thumbColor={seguranca ? "#0f172a" : "#d9e6ff"}
            />
          </View>
        </View>

        <View style={[styles.settingCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.settingHeader}>
            <View style={styles.settingTitleWrap}>
              <View style={[styles.settingIcon, { backgroundColor: palette.cardSoft }]}>
                <Feather name="bell" size={16} color="#ffd76a" />
              </View>
              <Text style={[styles.settingTitle, { color: palette.text }]}>Notificações</Text>
            </View>
          </View>

          <View style={[styles.listRow, { borderTopColor: palette.border }]}>
            <Text style={[styles.listLabel, { color: palette.text }]}>Alertas de Estoque Baixo</Text>
            <Switch
              value={notificacoes}
              onValueChange={setNotificacoes}
              trackColor={{ false: "#495670", true: "#67d7ff" }}
              thumbColor={notificacoes ? "#0f172a" : "#d9e6ff"}
            />
          </View>

          <View style={[styles.listRow, { borderTopColor: palette.border }]}>
            <Text style={[styles.listLabel, { color: palette.text }]}>Relatórios Semanais</Text>
            <Switch
              value={alertas}
              onValueChange={setAlertas}
              trackColor={{ false: "#495670", true: "#67d7ff" }}
              thumbColor={alertas ? "#0f172a" : "#d9e6ff"}
            />
          </View>
        </View>

        <View style={[styles.settingCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.settingHeader}>
            <View style={styles.settingTitleWrap}>
              <View style={[styles.settingIcon, { backgroundColor: palette.cardSoft }]}>
                <Feather name="sliders" size={16} color="#d9b3ff" />
              </View>
              <Text style={[styles.settingTitle, { color: palette.text }]}>Aparência</Text>
            </View>
          </View>

          <View style={[styles.themeSelector, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <TouchableOpacity
              style={[styles.themeOption, theme === "dark" && [styles.themeOptionActive, { backgroundColor: palette.active }]]}
              onPress={() => setTheme("dark")}
            >
              <Feather name="moon" size={16} color={theme === "dark" ? palette.text : "#8ea0c8"} />
              <Text style={[styles.themeText, { color: theme === "dark" ? palette.text : "#8ea0c8" }]}>Dark</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeOption, theme === "light" && [styles.themeOptionActive, { backgroundColor: palette.active }]]}
              onPress={() => setTheme("light")}
            >
              <Feather name="sun" size={16} color={theme === "light" ? palette.text : "#8ea0c8"} />
              <Text style={[styles.themeText, { color: theme === "light" ? palette.text : "#8ea0c8" }]}>Light</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.settingCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.settingHeader}>
            <View style={styles.settingTitleWrap}>
              <View style={[styles.settingIcon, { backgroundColor: palette.cardSoft }]}>
                <Feather name="globe" size={16} color="#95d9ff" />
              </View>
              <Text style={[styles.settingTitle, { color: palette.text }]}>Idioma</Text>
            </View>
          </View>

          <View style={[styles.listRow, { borderTopColor: palette.border }]}>
            <Text style={[styles.listLabel, { color: palette.text }]}>Português (Brasil)</Text>
            <Feather name="chevron-down" size={18} color={palette.text} />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: palette.button, borderColor: palette.border }]}
          onPress={() => navigation.navigate("Login")}
        >
          <Feather name="log-out" size={16} color={isDarkTheme ? "#fff" : "#1d2433"} />
          <Text style={[styles.logoutText, { color: palette.buttonText }]}>Sign Out</Text>
        </TouchableOpacity>
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
    paddingBottom: 20,
  },

  greeting: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    marginBottom: 20,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1a4658",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    fontWeight: "700",
    fontSize: 18,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 18,
    fontWeight: "700",
  },

  profileRole: {
    fontSize: 12,
    marginTop: 2,
  },

  profileEmail: {
    fontSize: 12,
    marginTop: 3,
  },

  settingCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },

  settingHeader: {
    marginBottom: 10,
  },

  settingTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
  },

  settingIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  settingTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
  },

  listLabel: {
    fontSize: 13,
  },

  themeSelector: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
  },

  themeOption: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },

  themeOptionActive: {
    backgroundColor: "#303a55",
  },

  themeText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: "600",
  },

  logoutButton: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});
