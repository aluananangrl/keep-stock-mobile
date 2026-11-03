
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";

import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import api from "../services/api";

// MESMO FUNDO DA TELA DE LOGIN
import fundoLogin from "../../assets/fundo-login.png";

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function Cadastro({ navigation }) {

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [user, setUser] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] =
    useState(false);

  const [carregando, setCarregando] = useState(false);

  // ==========================================================
  // ALTERAR CAMPOS
  // ==========================================================

  function onChange(name, value) {
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // ==========================================================
  // FUNÇÃO DE CADASTRO
  // ==========================================================

  async function cadastrar() {

    if (!user.nome.trim()) {
      Alert.alert("Erro", "Digite seu nome.");
      return;
    }

    if (!user.email.trim()) {
      Alert.alert("Erro", "Digite seu e-mail.");
      return;
    }

    const emailValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        user.email.trim()
      );

    if (!emailValido) {
      Alert.alert("E-mail inválido", "Digite um e-mail válido.");
      return;
    }

    if (!user.senha) {
      Alert.alert("Erro", "Digite sua senha.");
      return;
    }

    if (user.senha.length < 6) {
      Alert.alert(
        "Senha inválida",
        "A senha deve possuir pelo menos 6 caracteres."
      );
      return;
    }

    if (user.senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    if (!aceitouTermos) {
      Alert.alert(
        "Atenção",
        "Aceite os Termos e Condições para continuar."
      );
      return;
    }

    try {
      setCarregando(true);

      const dados = {
        nome: user.nome.trim(),
        email: user.email.trim().toLowerCase(),
        senha: user.senha,
      };

      console.log("ENVIANDO CADASTRO:", {
        nome: dados.nome,
        email: dados.email,
      });

      // CHAMADA PARA API

      const response = await api.cadastrar(dados);

      console.log("STATUS:", response.status);
      console.log("DATA:", response.data);

      // CADASTRO REALIZADO

      Alert.alert(
        "Cadastro realizado!",
        response.data?.message ||
          "Usuário cadastrado com sucesso.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );

    } catch (error) {

      console.log(
        "ERRO NO CADASTRO:",
        error?.response?.data || error?.message || error
      );

      const status = error?.response?.status;

      const errorData = error?.response?.data?.error;

      const code = errorData?.code;

      const message =
        errorData?.message ||
        error?.response?.data?.message;

      // E-MAIL JÁ CADASTRADO

      if (status === 409 && code === "DUPLICATE_EMAIL") {
        Alert.alert(
          "E-mail já cadastrado",
          message ||
            "Já existe um usuário cadastrado com este e-mail.",
          [
            {
              text: "Ir para Login",
              onPress: () => navigation.navigate("Login"),
            },
            {
              text: "OK",
              style: "cancel",
            },
          ]
        );

        return;
      }

      // ERROS DO BACKEND

      if (message) {
        Alert.alert("Erro no cadastro", message);
        return;
      }

      // ERRO DE CONEXÃO

      if (!error?.response) {
        Alert.alert(
          "Erro de conexão",
          "Não foi possível conectar ao servidor. Verifique se o backend está funcionando e tente novamente."
        );

        return;
      }

      // OUTROS ERROS

      Alert.alert(
        "Erro no cadastro",
        "Não foi possível realizar o cadastro. Tente novamente."
      );

    } finally {
      setCarregando(false);
    }
  }

  // ==========================================================
  // INTERFACE
  // ==========================================================

  return (
    <View style={styles.background}>

      {/* IMAGEM DE FUNDO */}

      <Image
        source={fundoLogin}
        style={styles.backgroundImage}
        resizeMode="cover"
        pointerEvents="none"
        accessible={false}
      />

      {/* CONTEÚDO */}

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* BOTÃO VOLTAR */}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#ffffff"
            />
          </TouchableOpacity>

          {/* ==================================================
              IDENTIDADE VISUAL
          ================================================== */}

          <View style={styles.header}>

            <View style={styles.logo}>
              <Ionicons
                name="cube-outline"
                size={38}
                color="#a99fff"
              />
            </View>

            <Text style={styles.brand}>
              Keep<Text style={styles.brandAccent}>Stock</Text>
            </Text>

            <Text style={styles.subtitle}>
              Crie sua conta e faça parte de uma
            </Text>

            <Text style={styles.subtitle}>
              gestão de estoque mais inteligente.
            </Text>

          </View>

          {/* ==================================================
              CARD DE CADASTRO
          ================================================== */}

          <View style={styles.card}>

            {/* TÍTULO DO CARD */}

            <View style={styles.cardHeader}>

              <View style={styles.cardIcon}>
                <Ionicons
                  name="person-add-outline"
                  size={29}
                  color="#c4baff"
                />
              </View>

              <Text style={styles.title}>
                Criar Conta
              </Text>

            </View>

            {/* ==================================================
                NOME
            ================================================== */}

            <Text style={styles.label}>
              Nome Completo
            </Text>

            <View style={styles.inputBox}>

              <Ionicons
                name="person-outline"
                size={22}
                color="#a4a9d8"
                style={styles.icon}
              />

              <TextInput
                style={styles.input}
                placeholder="Digite seu nome"
                placeholderTextColor="#858db5"
                value={user.nome}
                onChangeText={(value) =>
                  onChange("nome", value)
                }
                autoCapitalize="words"
                editable={!carregando}
              />

            </View>

            {/* ==================================================
                EMAIL
            ================================================== */}

            <Text style={styles.label}>
              Email
            </Text>

            <View style={styles.inputBox}>

              <Ionicons
                name="mail-outline"
                size={22}
                color="#a4a9d8"
                style={styles.icon}
              />

              <TextInput
                style={styles.input}
                placeholder="nome@empresa.com"
                placeholderTextColor="#858db5"
                value={user.email}
                onChangeText={(value) =>
                  onChange("email", value)
                }
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!carregando}
              />

            </View>

            {/* ==================================================
                SENHA
            ================================================== */}

            <Text style={styles.label}>
              Senha
            </Text>

            <View style={styles.inputBox}>

              <Ionicons
                name="lock-closed-outline"
                size={22}
                color="#a4a9d8"
                style={styles.icon}
              />

              <TextInput
                style={styles.input}
                placeholder="Crie uma senha"
                placeholderTextColor="#858db5"
                value={user.senha}
                onChangeText={(value) =>
                  onChange("senha", value)
                }
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                editable={!carregando}
              />

              <TouchableOpacity
                onPress={() =>
                  setMostrarSenha(!mostrarSenha)
                }
                disabled={carregando}
              >
                <Ionicons
                  name={
                    mostrarSenha
                      ? "eye-outline"
                      : "eye-off-outline"
                  }
                  size={22}
                  color="#a4a9d8"
                  style={styles.eye}
                />
              </TouchableOpacity>

            </View>

            {/* ==================================================
                CONFIRMAR SENHA
            ================================================== */}

            <Text style={styles.label}>
              Confirmar Senha
            </Text>

            <View style={styles.inputBox}>

              <Ionicons
                name="lock-closed-outline"
                size={22}
                color="#a4a9d8"
                style={styles.icon}
              />

              <TextInput
                style={styles.input}
                placeholder="Confirme sua senha"
                placeholderTextColor="#858db5"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={!mostrarConfirmarSenha}
                autoCapitalize="none"
                editable={!carregando}
              />

              <TouchableOpacity
                onPress={() =>
                  setMostrarConfirmarSenha(
                    !mostrarConfirmarSenha
                  )
                }
                disabled={carregando}
              >
                <Ionicons
                  name={
                    mostrarConfirmarSenha
                      ? "eye-outline"
                      : "eye-off-outline"
                  }
                  size={22}
                  color="#a4a9d8"
                  style={styles.eye}
                />
              </TouchableOpacity>

            </View>

            {/* ==================================================
                TERMOS E CONDIÇÕES
            ================================================== */}

            <TouchableOpacity
              style={styles.terms}
              onPress={() =>
                setAceitouTermos(!aceitouTermos)
              }
              activeOpacity={0.8}
            >

              <View
                style={[
                  styles.checkbox,
                  aceitouTermos && styles.checkboxChecked,
                ]}
              >
                {aceitouTermos && (
                  <Ionicons
                    name="checkmark"
                    size={15}
                    color="#ffffff"
                  />
                )}
              </View>

              <Text style={styles.termsText}>
                Eu concordo com os{" "}
                <Text style={styles.termsHighlight}>
                  Termos e Condições
                </Text>
              </Text>

            </TouchableOpacity>

            {/* ==================================================
                BOTÃO CADASTRAR
            ================================================== */}

            <TouchableOpacity
              style={[
                styles.button,
                carregando && styles.buttonDisabled,
              ]}
              onPress={cadastrar}
              activeOpacity={0.8}
              disabled={carregando}
            >

              <Text style={styles.buttonText}>
                {carregando ? "Cadastrando..." : "Cadastrar"}
              </Text>

              {!carregando && (
                <Ionicons
                  name="arrow-forward"
                  size={25}
                  color="#ffffff"
                />
              )}

            </TouchableOpacity>

            {/* ==================================================
                DIVISOR
            ================================================== */}

            <View style={styles.divider} />

            {/* ==================================================
                JÁ TEM CONTA?
            ================================================== */}

            <View style={styles.loginContainer}>

              <Text style={styles.loginText}>
                Já possui uma conta?
              </Text>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Login")
                }
              >
                <Text style={styles.loginLink}>
                  Fazer Login
                </Text>
              </TouchableOpacity>

            </View>

          </View>

          {/* ==================================================
              RODAPÉ
          ================================================== */}

          <Text style={styles.footer}>
            © 2026 keepStock.
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

  // FUNDO

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

  // CONTAINER

  container: {
    flex: 1,
    zIndex: 1,
    elevation: 1,
    backgroundColor: "transparent",
  },

  scroll: {
    flexGrow: 1,
    width: "100%",
    paddingHorizontal: 0,
    paddingTop: 12,
    paddingBottom: 20,
  },

  // VOLTAR

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(43, 49, 105, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 22,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(135, 120, 255, 0.20)",
  },

  // HEADER

  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 28,
  },

  logo: {
    width: 65,
    height: 65,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  brand: {
    fontSize: 34,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -1,
    marginBottom: 12,
  },

  brandAccent: {
    color: "#8666ff",
  },

  subtitle: {
    fontSize: 14,
    color: "#a2a9d5",
    textAlign: "center",
    lineHeight: 21,
  },

  // CARD

  card: {
    width: "92%",
    alignSelf: "center",
    backgroundColor: "rgba(12, 17, 43, 0.78)",
    borderWidth: 1.3,
    borderColor: "rgba(117, 101, 255, 0.32)",
    borderRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 28,
    overflow: "hidden",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    gap: 15,
  },

  cardIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(79, 58, 205, 0.48)",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: "#f5f5ff",
    fontSize: 27,
    fontWeight: "700",
  },

  // LABELS

  label: {
    color: "#e0e3ff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 9,
    marginTop: 17,
  },

  // INPUTS

  inputBox: {
    width: "100%",
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(32, 40, 67, 0.82)",
    borderWidth: 1.3,
    borderColor: "#343b70",
    borderRadius: 22,
  },

  icon: {
    marginLeft: 15,
  },

  input: {
    flex: 1,
    height: "100%",
    color: "#f4f4ff",
    fontSize: 15,
    paddingHorizontal: 14,
  },

  eye: {
    marginRight: 15,
  },

  // TERMOS

  terms: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 25,
  },

  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#858bd1",
    backgroundColor: "rgba(32, 40, 67, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  checkboxChecked: {
    backgroundColor: "#7052f5",
    borderColor: "#a99aff",
  },

  termsText: {
    color: "#aab0d7",
    fontSize: 12,
    flexShrink: 1,
  },

  termsHighlight: {
    color: "#9a79ff",
    fontWeight: "700",
  },

  // BOTÃO

  button: {
    width: "100%",
    height: 66,
    borderRadius: 35,
    backgroundColor: "#7451f5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#9d8bff",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },

  // DIVISOR

  divider: {
    height: 1,
    backgroundColor: "rgba(111, 120, 177, 0.30)",
    marginTop: 27,
    marginBottom: 23,
  },

  // LOGIN

  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 5,
  },

  loginText: {
    color: "#929bc5",
    fontSize: 12,
  },

  loginLink: {
    color: "#a99aff",
    fontSize: 12,
    fontWeight: "700",
  },

  // RODAPÉ

  footer: {
    color: "#929bc5",
    fontSize: 10,
    textAlign: "center",
    marginTop: 25,
    marginBottom: 12,
    paddingHorizontal: 15,
  },

});
