import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import api from "../services/api";

const MENU_ITEMS = [
  { label: "Dashboard", icon: "grid", screen: "Dashboard" },
  { label: "Inventário", icon: "archive", screen: "Inventario" },
  { label: "Relatórios e Performance", icon: "bar-chart-2", screen: "Relatorios" },
  { label: "Histórico de Movimentações", icon: "clock", screen: "Historico" },
  { label: "Scanner de Código", icon: "maximize", screen: "CameraScanner" },
  { label: "Detalhes do Produto", icon: "info", screen: "DetalhesProduto" },
  { label: "Lista de Produtos", icon: "list", screen: "ListaProdutos" },
  { label: "Meus Fornecedores", icon: "truck", screen: "Fornecedores" },
  { label: "Configurações", icon: "settings", screen: "Configuracoes" },
];

export default function SidebarModal({ visible, onClose, navigation, currentScreen = "" }) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const response = await api.me();
        const dados = response?.data?.user || response?.data || null;
        if (dados) setUsuario(dados);
      } catch (err) {
        // Fallback gracioso
      }
    }
    if (visible) {
      carregarUsuario();
    }
  }, [visible]);

  const nomeUsuario = usuario?.nome || "Alex";
  const cargoUsuario = usuario?.perfil || "Gerente de Estoque";

  const handleNavigate = (screen) => {
    onClose();
    if (navigation && screen) {
      navigation.navigate(screen);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.drawerContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logoTitle}>KeepStock</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Feather name="x" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          </View>

          {/* Perfil */}
          <View style={styles.profileBox}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
              }}
              style={styles.avatarImage}
            />
            <View style={styles.profileTextWrap}>
              <Text style={styles.userName}>Olá, {nomeUsuario}!</Text>
              <Text style={styles.userRole}>{cargoUsuario}</Text>
            </View>
          </View>

          {/* Itens do Menu */}
          <ScrollView
            style={styles.menuScroll}
            showsVerticalScrollIndicator={false}
          >
            {MENU_ITEMS.map((item) => {
              const isActive =
                item.screen === currentScreen ||
                (item.label === "Configurações" && !currentScreen);

              return (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    isActive && styles.menuItemActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleNavigate(item.screen)}
                >
                  <Feather
                    name={item.icon}
                    size={18}
                    color={isActive ? "#ffffff" : "#cbd5e1"}
                  />
                  <Text
                    style={[
                      styles.menuLabel,
                      isActive && styles.menuLabelActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  drawerContainer: {
    width: "80%",
    maxWidth: 320,
    backgroundColor: "#0d1424",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderRightWidth: 1,
    borderRightColor: "#1e293b",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 26,
    paddingHorizontal: 4,
  },
  logoTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  closeBtn: {
    padding: 6,
  },
  profileBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#4f46e5",
    marginRight: 14,
  },
  profileTextWrap: {
    flex: 1,
  },
  userName: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  userRole: {
    color: "#818cf8",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  menuScroll: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemActive: {
    backgroundColor: "#6366f1",
  },
  menuLabel: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 14,
  },
  menuLabelActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
