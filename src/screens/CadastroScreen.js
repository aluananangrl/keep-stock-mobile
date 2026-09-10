
// ============================================================
// IMPORTAÇÕES
// ============================================================

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
} from "react-native";

import { useState } from "react";

import { Ionicons } from "@expo/vector-icons";

import api from "../services/api";


// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function Cadastro({ navigation }) {

  // Dados do usuário
  const [user, setUser] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  // Confirmação da senha
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Termos
  const [aceitouTermos, setAceitouTermos] = useState(false);

  // Mostrar senha
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Mostrar confirmação da senha
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] =
    useState(false);


  // ============================================================
  // ALTERAR CAMPOS
  // ============================================================

  function onChange(name, value) {
    setUser({
      ...user,
      [name]: value,
    });
  }


  // ============================================================
  // FUNÇÃO DE CADASTRO
  // ============================================================

  async function cadastrar() {

    // ==========================================================
    // VALIDAÇÕES
    // ==========================================================

    if (!user.nome.trim()) {
      Alert.alert(
        "Erro",
        "Digite seu nome." 
      );
      return;
    }

    if (!user.email.trim()) {
      Alert.alert(
        "Erro",
        "Digite seu e-mail."
      );
      return;
    }

    // Validação simples do e-mail
    const emailValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        user.email.trim()
      );

    if (!emailValido) {
      Alert.alert(
        "E-mail inválido",
        "Digite um e-mail válido."
      );
      return;
    }

    if (!user.senha) {
      Alert.alert(
        "Erro",
        "Digite sua senha."
      );
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
      Alert.alert(
        "Erro",
        "As senhas não coincidem."
      );
      return;
    }

    if (!aceitouTermos) {
      Alert.alert(
        "Atenção",
        "Aceite os Termos e Condições para continuar."
      );
      return;
    }


    // ==========================================================
    // ENVIO PARA O BACKEND
    // ==========================================================

    try {

      const dados = {
        nome: user.nome.trim(),

        email: user.email
          .trim()
          .toLowerCase(),

        senha: user.senha,
      };


      console.log(
        "================================"
      );

      console.log(
        "ENVIANDO CADASTRO:",
        dados
      );


      // Chamada para a API
      const response =
        await api.cadastrar(dados);


      console.log(
        "STATUS:",
        response.status
      );

      console.log(
        "DATA:",
        response.data
      );

      console.log(
        "================================"
      );


      // ========================================================
      // CADASTRO REALIZADO
      // ========================================================

      Alert.alert(
        "Cadastro realizado!",

        response.data?.message ||
          "Usuário cadastrado com sucesso.",

        [
          {
            text: "OK",

            onPress: () =>
              navigation.navigate("Login"),
          },
        ]
      );

    } catch (error) {

      // ========================================================
      // INFORMAÇÕES DO ERRO
      // ========================================================

      console.log(
        "================================"
      );

      console.log(
        "STATUS:",
        error?.response?.status
      );

      console.log(
        "DATA:",
        error?.response?.data
      );

      console.log(
        "MESSAGE:",
        error?.message
      );

      console.log(
        "================================"
      );


      // ========================================================
      // PEGA OS DADOS DO BACKEND
      // ========================================================

      const status =
        error?.response?.status;

      const errorData =
        error?.response?.data?.error;

      const code =
        errorData?.code;

      const message =
        errorData?.message;


      // ========================================================
      // E-MAIL JÁ CADASTRADO
      // ========================================================

      if (
        status === 409 &&
        code === "DUPLICATE_EMAIL"
      ) {

        Alert.alert(
          "E-mail já cadastrado",

          message ||
            "Já existe um usuário cadastrado com este e-mail.",

          [
            {
              text: "Ir para Login",

              onPress: () =>
                navigation.navigate("Login"),
            },

            {
              text: "OK",
              style: "cancel",
            },
          ]
        );

        return;
      }


      // ========================================================
      // OUTROS ERROS DO BACKEND
      // ========================================================

      if (message) {

        Alert.alert(
          "Erro no cadastro",
          message
        );

        return;
      }


      // ========================================================
      // ERRO DE CONEXÃO
      // ========================================================

      if (!error?.response) {

        Alert.alert(
          "Erro de conexão",

          "Não foi possível conectar ao servidor. Verifique se o backend está funcionando e tente novamente."
        );

        return;
      }


      // ========================================================
      // ERRO DESCONHECIDO
      // ========================================================

      Alert.alert(
        "Erro no cadastro",

        "Não foi possível realizar o cadastro. Tente novamente."
      );
    }
  }


  // ============================================================
  // INTERFACE
  // ============================================================

  return (

    <KeyboardAvoidingView
      style={styles.container}

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

        <View style={styles.card}>

          {/* ==================================================
              LOGO
          ================================================== */}

          <View style={styles.logo}>

            <Ionicons
              name="file-tray"
              size={25}
              color="#c4c2ff"
            />

          </View>


          {/* ==================================================
              TÍTULO
          ================================================== */}

          <Text style={styles.title}>
            Criar Conta
          </Text>


          <Text style={styles.subtitle}>
            Junte-se ao KeepStock Inventory para gestão
          </Text>

          <Text style={styles.subtitle}>
            avançada.
          </Text>


          {/* ==================================================
              NOME
          ================================================== */}

          <Text style={styles.label}>
            Nome Completo
          </Text>


          <View style={styles.inputBox}>

            <Ionicons
              name="person-outline"
              size={17}
              color="#9b9fbd"
              style={styles.icon}
            />


            <TextInput
              style={styles.input}

              placeholder="Digite seu nome"

              placeholderTextColor="#777d94"

              value={user.nome}

              onChangeText={(value) =>
                onChange("nome", value)
              }

              autoCapitalize="words"
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
              size={17}
              color="#9b9fbd"
              style={styles.icon}
            />


            <TextInput
              style={styles.input}

              placeholder="nome@empresa.com"

              placeholderTextColor="#777d94"

              value={user.email}

              onChangeText={(value) =>
                onChange("email", value)
              }

              keyboardType="email-address"

              autoCapitalize="none"

              autoCorrect={false}
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
              size={17}
              color="#9b9fbd"
              style={styles.icon}
            />


            <TextInput
              style={styles.input}

              placeholder="••••••••"

              placeholderTextColor="#777d94"

              value={user.senha}

              onChangeText={(value) =>
                onChange("senha", value)
              }

              secureTextEntry={
                !mostrarSenha
              }

              autoCapitalize="none"
            />


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

                color="#9b9fbd"

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
              size={17}
              color="#9b9fbd"
              style={styles.icon}
            />


            <TextInput
              style={styles.input}

              placeholder="••••••••"

              placeholderTextColor="#777d94"

              value={confirmarSenha}

              onChangeText={
                setConfirmarSenha
              }

              secureTextEntry={
                !mostrarConfirmarSenha
              }

              autoCapitalize="none"
            />


            <TouchableOpacity
              onPress={() =>
                setMostrarConfirmarSenha(
                  !mostrarConfirmarSenha
                )
              }
            >

              <Ionicons
                name={
                  mostrarConfirmarSenha
                    ? "eye-outline"
                    : "eye-off-outline"
                }

                size={17}

                color="#9b9fbd"

                style={styles.eye}
              />

            </TouchableOpacity>

          </View>


          {/* ==================================================
              TERMOS
          ================================================== */}

          <TouchableOpacity
            style={styles.terms}

            onPress={() =>
              setAceitouTermos(
                !aceitouTermos
              )
            }
          >

            <View
              style={[
                styles.checkbox,

                aceitouTermos &&
                  styles.checkboxChecked,
              ]}
            >

              {aceitouTermos && (

                <Ionicons
                  name="checkmark"
                  size={12}
                  color="#fff"
                />

              )}

            </View>


            <Text style={styles.termsText}>
              I agree to the Terms and Conditions
            </Text>

          </TouchableOpacity>


          {/* ==================================================
              BOTÃO CADASTRAR
          ================================================== */}

          <TouchableOpacity
            style={styles.button}

            onPress={cadastrar}

            activeOpacity={0.8}
          >

            <Text style={styles.buttonText}>
              Cadastrar
            </Text>


            <Ionicons
              name="arrow-forward"
              size={17}
              color="#29258a"
            />

          </TouchableOpacity>


          {/* ==================================================
              DIVISOR
          ================================================== */}

          <View style={styles.divider} />


          {/* ==================================================
              LOGIN
          ================================================== */}

          <View style={styles.loginContainer}>

            <Text style={styles.loginText}>
              Already have an account?{" "}
            </Text>


            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Login")
              }
            >

              <Text style={styles.loginLink}>
                Log in
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </ScrollView>

    </KeyboardAvoidingView>
  );
}


// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#1b1b1d",
  },

  scroll: {
    flexGrow: 1,
    width: "100%",
    padding: 0,
  },

  card: {
    flex: 1,
    width: "100%",
    minHeight: "100%",

    backgroundColor: "#151d32",

    paddingHorizontal: 28,
    paddingTop: 35,
    paddingBottom: 30,

    justifyContent: "center",
  },

  // ==========================================================
  // LOGO
  // ==========================================================

  logo: {
    width: 58,
    height: 58,
    borderRadius: 29,

    backgroundColor: "#303568",

    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",

    marginBottom: 18,
  },

  // ==========================================================
  // TÍTULO
  // ==========================================================

  title: {
    color: "#e1e3f0",

    fontSize: 25,
    fontWeight: "600",

    textAlign: "center",

    marginBottom: 9,
  },

  subtitle: {
    color: "#858b9f",

    fontSize: 12,

    textAlign: "center",

    lineHeight: 17,
  },

  // ==========================================================
  // LABEL
  // ==========================================================

  label: {
    color: "#d3d5df",

    fontSize: 12,
    fontWeight: "500",

    marginTop: 18,
    marginBottom: 7,
  },

  // ==========================================================
  // INPUT
  // ==========================================================

  inputBox: {
    height: 52,

    width: "100%",

    backgroundColor: "#20283b",

    borderWidth: 1,
    borderColor: "#303a55",

    flexDirection: "row",
    alignItems: "center",

    borderRadius: 10,
  },

  icon: {
    marginLeft: 13,
  },

  input: {
    flex: 1,

    height: "100%",

    paddingHorizontal: 12,

    fontSize: 13,

    color: "#e1e3f0",
  },

  eye: {
    marginRight: 13,
  },

  // ==========================================================
  // TERMOS
  // ==========================================================

  terms: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 18,
    marginBottom: 20,
  },

  checkbox: {
    width: 18,
    height: 18,

    borderRadius: 4,

    borderWidth: 1,
    borderColor: "#4c5369",

    backgroundColor: "#20283b",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 9,
  },

  checkboxChecked: {
    backgroundColor: "#7775ff",
    borderColor: "#7775ff",
  },

  termsText: {
    color: "#9297aa",

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

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#29258a",

    fontSize: 13,

    fontWeight: "600",

    marginRight: 8,
  },

  // ==========================================================
  // DIVISOR
  // ==========================================================

  divider: {
    height: 1,

    backgroundColor: "#293146",

    marginTop: 28,
    marginBottom: 22,
  },

  // ==========================================================
  // LOGIN
  // ==========================================================

  loginContainer: {
    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",
  },

  loginText: {
    color: "#858b9e",

    fontSize: 11,
  },

  loginLink: {
    color: "#aaa8ff",

    fontSize: 11,

    fontWeight: "600",
  },

});