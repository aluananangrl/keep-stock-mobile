// ============================================================
// IMPORTAÇÕES
// ============================================================

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";

import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";

import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

import fundoLogin from "../../assets/fundo-login.png";

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  // ==========================================================
  // PALETA DE CORES
  // ==========================================================

  const palette = isDarkTheme
    ? {
        background: "#0b1224",
        card: "rgba(8, 15, 31, 0.35)",
        border: "#34415b",
        text: "#f4f5ff",
        muted: "#9aa9c9",
        input: "#111c30",
        placeholder: "#8293b5",
        button: "#5b4cf6",
        buttonText: "#ffffff",
        footer: "#91a1c2",
      }
    : {
        background: "#f5f7fb",
        card: "rgba(255, 255, 255, 0.35)",
        border: "#dfe6f3",
        text: "#1d2433",
        muted: "#60708a",
        input: "rgba(243, 246, 255, 0.90)",
        placeholder: "#7a88a8",
        button: "#8d8df5",
        buttonText: "#ffffff",
        footer: "#69758d",
      };

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [form, setForm] = useState({
    email: "",
    senha: "",
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // ==========================================================
  // ALTERAR CAMPOS
  // ==========================================================

  function handleChange(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // ==========================================================
  // LOGIN
  // ==========================================================

  async function handleLogin() {
    if (!form.email.trim()) {
      Alert.alert("Erro", "Digite seu e-mail.");
      return;
    }

    if (!form.senha) {
      Alert.alert("Erro", "Digite sua senha.");
      return;
    }

    try {
      setCarregando(true);

      const dados = {
        email: form.email.trim().toLowerCase(),
        senha: form.senha,
      };

      console.log("Enviando login:", {
        email: dados.email,
      });

      // CHAMA A API

      const response = await api.login(dados);

      console.log("RESPOSTA DO LOGIN:", response.data);

      // VERIFICA TOKEN

      const payload = response?.data?.data ?? response?.data;

      const token =
        payload?.token ?? payload?.accessToken ?? payload?.access_token;

      const usuario =
        payload?.user ?? payload?.usuario ?? payload?.usuarioAutenticado;

      if (!token) {
        Alert.alert(
          "Erro",
          "O servidor respondeu, mas não retornou um token de acesso reconhecido. Confira o formato da resposta do endpoint /api/v1/auth/login.",
        );
        return;
      }

      // SALVA TOKEN

      await SecureStore.setItemAsync("token", String(token));

      // SALVA DADOS DO USUÁRIO

      if (usuario) {
        await SecureStore.setItemAsync("user", JSON.stringify(usuario));

        if (usuario.nome) {
          await SecureStore.setItemAsync("nome", usuario.nome);
        }

        if (usuario.email) {
          await SecureStore.setItemAsync("email", usuario.email);
        }
      }

      // LOGIN REALIZADO

      Alert.alert(
        "Sucesso",
        response.data.message || "Login realizado com sucesso!",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home"),
          },
        ],
      );
    } catch (error) {
      console.log(
        "ERRO NO LOGIN:",
        error?.response?.data || error?.message || error,
      );

      const status = error?.response?.status;
      const errorData = error?.response?.data?.error;

      // CREDENCIAIS INVÁLIDAS

      if (status === 401 && errorData?.code === "INVALID_CREDENTIALS") {
        Alert.alert("Login inválido", "E-mail ou senha inválidos.");
        return;
      }

      // OUTROS ERROS

      const message =
        errorData?.message ||
        error?.response?.data?.message ||
        "Não foi possível realizar o login.";

      Alert.alert("Erro", message);
    } finally {
      setCarregando(false);
    }
  }

  // ==========================================================
  // INTERFACE
  // ==========================================================

  return (
    <View style={[styles.background, { backgroundColor: palette.background }]}>
      {/* IMAGEM DE FUNDO */}

      <Image
        source={fundoLogin}
        style={styles.backgroundImage}
        resizeMode="cover"
        pointerEvents="none"
        accessible={false}
      />

      {/* CONTEÚDO PRINCIPAL */}

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* CARD PRINCIPAL */}

          <View style={[styles.card, { backgroundColor: palette.card }]}>
            {/* LINHA SUPERIOR */}

            <View style={styles.topLine} />

            {/* LOGO */}

            <View style={styles.logo}>
              <Ionicons name="cube-outline" size={32} color="#7665ff" />

              <Text
                style={[
                  styles.logoText,
                  {
                    color: isDarkTheme ? "#f4f5ff" : "#2e3858",
                  },
                ]}
              >
                KeepStock
              </Text>
            </View>

            {/* TÍTULO */}

            <Text style={[styles.title, { color: palette.text }]}>
              Gestão de Estoque Inteligente
            </Text>

            {/* E-MAIL */}

            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: palette.input,
                  borderColor: palette.border,
                },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={17}
                color={palette.muted}
                style={styles.icon}
              />

              <TextInput
                style={[styles.input, { color: palette.text }]}
                placeholder="Email corporativo"
                placeholderTextColor={palette.placeholder}
                value={form.email}
                onChangeText={(value) => handleChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!carregando}
              />
            </View>

            {/* SENHA */}

            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: palette.input,
                  borderColor: palette.border,
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={17}
                color={palette.muted}
                style={styles.icon}
              />

              <TextInput
                style={[styles.input, { color: palette.text }]}
                placeholder="Senha"
                placeholderTextColor={palette.placeholder}
                value={form.senha}
                onChangeText={(value) => handleChange("senha", value)}
                secureTextEntry={!mostrarSenha}
                editable={!carregando}
              />

              {/* MOSTRAR SENHA */}

              <TouchableOpacity
                onPress={() => setMostrarSenha(!mostrarSenha)}
                disabled={carregando}
              >
                <Ionicons
                  name={mostrarSenha ? "eye-outline" : "eye-off-outline"}
                  size={17}
                  color={palette.muted}
                  style={styles.eye}
                />
              </TouchableOpacity>
            </View>

            {/* OPÇÕES */}

            <View style={styles.options}>
              {/* LEMBRAR-ME */}

              <TouchableOpacity
                style={styles.remember}
                onPress={() => setLembrar(!lembrar)}
              >
                <View
                  style={[styles.checkbox, lembrar && styles.checkboxChecked]}
                >
                  {lembrar && (
                    <Ionicons name="checkmark" size={11} color="#fff" />
                  )}
                </View>

                <Text style={[styles.rememberText, { color: palette.muted }]}>
                  Lembrar-me
                </Text>
              </TouchableOpacity>

              {/* ESQUECEU A SENHA */}

              <TouchableOpacity
                onPress={() => navigation.navigate("RecuperarSenha")}
              >
                <Text
                  style={[
                    styles.forgot,
                    {
                      color: isDarkTheme ? "#aaa8ff" : "#4b5de0",
                    },
                  ]}
                >
                  Esqueceu a senha?
                </Text>
              </TouchableOpacity>
            </View>

            {/* BOTÃO LOGIN */}

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: palette.button },
                carregando && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={carregando}
            >
              <Text style={[styles.buttonText, { color: palette.buttonText }]}>
                {carregando ? "Entrando..." : "Entrar no Sistema"}
              </Text>
            </TouchableOpacity>

            {/* DIVISOR */}

            <View style={styles.signupDivider}>
              <View style={styles.dividerLine} />

              <Text style={[styles.problem, { color: palette.muted }]}>
                Ainda não tem uma conta?
              </Text>

              <View style={styles.dividerLine} />
            </View>

            {/* CADASTRO */}

            <TouchableOpacity
              style={[
                styles.registerButton,
                {
                  borderColor: isDarkTheme ? "#6554ff" : "#4b5de0",
                },
              ]}
              onPress={() => navigation.navigate("Cadastro")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="person-add-outline"
                size={22}
                color={isDarkTheme ? "#a99fff" : "#4b5de0"}
              />

              <Text
                style={[
                  styles.registerLink,
                  {
                    color: isDarkTheme ? "#7665ff" : "#4b5de0",
                  },
                ]}
              >
                Cadastre-se
              </Text>
            </TouchableOpacity>
          </View>

          {/* RODAPÉ */}

          <Text style={[styles.footer, { color: palette.footer }]}>
            © 2026 keepStock Tech. Sistema de uso restrito.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ============================================================
// ESTILIZAÇÃO
// ============================================================

const styles = StyleSheet.create({
  // CONTAINER PRINCIPAL

  background: {
    flex: 1,
    backgroundColor: "#0b1224",
  },

  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },

  container: {
    flex: 1,
    zIndex: 1,
    elevation: 1,
  },

  scroll: {
    flexGrow: 1,
    width: "100%",
    justifyContent: "center",
  },

  card: {
    width: "100%",
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingTop: 42,
    paddingBottom: 28,
    justifyContent: "center",
    backgroundColor: "rgba(8, 15, 31, 0.35)",
  },

  // LINHA SUPERIOR

  topLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#6554ff",
  },

  // LOGO

  logo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },

  logoText: {
    color: "#d7d8ff",
    fontSize: 28,
    fontWeight: "700",
    marginLeft: 9,
  },

  // TÍTULO

  title: {
    color: "#e1e3f0",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 9,
  },

  // INPUTS

  inputBox: {
    width: "100%",
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#20283b",
    borderWidth: 1,
    borderColor: "#303a55",
    borderRadius: 16,
    marginBottom: 18,
  },

  icon: {
    marginLeft: 14,
  },

  input: {
    flex: 1,
    height: "100%",
    color: "#e1e3f0",
    fontSize: 15,
    paddingHorizontal: 12,
  },

  eye: {
    marginRight: 14,
  },

  // OPÇÕES

  options: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 22,
  },

  remember: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#34415b",
    backgroundColor: "#111c30",
    marginRight: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxChecked: {
    backgroundColor: "#6554ff",
    borderColor: "#7775ff",
  },

  rememberText: {
    color: "#9297aa",
    fontSize: 11,
  },

  forgot: {
    color: "#aaa8ff",
    fontSize: 13,
  },

  // BOTÃO

  button: {
    width: "100%",
    height: 62,
    borderRadius: 31,
    backgroundColor: "#aaa8ff",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#29258a",
    fontSize: 16,
    fontWeight: "700",
  },

  // DIVISOR

  divider: {
    height: 1,
    backgroundColor: "#293146",
    width: "100%",
    marginTop: 30,
    marginBottom: 20,
  },

  // TEXTO DE CADASTRO

  problem: {
    color: "#9aa9c9",
    fontSize: 13,
    textAlign: "center",
    marginHorizontal: 12,
  },

  signupDivider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    marginBottom: 20,
  },

  dividerLine: {
    height: 1,
    flex: 1,
    backgroundColor: "#34415b",
  },

  // BOTÃO CADASTRO

  registerButton: {
    width: "100%",
    minHeight: 62,
    borderWidth: 1.5,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },

  // SUPORTE

  support: {
    color: "#aaa8ff",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 20,
  },

  // CADASTRO

  register: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  registerText: {
    color: "#858b9e",
    fontSize: 11,
  },

  registerLink: {
    color: "#7665ff",
    fontSize: 16,
    fontWeight: "600",
  },

  // RODAPÉ

  footer: {
    color: "#73778a",
    fontSize: 9,
    marginTop: 22,
    marginBottom: 10,
    textAlign: "center",
  },
});
