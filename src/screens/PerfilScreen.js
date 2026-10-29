
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
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
        accent: "#7c83ff",
        action: "#dbeafe",
        danger: "#fb7185",
      }
    : {
        background: "#f4f7fb",
        header: "#ffffff",
        text: "#1d2433",
        muted: "#60708a",
        card: "#ffffff",
        cardSoft: "#edf3ff",
        border: "#dfe6f3",
        accent: "#4b5de0",
        action: "#2d436a",
        danger: "#e5485d",
      };

  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroPerfil, setErroPerfil] = useState("");
  const [saindo, setSaindo] = useState(false);

  const carregarPerfil = useCallback(async () => {
    setCarregando(true);
    setErroPerfil("");

    try {
      const response = await api.me();

      const dados =
        response?.data?.user ||
        response?.data?.usuario ||
        response?.data?.data ||
        response?.data;

      if (dados && typeof dados === "object") {
        setPerfil(dados);

        // Atualiza os dados locais para uso futuro.
        try {
          await SecureStore.setItemAsync("user", JSON.stringify(dados));

          if (dados.nome) {
            await SecureStore.setItemAsync("nome", String(dados.nome));
          }

          if (dados.email) {
            await SecureStore.setItemAsync("email", String(dados.email));
          }
        } catch (storageError) {
          console.warn("Não foi possível salvar os dados do perfil.");
        }
      } else {
        throw new Error("A API não retornou os dados do usuário.");
      }
    } catch (error) {
      console.warn(
        "Erro ao carregar perfil:",
        error?.response?.data || error?.message
      );

      // Tenta usar os dados já salvos no dispositivo.
      try {
        const usuarioSalvo = await SecureStore.getItemAsync("user");
        const nomeSalvo = await SecureStore.getItemAsync("nome");
        const emailSalvo = await SecureStore.getItemAsync("email");

        let dadosSalvos = null;

        if (usuarioSalvo) {
          try {
            dadosSalvos = JSON.parse(usuarioSalvo);
          } catch {
            dadosSalvos = null;
          }
        }

        if (!dadosSalvos || typeof dadosSalvos !== "object") {
          dadosSalvos = {};
        }

        if (nomeSalvo && !dadosSalvos.nome) {
          dadosSalvos.nome = nomeSalvo;
        }

        if (emailSalvo && !dadosSalvos.email) {
          dadosSalvos.email = emailSalvo;
        }

        if (Object.keys(dadosSalvos).length > 0) {
          setPerfil(dadosSalvos);
          setErroPerfil(
            "Não foi possível atualizar os dados. Exibindo as informações salvas."
          );
        } else {
          setPerfil(null);
          setErroPerfil(
            "Não foi possível carregar seu perfil. Verifique sua conexão e tente novamente."
          );
        }
      } catch (storageError) {
        setPerfil(null);
        setErroPerfil("Não foi possível carregar seu perfil.");
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarPerfil();
  }, [carregarPerfil]);

  const nomeCompleto = perfil?.nome || perfil?.name || "Usuário";
  const email = perfil?.email || "Não informado";
  const cargo =
    perfil?.perfil ||
    perfil?.cargo ||
    perfil?.tipo ||
    perfil?.role ||
    "Funcionário";

  const telefone = perfil?.telefone || "Não informado";
  const unidade = perfil?.unidade || "Não informada";
  const departamento = perfil?.departamento || "Não informado";

  const iniciais =
    nomeCompleto
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() || "")
      .join("") || "US";

  const confirmarLogout = () => {
    if (saindo) return;

    Alert.alert(
      "Sair da conta",
      "Tem certeza de que deseja encerrar sua sessão?",
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
      ]
    );
  };

  const executarLogout = async () => {
    if (saindo) return;

    setSaindo(true);

    try {
      await api.logout();

      // Impede voltar às telas protegidas usando o botão voltar.
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.warn("Erro ao encerrar sessão:", error?.message);

      Alert.alert(
        "Erro ao sair",
        "Não foi possível limpar os dados da sessão. Tente novamente."
      );
    } finally {
      setSaindo(false);
    }
  };

  const informarFuncionalidadeIndisponivel = (funcionalidade) => {
    Alert.alert(
      "Funcionalidade indisponível",
      `${funcionalidade} ainda não está implementada.`
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.background },
      ]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: palette.header },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Feather
            name="arrow-left"
            size={20}
            color={palette.text}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: palette.text }]}>
          Perfil
        </Text>

        <TouchableOpacity
          onPress={() =>
            informarFuncionalidadeIndisponivel("A edição do perfil")
          }
          accessibilityRole="button"
          accessibilityLabel="Editar perfil"
        >
          <Feather
            name="edit-2"
            size={18}
            color={palette.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarWrap}>
          <View
            style={[
              styles.avatarCircle,
              {
                backgroundColor: palette.cardSoft,
                borderColor: palette.accent,
              },
            ]}
          >
            <Text style={[styles.avatarText, { color: palette.text }]}>
              {iniciais}
            </Text>
          </View>
        </View>

        {carregando ? (
          <ActivityIndicator
            size="small"
            color={palette.accent}
            style={styles.loading}
          />
        ) : (
          <>
            <Text style={[styles.userName, { color: palette.text }]}>
              {nomeCompleto}
            </Text>

            <Text style={[styles.userRole, { color: palette.muted }]}>
              {cargo}
            </Text>
          </>
        )}

        {!!erroPerfil && (
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
            ]}
          >
            <Text style={[styles.errorText, { color: palette.muted }]}>
              {erroPerfil}
            </Text>

            <TouchableOpacity
              onPress={carregarPerfil}
              disabled={carregando}
              style={styles.retryButton}
            >
              <Text style={[styles.retryText, { color: palette.accent }]}>
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          <View style={styles.infoRow}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={palette.accent}
            />
            <Text style={[styles.infoText, { color: palette.text }]}>
              {email}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="call-outline"
              size={18}
              color={palette.accent}
            />
            <Text style={[styles.infoText, { color: palette.text }]}>
              {telefone}
            </Text>
          </View>

          <View style={[styles.infoRow, styles.lastInfoRow]}>
            <Ionicons
              name="location-outline"
              size={18}
              color={palette.accent}
            />
            <Text style={[styles.infoText, { color: palette.text }]}>
              {unidade}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.groupCard,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          <Text style={[styles.groupTitle, { color: palette.text }]}>
            Informações pessoais
          </Text>

          <View
            style={[
              styles.sectionRow,
              { borderBottomColor: palette.border },
            ]}
          >
            <Text style={[styles.sectionLabel, { color: palette.muted }]}>
              Nome completo
            </Text>
            <Text
              style={[styles.sectionValue, { color: palette.text }]}
              numberOfLines={2}
            >
              {nomeCompleto}
            </Text>
          </View>

          <View
            style={[
              styles.sectionRow,
              { borderBottomColor: palette.border },
            ]}
          >
            <Text style={[styles.sectionLabel, { color: palette.muted }]}>
              Cargo
            </Text>
            <Text
              style={[styles.sectionValue, { color: palette.text }]}
              numberOfLines={2}
            >
              {cargo}
            </Text>
          </View>

          <View
            style={[
              styles.sectionRow,
              styles.lastSectionRow,
              { borderBottomColor: palette.border },
            ]}
          >
            <Text style={[styles.sectionLabel, { color: palette.muted }]}>
              Departamento
            </Text>
            <Text
              style={[styles.sectionValue, { color: palette.text }]}
              numberOfLines={2}
            >
              {departamento}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.groupCard,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          <Text style={[styles.groupTitle, { color: palette.text }]}>
            Segurança e acesso
          </Text>

          <TouchableOpacity
            style={[
              styles.linkRow,
              { borderBottomColor: palette.border },
            ]}
            onPress={() =>
              informarFuncionalidadeIndisponivel("A alteração de senha")
            }
          >
            <Text style={[styles.linkText, { color: palette.text }]}>
              Alterar senha
            </Text>
            <Feather
              name="chevron-right"
              size={18}
              color={palette.action}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() =>
              informarFuncionalidadeIndisponivel(
                "A consulta de dispositivos conectados"
              )
            }
          >
            <Text style={[styles.linkText, { color: palette.text }]}>
              Dispositivos conectados
            </Text>
            <Feather
              name="chevron-right"
              size={18}
              color={palette.action}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
          onPress={confirmarLogout}
          disabled={saindo}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
        >
          {saindo ? (
            <ActivityIndicator color={palette.danger} />
          ) : (
            <View style={styles.logoutContent}>
              <Feather
                name="log-out"
                size={18}
                color={palette.danger}
              />
              <Text
                style={[
                  styles.logoutText,
                  { color: palette.danger },
                ]}
              >
                Sair da conta
              </Text>
            </View>
          )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  avatarWrap: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  userRole: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
  },
  loading: {
    marginVertical: 24,
  },
  errorCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 18,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 18,
  },
  retryButton: {
    alignSelf: "flex-start",
    paddingTop: 10,
  },
  retryText: {
    fontSize: 13,
    fontWeight: "700",
  },
  infoCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  lastInfoRow: {
    marginBottom: 0,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    marginLeft: 12,
  },
  groupCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  lastSectionRow: {
    borderBottomWidth: 0,
  },
  sectionLabel: {
    flex: 1,
    fontSize: 12,
  },
  sectionValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  linkText: {
    fontSize: 13,
  },
  logoutButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoutText: {
    fontWeight: "700",
  },
});
