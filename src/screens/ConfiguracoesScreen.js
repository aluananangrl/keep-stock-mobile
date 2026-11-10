import { BRAND_COLORS } from "../context/colors";
import ScreenBackground from "../components/ScreenBackground";

import React, { useState } from "react";

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

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function ConfiguracoesScreen({ navigation }) {
  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [seguranca, setSeguranca] = useState(true);
  const [notificacoes, setNotificacoes] = useState(true);
  const [alertas, setAlertas] = useState(false);

  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  // ==========================================================
  // CORES
  // ==========================================================

  const palette = isDarkTheme
    ? {
        background: "#090F20",
        headerBackground: "#090F20",
        text: "#F4F5FF",
        muted: "#9DA9C4",
        card: "#152039",
        cardSoft: "#202C49",
        border: "#304063",
        accent: BRAND_COLORS.highlight,
      }
    : {
        background: "#F5F7FC",
        headerBackground: "#FFFFFF",
        text: "#20273C",
        muted: "#697792",
        card: "#FFFFFF",
        cardSoft: "#ECF0FA",
        border: "#DCE3F0",
        accent: BRAND_COLORS.primary,
      };

  // ==========================================================
  // INTERFACE
  // ==========================================================

  return (
    <ScreenBackground adaptive>
<View
      style={[[
        styles.container,
        { backgroundColor: palette.background },
      ], { backgroundColor: "transparent" }]}
    >
      {/* ====================================================== */}
      {/* CABEÇALHO */}
      {/* ====================================================== */}

      <View
        style={[
          styles.header,
          { backgroundColor: "transparent" },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Voltar"
        >
          <Feather
            name="arrow-left"
            size={22}
            color={palette.text}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            { color: palette.text },
          ]}
        >
          KeepStock
        </Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Notificacoes")
          }
          accessibilityLabel="Notificações"
        >
          <Feather
            name="bell"
            size={20}
            color={palette.text}
          />
        </TouchableOpacity>
      </View>

      {/* ====================================================== */}
      {/* CONTEÚDO */}
      {/* ====================================================== */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.greeting,
            { color: palette.text },
          ]}
        >
          Configurações
        </Text>

        <Text
          style={[
            styles.subtitle,
            { color: palette.muted },
          ]}
        >
          Gerencie suas preferências e segurança da conta.
        </Text>

        {/* ==================================================== */}
        {/* SEGURANÇA */}
        {/* ==================================================== */}

        <View
          style={[
            styles.settingCard,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          <View style={styles.settingHeader}>
            <View style={styles.settingTitleWrap}>
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: palette.cardSoft },
                ]}
              >
                <Feather
                  name="shield"
                  size={17}
                  color={BRAND_COLORS.highlight}
                />
              </View>

              <Text
                style={[
                  styles.settingTitle,
                  { color: palette.text },
                ]}
              >
                Segurança
              </Text>
            </View>
          </View>

          {/* ALTERAR SENHA */}

          <View
            style={[
              styles.listRow,
              { borderTopColor: palette.border },
            ]}
          >
            <Text
              style={[
                styles.listLabel,
                { color: palette.text },
              ]}
            >
              Alterar Senha
            </Text>

            <Feather
              name="chevron-right"
              size={18}
              color={palette.muted}
            />
          </View>

          {/* ÚLTIMA ALTERAÇÃO */}

          <View
            style={[
              styles.listRow,
              { borderTopColor: palette.border },
            ]}
          >
            <Text
              style={[
                styles.listLabel,
                { color: palette.muted },
              ]}
            >
              Última alteração há 30 dias
            </Text>
          </View>

          {/* AUTENTICAÇÃO 2FA */}

          <View
            style={[
              styles.listRow,
              { borderTopColor: palette.border },
            ]}
          >
            <Text
              style={[
                styles.listLabel,
                { color: palette.text },
              ]}
            >
              Autenticação 2FA
            </Text>

            <Switch
              value={seguranca}
              onValueChange={setSeguranca}
              trackColor={{
                false: "#495670",
                true: BRAND_COLORS.primary,
              }}
              thumbColor={
                seguranca ? "#FFFFFF" : "#D9E6FF"
              }
            />
          </View>
        </View>

        {/* ==================================================== */}
        {/* NOTIFICAÇÕES */}
        {/* ==================================================== */}

        <View
          style={[
            styles.settingCard,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          <View style={styles.settingHeader}>
            <View style={styles.settingTitleWrap}>
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: palette.cardSoft },
                ]}
              >
                <Feather
                  name="bell"
                  size={17}
                  color="#FFD76A"
                />
              </View>

              <Text
                style={[
                  styles.settingTitle,
                  { color: palette.text },
                ]}
              >
                Notificações
              </Text>
            </View>
          </View>

          {/* ALERTAS DE ESTOQUE */}

          <View
            style={[
              styles.listRow,
              { borderTopColor: palette.border },
            ]}
          >
            <Text
              style={[
                styles.listLabel,
                { color: palette.text },
              ]}
            >
              Alertas de Estoque Baixo
            </Text>

            <Switch
              value={notificacoes}
              onValueChange={setNotificacoes}
              trackColor={{
                false: "#495670",
                true: BRAND_COLORS.primary,
              }}
              thumbColor={
                notificacoes ? "#FFFFFF" : "#D9E6FF"
              }
            />
          </View>

          {/* RELATÓRIOS SEMANAIS */}

          <View
            style={[
              styles.listRow,
              { borderTopColor: palette.border },
            ]}
          >
            <Text
              style={[
                styles.listLabel,
                { color: palette.text },
              ]}
            >
              Relatórios Semanais
            </Text>

            <Switch
              value={alertas}
              onValueChange={setAlertas}
              trackColor={{
                false: "#495670",
                true: BRAND_COLORS.primary,
              }}
              thumbColor={
                alertas ? "#FFFFFF" : "#D9E6FF"
              }
            />
          </View>
        </View>

        {/* ==================================================== */}
        {/* IDIOMA */}
        {/* ==================================================== */}

        <View
          style={[
            styles.settingCard,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          <View style={styles.settingHeader}>
            <View style={styles.settingTitleWrap}>
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: palette.cardSoft },
                ]}
              >
                <Feather
                  name="globe"
                  size={17}
                  color={BRAND_COLORS.highlight}
                />
              </View>

              <Text
                style={[
                  styles.settingTitle,
                  { color: palette.text },
                ]}
              >
                Idioma
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.listRow,
              { borderTopColor: palette.border },
            ]}
          >
            <Text
              style={[
                styles.listLabel,
                { color: palette.text },
              ]}
            >
              Português (Brasil)
            </Text>

            <Feather
              name="chevron-down"
              size={18}
              color={palette.muted}
            />
          </View>
        </View>
      </ScrollView>
    </View>
    </ScreenBackground>
  );
}

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ==========================================================
  // CABEÇALHO
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 16,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },

  // ==========================================================
  // CONTEÚDO
  // ==========================================================

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },

  greeting: {
    fontSize: 25,
    fontWeight: "800",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 24,
  },

  // ==========================================================
  // CARDS DE CONFIGURAÇÕES
  // ==========================================================

  settingCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
  },

  settingHeader: {
    marginBottom: 12,
  },

  settingTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
  },

  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  settingTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  // ==========================================================
  // LINHAS DE CONFIGURAÇÕES
  // ==========================================================

  listRow: {
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },

  listLabel: {
    flexShrink: 1,
    fontSize: 13,
  },
});
