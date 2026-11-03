
import React, { useState } from "react";

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
  ActivityIndicator,
  StatusBar,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import api from "../services/api";

// ============================================================
// IMAGEM DE FUNDO - MESMA DO LOGIN
// ============================================================

import fundoLogin from "../../assets/fundo-login.png";

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function RecuperarSenhaScreen({ navigation }) {
  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [etapa, setEtapa] = useState("email");
  const [enviando, setEnviando] = useState(false);

  // ==========================================================
  // ENVIAR CÓDIGO DE RECUPERAÇÃO
  // ==========================================================

  async function handleEnviarCodigo() {
    if (enviando) return;

    const emailFormatado = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailFormatado)) {
      Alert.alert(
        "E-mail inválido",
        "Por favor, informe um e-mail válido."
      );
      return;
    }

    setEnviando(true);

    try {
      await api.solicitarRecuperacao(emailFormatado);

      setEmail(emailFormatado);
      setCodigo("");
      setEtapa("codigo");

      Alert.alert(
        "Solicitação recebida",
        "Se o e-mail estiver cadastrado, você receberá um código de recuperação."
      );
    } catch (error) {
      console.log(
        "Erro ao enviar código:",
        error?.response?.data || error?.message
      );

      Alert.alert(
        "Erro ao enviar código",
        error?.response?.data?.message ||
          "Não foi possível solicitar o código. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  // ==========================================================
  // VERIFICAR CÓDIGO
  // ==========================================================

  async function handleVerificarCodigo() {
    if (enviando) return;

    const codigoFormatado = codigo.trim();

    if (!/^\d{6}$/.test(codigoFormatado)) {
      Alert.alert(
        "Código inválido",
        "Digite o código de 6 dígitos recebido por e-mail."
      );
      return;
    }

    setEnviando(true);

    try {
      await api.verificarCodigo(
        email,
        codigoFormatado
      );

      navigation.navigate("NovaSenha", {
        email,
        codigo: codigoFormatado,
      });
    } catch (error) {
      console.log(
        "Erro ao verificar código:",
        error?.response?.data || error?.message
      );

      Alert.alert(
        "Código inválido",
        error?.response?.data?.message ||
          "O código está incorreto ou expirou."
      );
    } finally {
      setEnviando(false);
    }
  }

  // ==========================================================
  // VOLTAR
  // ==========================================================

  function handleVoltar() {
    if (etapa === "codigo") {
      setCodigo("");
      setEtapa("email");
      return;
    }

    navigation.goBack();
  }

  // ==========================================================
  // INTERFACE PRINCIPAL
  // ==========================================================

  return (
    <View style={styles.background}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#080E21"
        translucent={false}
      />

      {/* ==================================================== */}
      {/* IMAGEM DE FUNDO - IGUAL AO LOGIN */}
      {/* ==================================================== */}

      <Image
        source={fundoLogin}
        style={styles.backgroundImage}
        resizeMode="cover"
        pointerEvents="none"
        accessible={false}
      />

      {/* ==================================================== */}
      {/* CONTEÚDO PRINCIPAL ACIMA DA IMAGEM */}
      {/* ==================================================== */}

      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ================================================ */}
          {/* BOTÃO VOLTAR */}
          {/* ================================================ */}

          <View style={styles.headerWrap}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleVoltar}
              activeOpacity={0.7}
              disabled={enviando}
            >
              <Ionicons
                name="arrow-back"
                size={25}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* ================================================ */}
          {/* CARD PRINCIPAL */}
          {/* ================================================ */}

          <View style={styles.card}>
            {/* LINHA SUPERIOR */}

            <View style={styles.topLine} />

            {/* ============================================== */}
            {/* ÍCONE SUPERIOR */}
            {/* ============================================== */}

            <View style={styles.iconWrap}>
              <Ionicons
                name={
                  etapa === "email"
                    ? "lock-closed-outline"
                    : "shield-checkmark-outline"
                }
                size={36}
                color="#DCD9FF"
              />
            </View>

            {/* ============================================== */}
            {/* TÍTULO */}
            {/* ============================================== */}

            <Text style={styles.title}>
              {etapa === "email"
                ? "Recuperar Senha"
                : "Verificar Código"}
            </Text>

            {/* ============================================== */}
            {/* DESCRIÇÃO */}
            {/* ============================================== */}

            <Text style={styles.subtitle}>
              {etapa === "email"
                ? "Insira seu e-mail corporativo para receber um código de recuperação."
                : `Digite o código de 6 dígitos enviado para ${email}.`}
            </Text>

            {/* ============================================== */}
            {/* E-MAIL OU CÓDIGO */}
            {/* ============================================== */}

            <View style={styles.inputBox}>
              <Ionicons
                name={
                  etapa === "email"
                    ? "mail-outline"
                    : "keypad-outline"
                }
                size={21}
                color="#8495B5"
                style={styles.inputIcon}
              />

              {etapa === "email" ? (
                <TextInput
                  style={styles.input}
                  placeholder="E-mail corporativo"
                  placeholderTextColor="#8495B5"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  editable={!enviando}
                  returnKeyType="done"
                  onSubmitEditing={handleEnviarCodigo}
                />
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Código de 6 dígitos"
                  placeholderTextColor="#8495B5"
                  value={codigo}
                  onChangeText={(texto) =>
                    setCodigo(texto.replace(/\D/g, ""))
                  }
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!enviando}
                />
              )}
            </View>

            {/* ============================================== */}
            {/* BOTÃO PRINCIPAL */}
            {/* ============================================== */}

            <TouchableOpacity
              style={[
                styles.button,
                enviando && styles.buttonDisabled,
              ]}
              onPress={
                etapa === "email"
                  ? handleEnviarCodigo
                  : handleVerificarCodigo
              }
              disabled={enviando}
              activeOpacity={0.8}
            >
              {enviando ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.buttonText}>
                  {etapa === "email"
                    ? "Enviar Código"
                    : "Verificar Código"}
                </Text>
              )}
            </TouchableOpacity>

            {/* ============================================== */}
            {/* REENVIAR CÓDIGO */}
            {/* ============================================== */}

            {etapa === "codigo" && (
              <TouchableOpacity
                style={styles.backLoginButton}
                onPress={handleEnviarCodigo}
                disabled={enviando}
                activeOpacity={0.7}
              >
                <Text style={styles.backText}>
                  Não recebeu? Reenviar código
                </Text>
              </TouchableOpacity>
            )}

            {/* ============================================== */}
            {/* VOLTAR AO LOGIN */}
            {/* ============================================== */}

            <TouchableOpacity
              style={styles.backLoginButton}
              onPress={() =>
                navigation.navigate("Login")
              }
              disabled={enviando}
              activeOpacity={0.7}
            >
              <Text style={styles.backText}>
                Voltar para o Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ============================================================
// ESTILOS COMPLETOS
// ============================================================

const styles = StyleSheet.create({
  // ==========================================================
  // CONTAINER PRINCIPAL
  // ==========================================================

  background: {
    flex: 1,
    backgroundColor: "#080E21",
  },

  // ==========================================================
  // IMAGEM DE FUNDO - MESMO MÉTODO DO LOGIN
  // ==========================================================

  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },

  // ==========================================================
  // CONTEÚDO NA FRENTE DA IMAGEM
  // ==========================================================

  container: {
    flex: 1,
    zIndex: 1,
    elevation: 1,
    backgroundColor: "transparent",
  },

  // ==========================================================
  // SCROLL
  // ==========================================================

  scrollView: {
    flex: 1,
    backgroundColor: "transparent",
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingTop: 35,
    paddingBottom: 40,
  },

  // ==========================================================
  // BOTÃO VOLTAR
  // ==========================================================

  headerWrap: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 24,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(19, 29, 55, 0.90)",
    borderWidth: 1,
    borderColor: "rgba(145, 143, 255, 0.30)",
  },

  // ==========================================================
  // CARD PRINCIPAL
  // ==========================================================

  card: {
    width: "100%",
    backgroundColor: "rgba(12, 22, 47, 0.91)",
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 30,
    borderWidth: 1.5,
    borderColor: "#6658E8",
    overflow: "hidden",

    shadowColor: "#5B4BFF",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
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
    backgroundColor: "#6554FF",
  },

  // ==========================================================
  // ÍCONE SUPERIOR
  // ==========================================================

  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: "rgba(116, 111, 191, 0.28)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
  },

  // ==========================================================
  // TÍTULO
  // ==========================================================

  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: -0.5,
  },

  // ==========================================================
  // SUBTÍTULO
  // ==========================================================

  subtitle: {
    color: "#A5B3D2",
    fontSize: 14,
    lineHeight: 23,
    textAlign: "center",
    marginBottom: 30,
  },

  // ==========================================================
  // CAMPO DE ENTRADA
  // ==========================================================

  inputBox: {
    width: "100%",
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(21, 34, 59, 0.95)",
    borderWidth: 1,
    borderColor: "#364769",
    borderRadius: 18,
    marginBottom: 24,
  },

  inputIcon: {
    marginLeft: 18,
  },

  input: {
    flex: 1,
    height: "100%",
    color: "#FFFFFF",
    fontSize: 15,
    paddingHorizontal: 14,
  },

  // ==========================================================
  // BOTÃO PRINCIPAL
  // ==========================================================

  button: {
    width: "100%",
    minHeight: 60,
    borderRadius: 30,
    backgroundColor: "#5B4BFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 22,

    shadowColor: "#5B4BFF",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },

  // ==========================================================
  // LINKS INFERIORES
  // ==========================================================

  backLoginButton: {
    paddingVertical: 8,
    alignItems: "center",
  },

  backText: {
    color: "#AAA8FF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
