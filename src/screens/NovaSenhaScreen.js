
import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import api from "../services/api";
import fundoLogin from "../../assets/fundo-login.png";

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function NovaSenhaScreen({
  navigation,
  route,
}) {
  const { email, codigo } = route.params || {};

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] =
    useState(false);

  const [salvando, setSalvando] = useState(false);

  // ==========================================================
  // SALVAR NOVA SENHA
  // ==========================================================

  async function handleSalvarSenha() {
    if (salvando) return;

    if (!email || !codigo) {
      Alert.alert(
        "Sessão inválida",
        "Solicite um novo código de recuperação.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("RecuperarSenha"),
          },
        ]
      );
      return;
    }

    if (!senha || !confirmarSenha) {
      Alert.alert(
        "Atenção",
        "Preencha os dois campos de senha."
      );
      return;
    }

    if (senha.length < 8) {
      Alert.alert(
        "Senha inválida",
        "A senha precisa ter pelo menos 8 caracteres."
      );
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert(
        "Senhas diferentes",
        "A confirmação deve ser igual à nova senha."
      );
      return;
    }

    setSalvando(true);

    try {
      await api.redefinirSenha(
        email,
        codigo,
        senha
      );

      Alert.alert(
        "Senha alterada!",
        "Sua senha foi redefinida com sucesso. Faça login com a nova senha.",
        [
          {
            text: "Ir para o Login",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            },
          },
        ]
      );
    } catch (error) {
      console.log(
        "Erro ao redefinir senha:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Erro ao alterar senha",
        error.response?.data?.message ||
          "Não foi possível redefinir a senha. O código pode ter expirado."
      );
    } finally {
      setSalvando(false);
    }
  }

  // ==========================================================
  // INTERFACE
  // ==========================================================

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#080E21"
        translucent
      />

      {/* FUNDO */}
      {/* <Image
        source={fundoLogin}
        style={styles.backgroundImage}
        resizeMode="cover"
        pointerEvents="none"
      /> */}

      <View
        style={styles.overlay}
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* VOLTAR */}
          <View style={styles.headerWrap}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="arrow-back"
                size={25}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* CARD */}
          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons
                name="lock-open-outline"
                size={36}
                color="#DCD9FF"
              />
            </View>

            <Text style={styles.title}>
              Criar Nova Senha
            </Text>

            <Text style={styles.subtitle}>
              Crie uma nova senha para sua conta
              KeepStock.
            </Text>

            {/* NOVA SENHA */}
            <View style={styles.inputBox}>
              <Ionicons
                name="lock-closed-outline"
                size={21}
                color="#8495B5"
              />

              <TextInput
                style={styles.input}
                placeholder="Nova senha"
                placeholderTextColor="#8495B5"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!salvando}
              />

              <TouchableOpacity
                onPress={() =>
                  setMostrarSenha(!mostrarSenha)
                }
              >
                <Ionicons
                  name={
                    mostrarSenha
                      ? "eye-outline"
                      : "eye-off-outline"
                  }
                  size={21}
                  color="#8495B5"
                />
              </TouchableOpacity>
            </View>

            {/* CONFIRMAR SENHA */}
            <View style={styles.inputBox}>
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color="#8495B5"
              />

              <TextInput
                style={styles.input}
                placeholder="Confirmar nova senha"
                placeholderTextColor="#8495B5"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={!mostrarConfirmar}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!salvando}
              />

              <TouchableOpacity
                onPress={() =>
                  setMostrarConfirmar(!mostrarConfirmar)
                }
              >
                <Ionicons
                  name={
                    mostrarConfirmar
                      ? "eye-outline"
                      : "eye-off-outline"
                  }
                  size={21}
                  color="#8495B5"
                />
              </TouchableOpacity>
            </View>

            {/* SALVAR */}
            <TouchableOpacity
              style={[
                styles.button,
                salvando && styles.buttonDisabled,
              ]}
              onPress={handleSalvarSenha}
              disabled={salvando}
              activeOpacity={0.8}
            >
              {salvando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  Salvar Nova Senha
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backLoginButton}
              onPress={() => navigation.navigate("Login")}
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
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080E21",
    position: "relative",
  },

  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    zIndex: 0,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(4, 9, 28, 0.36)",
    zIndex: 1,
  },

  keyboardContainer: {
    flex: 1,
    position: "relative",
    zIndex: 2,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight || 24) + 35
        : 65,
    paddingBottom: 40,
  },

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
    backgroundColor: "rgba(19, 29, 55, 0.80)",
    borderWidth: 1,
    borderColor: "rgba(145, 143, 255, 0.24)",
  },

  card: {
    width: "100%",
    backgroundColor: "rgba(12, 22, 47, 0.94)",
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 30,
    borderWidth: 1.5,
    borderColor: "#6658E8",
    shadowColor: "#5B4BFF",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },

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

  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
  },

  subtitle: {
    color: "#A5B3D2",
    fontSize: 14,
    lineHeight: 23,
    textAlign: "center",
    marginBottom: 30,
  },

  inputBox: {
    width: "100%",
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(21, 34, 59, 0.95)",
    borderWidth: 1,
    borderColor: "#364769",
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 18,
  },

  input: {
    flex: 1,
    height: "100%",
    color: "#FFFFFF",
    fontSize: 15,
    paddingHorizontal: 12,
  },

  button: {
    width: "100%",
    minHeight: 60,
    borderRadius: 30,
    backgroundColor: "#5B4BFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 22,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

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
