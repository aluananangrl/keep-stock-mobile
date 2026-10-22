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
} from "react-native";

import { useState } from "react";

import * as SecureStore from "expo-secure-store";

import { Ionicons } from "@expo/vector-icons";

import api from "../services/api";
import { useTheme } from "../context/ThemeContext";


// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  const palette = isDarkTheme
    ? {
        background: "#1b1b1d",
        card: "#172035",
        cardSoft: "#20283b",
        border: "#303a55",
        text: "#e1e3f0",
        muted: "#858b9f",
        input: "#20283b",
        placeholder: "#777d98",
        button: "#aaa8ff",
        buttonText: "#29258a",
        footer: "#73778a",
      }
    : {
        background: "#f5f7fb",
        card: "#ffffff",
        cardSoft: "#edf3ff",
        border: "#dfe6f3",
        text: "#1d2433",
        muted: "#60708a",
        input: "#f3f6ff",
        placeholder: "#7a88a8",
        button: "#8d8df5",
        buttonText: "#f4f5ff",
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

    setForm({
      ...form,
      [name]: value,
    });

  }


  // ==========================================================
  // LOGIN
  // ==========================================================

  async function handleLogin() {

    // Verifica e-mail
    if (!form.email.trim()) {

      Alert.alert(
        "Erro",
        "Digite seu e-mail."
      );

      return;
    }


    // Verifica senha
    if (!form.senha) {

      Alert.alert(
        "Erro",
        "Digite sua senha."
      );

      return;
    }


    try {

      setCarregando(true);


      // ======================================================
      // DADOS DO LOGIN
      // ======================================================

      const dados = {

        email: form.email
          .trim()
          .toLowerCase(),

        senha: form.senha,

      };


      // Mostra somente o e-mail no console
      console.log(
        "Enviando login:",
        {
          email: dados.email,
        }
      );


      // ======================================================
      // CHAMA A API
      // ======================================================

      const response = await api.login(dados);


      // Mostra resposta no console
      console.log(
        "RESPOSTA DO LOGIN:",
        response.data
      );


      // ======================================================
      // VERIFICA TOKEN
      // ======================================================

      const payload = response?.data?.data ?? response?.data;
      const token = payload?.token ?? payload?.accessToken ?? payload?.access_token;
      const usuario = payload?.user ?? payload?.usuario ?? payload?.usuarioAutenticado;
      if (!token) {
        Alert.alert("Erro", "O servidor respondeu, mas não retornou um token de acesso reconhecido. Confira o formato da resposta do endpoint /api/v1/auth/login.");
        return;
      }


      // ======================================================
      // SALVA TOKEN
      // ======================================================

      await SecureStore.setItemAsync(
        "token",
        String(token)
      );


      // ======================================================
      // SALVA DADOS DO USUÁRIO
      // ======================================================

      if (usuario) {

        // Salva usuário completo
        await SecureStore.setItemAsync(
          "user",
          JSON.stringify(
            usuario
          )
        );


        // Salva nome
        if (usuario.nome) {

          await SecureStore.setItemAsync(
            "nome",
            usuario.nome
          );

        }


        // Salva e-mail
        if (usuario.email) {

          await SecureStore.setItemAsync(
            "email",
            usuario.email
          );

        }

      }


      // ======================================================
      // LOGIN REALIZADO
      // ======================================================

      Alert.alert(
        "Sucesso",

        response.data.message ||
          "Login realizado com sucesso!",

        [
          {
            text: "OK",

            onPress: () =>
              navigation.navigate("Home"),

          },
        ]

      );


    } catch (error) {

      // ======================================================
      // ERRO NO LOGIN
      // ======================================================

      console.log(
        "ERRO NO LOGIN:",
        error?.response?.data ||
          error?.message ||
          error
      );


      // ======================================================
      // PEGA INFORMAÇÕES DO BACKEND
      // ======================================================

      const status =
        error?.response?.status;

      const errorData =
        error?.response?.data?.error;


      // ======================================================
      // CREDENCIAIS INVÁLIDAS
      // ======================================================

      if (
        status === 401 &&
        errorData?.code ===
          "INVALID_CREDENTIALS"
      ) {

        Alert.alert(
          "Login inválido",
          "E-mail ou senha inválidos."
        );

        return;
      }


      // ======================================================
      // OUTROS ERROS DA API
      // ======================================================

      const message =
        errorData?.message ||
        error?.response?.data?.message ||
        "Não foi possível realizar o login.";


      Alert.alert(
        "Erro",
        message
      );


    } finally {

      // Finaliza carregamento
      setCarregando(false);

    }

  }


  // ==========================================================
  // INTERFACE
  // ==========================================================

  return (

    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: palette.background }]}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ==================================================
            CARD PRINCIPAL
        ================================================== */}

        <View style={[styles.card, { backgroundColor: palette.card }]}>


          {/* ==================================================
              LINHA SUPERIOR
          ================================================== */}

          <View style={styles.topLine} />


          {/* ==================================================
              LOGO
          ================================================== */}

          <View style={styles.logo}>

            <Ionicons
              name="file-tray"
              size={27}
              color="#c4c2ff"
            />

            <Text style={[styles.logoText, { color: isDarkTheme ? "#d7d8ff" : "#2e3858" }]}>
              KeepStock
            </Text>

          </View>


          {/* ==================================================
              TÍTULO
          ================================================== */}

          <Text style={[styles.title, { color: palette.text }]}>
            Bem-vindo de volta
          </Text>

          <Text style={[styles.subtitle, { color: palette.muted }]}>
            Acesse o sistema de controle de inventário.
          </Text>


          {/* ==================================================
              E-MAIL
          ================================================== */}

          <View style={[styles.inputBox, { backgroundColor: palette.input, borderColor: palette.border }]}>

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
              onChangeText={(value) =>
                handleChange(
                  "email",
                  value
                )
              }
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!carregando}
            />

          </View>


          {/* ==================================================
              SENHA
          ================================================== */}

          <View style={[styles.inputBox, { backgroundColor: palette.input, borderColor: palette.border }]}>

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
              onChangeText={(value) =>
                handleChange(
                  "senha",
                  value
                )
              }
              secureTextEntry={!mostrarSenha}
              editable={!carregando}
            />


            {/* BOTÃO MOSTRAR SENHA */}

            <TouchableOpacity
              onPress={() =>
                setMostrarSenha(
                  !mostrarSenha
                )
              }
            >

              <Ionicons
                name={
                  mostrarSenha
                    ? "eye-outline"
                    : "eye-off-outline"
                }
                size={17}
                color={palette.muted}
                style={styles.eye}
              />

            </TouchableOpacity>

          </View>


          {/* ==================================================
              OPÇÕES
          ================================================== */}

          <View style={styles.options}>

            {/* LEMBRAR-ME */}

            <TouchableOpacity
              style={styles.remember}
              onPress={() =>
                setLembrar(!lembrar)
              }
            >

              <View
                style={[
                  styles.checkbox,

                  lembrar &&
                    styles.checkboxChecked,
                ]}
              >

                {lembrar && (

                  <Ionicons
                    name="checkmark"
                    size={11}
                    color="#fff"
                  />

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

              <Text style={[styles.forgot, { color: isDarkTheme ? "#aaa8ff" : "#4b5de0" }]}>
                Esqueceu a senha?
              </Text>

            </TouchableOpacity>

          </View>


          {/* ==================================================
              BOTÃO LOGIN
          ================================================== */}

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

              {carregando
                ? "Entrando..."
                : "Entrar no Sistema"}

            </Text>

          </TouchableOpacity>


          {/* ==================================================
              DIVISOR
          ================================================== */}

          <View style={styles.divider} />


          {/* ==================================================
              SUPORTE
          ================================================== */}

          <Text style={[styles.problem, { color: isDarkTheme ? "#a1a5b7" : "#5a6884" }]}>
            Problemas de acesso?
          </Text>

          <TouchableOpacity>

            <Text style={[styles.support, { color: isDarkTheme ? "#aaa8ff" : "#4b5de0" }]}>
              Contatar Suporte de TI
            </Text>

          </TouchableOpacity>


          {/* ==================================================
              CADASTRO
          ================================================== */}

          <View style={styles.register}>

            <Text style={[styles.registerText, { color: palette.muted }]}>
              Não tem uma conta?{" "}
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  "Cadastro"
                )
              }
            >

              <Text style={[styles.registerLink, { color: isDarkTheme ? "#aaa8ff" : "#4b5de0" }]}>
                Cadastre-se
              </Text>

            </TouchableOpacity>

          </View>

        </View>


        {/* ==================================================
            RODAPÉ
        ================================================== */}

        <Text style={[styles.footer, { color: palette.footer }]}>
          © 2026 keepStock Tech. Sistema de uso restrito.
        </Text>

      </ScrollView>

    </KeyboardAvoidingView>

  );

}


// ============================================================
// ESTILIZAÇÃO
// ============================================================

const styles = StyleSheet.create({

  // ==========================================================
  // CONTAINER
  // ==========================================================

  container: {

    flex: 1,

    backgroundColor: "#1b1b1d",

  },


  // ==========================================================
  // SCROLL
  // ==========================================================

  scroll: {

    flexGrow: 1,

    width: "100%",

    padding: 0,

  },


  // ==========================================================
  // CARD
  // ==========================================================

  card: {

    flex: 1,

    width: "100%",

    minHeight: "100%",

    backgroundColor: "#172035",

    borderRadius: 0,

    paddingHorizontal: 28,

    paddingTop: 35,

    paddingBottom: 30,

    justifyContent: "center",

    overflow: "hidden",

  },


  // ==========================================================
  // LINHA SUPERIOR
  // ==========================================================

  topLine: {

    position: "absolute",

    top: 0,

    left: 0,

    right: 0,

    height: 3,

    backgroundColor: "#7775ff",

  },


  // ==========================================================
  // LOGO
  // ==========================================================

  logo: {

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 30,

  },


  logoText: {

    color: "#d7d8ff",

    fontSize: 22,

    fontWeight: "600",

    marginLeft: 9,

  },


  // ==========================================================
  // TÍTULO
  // ==========================================================

  title: {

    color: "#e1e3f0",

    fontSize: 24,

    fontWeight: "600",

    textAlign: "center",

    marginBottom: 9,

  },


  subtitle: {

    color: "#858b9f",

    fontSize: 12,

    textAlign: "center",

    lineHeight: 18,

    marginBottom: 28,

  },


  // ==========================================================
  // INPUTS
  // ==========================================================

  inputBox: {

    width: "100%",

    height: 52,

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#20283b",

    borderWidth: 1,

    borderColor: "#303a55",

    borderRadius: 10,

    marginBottom: 14,

  },


  icon: {

    marginLeft: 14,

  },


  input: {

    flex: 1,

    height: "100%",

    color: "#e1e3f0",

    fontSize: 13,

    paddingHorizontal: 12,

  },


  eye: {

    marginRight: 14,

  },


  // ==========================================================
  // OPÇÕES
  // ==========================================================

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

    borderColor: "#4c5369",

    backgroundColor: "#20283b",

    marginRight: 9,

    justifyContent: "center",

    alignItems: "center",

  },


  checkboxChecked: {

    backgroundColor: "#7775ff",

    borderColor: "#7775ff",

  },


  rememberText: {

    color: "#9297aa",

    fontSize: 11,

  },


  forgot: {

    color: "#aaa8ff",

    fontSize: 11,

  },


  // ==========================================================
  // BOTÃO
  // ==========================================================

  button: {

    width: "100%",

    height: 52,

    borderRadius: 26,

    backgroundColor: "#aaa8ff",

    justifyContent: "center",

    alignItems: "center",

  },


  buttonDisabled: {

    opacity: 0.6,

  },


  buttonText: {

    color: "#29258a",

    fontSize: 13,

    fontWeight: "600",

  },


  // ==========================================================
  // DIVISOR
  // ==========================================================

  divider: {

    height: 1,

    backgroundColor: "#293146",

    width: "100%",

    marginTop: 30,

    marginBottom: 20,

  },


  // ==========================================================
  // SUPORTE
  // ==========================================================

  problem: {

    color: "#a1a5b7",

    fontSize: 11,

    textAlign: "center",

    marginBottom: 9,

  },


  support: {

    color: "#aaa8ff",

    fontSize: 11,

    textAlign: "center",

    marginBottom: 20,

  },


  // ==========================================================
  // CADASTRO
  // ==========================================================

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

    color: "#aaa8ff",

    fontSize: 11,

    fontWeight: "600",

  },


  // ==========================================================
  // RODAPÉ
  // ==========================================================

  footer: {

    color: "#73778a",

    fontSize: 9,

    marginTop: 22,

    marginBottom: 10,

    textAlign: "center",

  },

});