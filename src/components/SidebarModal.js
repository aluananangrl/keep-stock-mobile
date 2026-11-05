import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

// ============================================================
// MENU PRINCIPAL
// ============================================================

const MENU_PRINCIPAL = [
  {
    label: "Dashboard",
    icon: "grid",
    screen: "Dashboard",
  },
  {
    label: "Inventário",
    icon: "archive",
    screen: "Inventario",
  },
  {
    label: "Lista de Produtos",
    icon: "list",
    screen: "ListaProdutos",
  },
  {
    label: "Categorias",
    icon: "tag",
    screen: "Categorias",
  },
  {
    label: "Meus Fornecedores",
    icon: "truck",
    screen: "Fornecedores",
  },
  {
    label: "Relatórios",
    icon: "bar-chart-2",
    screen: "Relatorios",
  },
  {
    label: "Movimentações",
    icon: "clock",
    screen: "Historico",
  },
  {
    label: "Scanner de Código",
    icon: "maximize",
    screen: "CameraScanner",
  },
];

// ============================================================
// MENU SISTEMA
// ============================================================

const MENU_SISTEMA = [
  {
    label: "Configurações",
    icon: "settings",
    screen: "Configuracoes",
  },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function SidebarModal({
  visible,
  onClose,
  navigation,
  currentScreen = "",
}) {
  const { theme } = useTheme();

  const isDarkTheme = theme === "dark";

  // ==========================================================
  // PALETA DE CORES
  // ==========================================================

  const palette = isDarkTheme
    ? {
        background: "#0B1428",
        card: "#182541",
        border: "#293957",
        text: "#F4F5FF",
        muted: "#A4B1CD",
        section: "#8997B5",
        accent: "#AAA8FF",
        selected: "#292755",
        selectedText: "#DCD5FF",
        avatar: "#6554CF",
      }
    : {
        background: "#F7F9FF",
        card: "#E9EEFA",
        border: "#DCE3F0",
        text: "#20273C",
        muted: "#64748B",
        section: "#77849C",
        accent: "#6254E8",
        selected: "#E6E1FF",
        selectedText: "#5945C8",
        avatar: "#7664E9",
      };

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [usuario, setUsuario] = useState(null);
  const [saindo, setSaindo] = useState(false);

  // ==========================================================
  // CARREGAR DADOS DO USUÁRIO
  // ==========================================================

  useEffect(() => {
    let ativo = true;

    async function carregarUsuario() {
      try {
        const response = await api.me();

        const dados =
          response?.data?.user ??
          response?.data?.usuario ??
          response?.data?.data?.user ??
          response?.data;

        if (ativo && dados) {
          setUsuario(dados);
        }
      } catch (error) {
        console.log("Erro ao carregar usuário do menu:", error?.message);
      }
    }

    if (visible) {
      carregarUsuario();
    }

    return () => {
      ativo = false;
    };
  }, [visible]);

  // ==========================================================
  // INFORMAÇÕES DO PERFIL
  // ==========================================================

  const nomeUsuario = String(usuario?.nome || usuario?.name || "Usuário");

  const cargoUsuario = String(
    usuario?.perfil || usuario?.role || usuario?.cargo || "Operador",
  )
    .replace(/_/g, " ")
    .toUpperCase();

  const primeiroNome = nomeUsuario.trim().split(/\s+/)[0] || "Usuário";

  const iniciais = nomeUsuario
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();

  // ==========================================================
  // NAVEGAÇÃO
  // ==========================================================

  function handleNavigate(screen) {
    if (saindo || !navigation || !screen) {
      return;
    }

    onClose?.();

    if (screen !== currentScreen) {
      navigation.navigate(screen);
    }
  }

  // ==========================================================
  // ACESSAR PERFIL DO USUÁRIO
  // ==========================================================

  function handleAcessarPerfil() {
    handleNavigate("Perfil");
  }

  // ==========================================================
  // EXECUTAR LOGOUT
  // ==========================================================

  async function executarLogout() {
    if (saindo) return;

    setSaindo(true);

    try {
      // Remove primeiro o token de autenticação.
      await SecureStore.deleteItemAsync("token");

      // Remove os dados locais do usuário.
      await Promise.all([
        SecureStore.deleteItemAsync("user"),
        SecureStore.deleteItemAsync("nome"),
        SecureStore.deleteItemAsync("email"),
      ]);

      setUsuario(null);

      // Reinicia a navegação na tela de Login.
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });

      // Fecha o menu lateral.
      onClose?.();
    } catch (error) {
      console.log("Erro ao sair da conta:", error);

      Alert.alert(
        "Erro ao sair",
        "Não foi possível encerrar sua sessão. Tente novamente.",
      );
    } finally {
      setSaindo(false);
    }
  }

  // ==========================================================
  // CONFIRMAR LOGOUT
  // ==========================================================

  function handleLogout() {
    if (saindo) return;

    Alert.alert(
      "Sair da conta",
      "Deseja realmente encerrar sua sessão no KeepStock?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: executarLogout,
        },
      ],
    );
  }

  // ==========================================================
  // RENDERIZAR ITENS DO MENU
  // ==========================================================

  function renderMenuItem(item) {
    const isActive = item.screen === currentScreen;

    return (
      <TouchableOpacity
        key={item.screen}
        style={[
          styles.menuItem,
          isActive && {
            backgroundColor: palette.selected,
          },
        ]}
        onPress={() => handleNavigate(item.screen)}
        activeOpacity={0.75}
        disabled={saindo}
        accessibilityRole="button"
        accessibilityLabel={item.label}
      >
        {/* BARRA DO ITEM SELECIONADO */}

        {isActive && (
          <View
            style={[
              styles.activeIndicator,
              { backgroundColor: palette.accent },
            ]}
          />
        )}

        {/* ÍCONE */}

        <View style={styles.menuIcon}>
          <Feather
            name={item.icon}
            size={20}
            color={isActive ? palette.accent : palette.muted}
          />
        </View>

        {/* NOME DA OPÇÃO */}

        <Text
          style={[
            styles.menuLabel,
            {
              color: isActive ? palette.selectedText : palette.text,
              fontWeight: isActive ? "700" : "500",
            },
          ]}
          numberOfLines={2}
        >
          {item.label}
        </Text>

        {/* SETA DA PÁGINA ATIVA */}

        {isActive && (
          <Feather name="chevron-right" size={17} color={palette.accent} />
        )}
      </TouchableOpacity>
    );
  }

  // ==========================================================
  // INTERFACE DO MENU LATERAL
  // ==========================================================

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!saindo) {
          onClose?.();
        }
      }}
    >
      <View style={styles.modalOverlay}>
        {/* ================================================== */}
        {/* FUNDO ESCURO ATRÁS DO MENU */}
        {/* ================================================== */}

        <TouchableWithoutFeedback
          onPress={() => {
            if (!saindo) {
              onClose?.();
            }
          }}
        >
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* ================================================== */}
        {/* CONTAINER DO MENU LATERAL */}
        {/* ================================================== */}

        <View
          style={[
            styles.drawerContainer,
            {
              backgroundColor: palette.background,
              borderRightColor: palette.border,
            },
          ]}
        >
          {/* ================================================== */}
          {/* CABEÇALHO */}
          {/* ================================================== */}

          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View
                style={[
                  styles.logoIcon,
                  {
                    backgroundColor: palette.selected,
                  },
                ]}
              >
                <Feather name="layers" size={22} color={palette.accent} />
              </View>

              <Text style={[styles.logoTitle, { color: palette.text }]}>
                KeepStock
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.closeBtn,
                {
                  backgroundColor: palette.card,
                },
              ]}
              onPress={onClose}
              disabled={saindo}
              accessibilityLabel="Fechar menu"
              accessibilityRole="button"
            >
              <Feather name="x" size={20} color={palette.muted} />
            </TouchableOpacity>
          </View>

          {/* ================================================== */}
          {/* PERFIL DO USUÁRIO - AGORA CLICÁVEL */}
          {/* ================================================== */}

          <TouchableOpacity
            style={[
              styles.profileBox,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
            ]}
            onPress={handleAcessarPerfil}
            activeOpacity={0.75}
            disabled={saindo}
            accessibilityRole="button"
            accessibilityLabel="Acessar meu perfil"
          >
            {/* AVATAR COM INICIAIS */}

            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: palette.avatar,
                },
              ]}
            >
              <Text style={styles.avatarText}>{iniciais || "U"}</Text>
            </View>

            {/* NOME E CARGO */}

            <View style={styles.profileTextWrap}>
              <Text
                style={[styles.userName, { color: palette.text }]}
                numberOfLines={1}
              >
                Olá, {primeiroNome}!
              </Text>

              <Text
                style={[styles.userRole, { color: palette.accent }]}
                numberOfLines={1}
              >
                {cargoUsuario}
              </Text>
            </View>

            {/* SETA PARA ACESSAR PERFIL */}

            <Feather name="chevron-right" size={20} color={palette.accent} />
          </TouchableOpacity>

          {/* ================================================== */}
          {/* LISTA DE OPÇÕES */}
          {/* ================================================== */}

          <ScrollView
            style={styles.menuScroll}
            contentContainerStyle={styles.menuContent}
            showsVerticalScrollIndicator={false}
          >
            {/* MENU PRINCIPAL */}

            <Text style={[styles.sectionTitle, { color: palette.section }]}>
              PRINCIPAL
            </Text>

            {MENU_PRINCIPAL.map(renderMenuItem)}

            {/* DIVISÓRIA */}

            <View
              style={[
                styles.divider,
                {
                  backgroundColor: palette.border,
                },
              ]}
            />

            {/* MENU SISTEMA */}

            <Text style={[styles.sectionTitle, { color: palette.section }]}>
              SISTEMA
            </Text>

            {/* CONFIGURAÇÕES */}

            {MENU_SISTEMA.map(renderMenuItem)}

            {/* ================================================== */}
            {/* SAIR DA CONTA - ABAIXO DE CONFIGURAÇÕES */}
            {/* ================================================== */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogout}
              disabled={saindo}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Sair da conta"
            >
              <View style={styles.menuIcon}>
                {saindo ? (
                  <ActivityIndicator size="small" color="#FB8C9C" />
                ) : (
                  <Feather name="log-out" size={20} color="#FB8C9C" />
                )}
              </View>

              <Text style={styles.logoutMenuText}>
                {saindo ? "Encerrando sessão..." : "Sair da conta"}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* ================================================== */}
          {/* RODAPÉ */}
          {/* ================================================== */}

          <View
            style={[
              styles.footer,
              {
                borderTopColor: palette.border,
              },
            ]}
          >
            <Text style={[styles.footerText, { color: palette.section }]}>
              KeepStock • Gestão inteligente
            </Text>

            <Text style={[styles.versionText, { color: palette.section }]}>
              © 2026 keepStock Tech
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================
// ESTILOS COMPLETOS
// ============================================================

const styles = StyleSheet.create({
  // ==========================================================
  // FUNDO DO MODAL
  // ==========================================================

  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  // ==========================================================
  // CONTAINER LATERAL
  // ==========================================================

  drawerContainer: {
    width: "85%",
    maxWidth: 340,
    flex: 1,

    backgroundColor: "#0B1428",

    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 28 : 58,

    paddingHorizontal: 17,
    paddingBottom: 16,

    borderRightWidth: 1,

    shadowColor: "#000",
    shadowOffset: {
      width: 4,
      height: 0,
    },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
  },

  // ==========================================================
  // CABEÇALHO
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 26,
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  logoIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  logoTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  closeBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },

  // ==========================================================
  // CARD DO PERFIL
  // ==========================================================

  profileBox: {
    flexDirection: "row",
    alignItems: "center",

    borderRadius: 17,
    borderWidth: 1,

    padding: 13,
    marginBottom: 25,
  },

  avatar: {
    width: 47,
    height: 47,
    borderRadius: 24,

    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  profileTextWrap: {
    flex: 1,
  },

  userName: {
    fontSize: 15,
    fontWeight: "700",
  },

  userRole: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 5,
  },

  // ==========================================================
  // MENU
  // ==========================================================

  menuScroll: {
    flex: 1,
  },

  menuContent: {
    paddingBottom: 16,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
    marginHorizontal: 13,
    marginBottom: 13,
  },

  menuItem: {
    minHeight: 51,

    flexDirection: "row",
    alignItems: "center",

    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 10,

    marginBottom: 6,

    position: "relative",
    overflow: "hidden",
  },

  activeIndicator: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 3,
  },

  menuIcon: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  menuLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },

  // ==========================================================
  // SAIR DA CONTA
  // ==========================================================

  logoutMenuText: {
    flex: 1,
    color: "#FB8C9C",
    fontSize: 13,
    fontWeight: "700",
  },

  // ==========================================================
  // DIVISÓRIA
  // ==========================================================

  divider: {
    height: 1,
    marginVertical: 19,
    marginHorizontal: 6,
  },

  // ==========================================================
  // RODAPÉ
  // ==========================================================

  footer: {
    borderTopWidth: 1,
    paddingTop: 16,
    alignItems: "center",
  },

  footerText: {
    fontSize: 10,
    fontWeight: "600",
  },

  versionText: {
    fontSize: 9,
    marginTop: 5,
  },
});
