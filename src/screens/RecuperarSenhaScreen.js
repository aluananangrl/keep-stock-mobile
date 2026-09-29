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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RecuperarSenhaScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);

  function handleEnviarLink() {
    const emailFormatado = email.trim();

    if (!emailFormatado) {
      Alert.alert("Erro", "Digite seu e-mail corporativo.");
      return;
    }

    if (!emailFormatado.includes("@")) {
      Alert.alert("Erro", "Informe um e-mail válido.");
      return;
    }

    setEnviando(true);

    Alert.alert(
      "Link enviado",
      `A recuperação foi solicitada para ${emailFormatado}. Verifique sua caixa de entrada.`,
      [
        {
          text: "OK",
          onPress: () => {
            setEnviando(false);
            navigation.goBack();
          },
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerWrap}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#e1e3f0" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="lock-closed-outline" size={28} color="#dfe1ff" />
          </View>

          <Text style={styles.title}>Recuperar Senha</Text>

          <Text style={styles.subtitle}>
            Insira seu e-mail corporativo para receber as instruções de redefinição.
          </Text>

          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={17} color="#858ba7" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail corporativo"
              placeholderTextColor="#777d98"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!enviando}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, enviando && styles.buttonDisabled]}
            onPress={handleEnviarLink}
            activeOpacity={0.8}
            disabled={enviando}
          >
            <Text style={styles.buttonText}>
              {enviando ? "Enviando..." : "Enviar Link de Recuperação"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Voltar para o Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b1b1d",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerWrap: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  card: {
    width: "100%",
    backgroundColor: "#172035",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: "#2e3a52",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#2c334c",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 18,
  },
  title: {
    color: "#e1e3f0",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#858b9f",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  inputBox: {
    width: "100%",
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#20283b",
    borderWidth: 1,
    borderColor: "#303a55",
    borderRadius: 10,
    marginBottom: 18,
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
  button: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    backgroundColor: "#aaa8ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#1e1b48",
    fontSize: 13,
    fontWeight: "700",
  },
  backText: {
    color: "#aaa8ff",
    fontSize: 12,
    textAlign: "center",
  },
});
