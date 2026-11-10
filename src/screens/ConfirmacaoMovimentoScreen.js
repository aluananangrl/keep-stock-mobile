import { BRAND_COLORS } from "../context/colors";
import ScreenBackground from "../components/ScreenBackground";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  ScrollView,
  InputAccessoryView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import api from "../services/api";
import {
  getErrorMessage,
  getProductName,
  getStock,
} from "../services/responseUtils";

const COLORS = {
  bg: "#0b1220",
  panel: "#121d2e",
  border: "#243247",
  text: "#f1f5f9",
  muted: "#94a3b8",
  highlight: BRAND_COLORS.highlight,
  red: "#fb7185",
};

const normalizarTexto = (valor) =>
  String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

export default function ConfirmacaoMovimentoScreen({
  navigation,
  route,
}) {
  const produto = route?.params?.produto || {};

  const [quantidade, setQuantidade] = useState(
    String(produto.quantidade ?? "")
  );
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState("");

  const tipo = String(
    route?.params?.tipo || produto.tipo || "ENTRADA"
  );

  const tipoNormalizado = normalizarTexto(tipo);
  const operacaoEhSaida = tipoNormalizado === "SAIDA";

  const corOperacao = operacaoEhSaida
    ? COLORS.red
    : COLORS.highlight;

  async function registrarMovimentacao() {
    Keyboard.dismiss();
    if (salvando || concluido) {
      return;
    }

    setErro("");

    // Valida o tipo de movimentação.
    if (
      tipoNormalizado !== "ENTRADA" &&
      tipoNormalizado !== "SAIDA"
    ) {
      setErro("Tipo de movimentação inválido.");
      return;
    }

    // Valida a quantidade informada.
    const quantidadeNumerica = Number(quantidade);

    if (
      quantidade.trim() === "" ||
      !Number.isSafeInteger(quantidadeNumerica) ||
      quantidadeNumerica <= 0
    ) {
      setErro("Informe uma quantidade inteira maior que zero.");
      return;
    }

    // Identifica o produto.
    const produtoId =
      route?.params?.produtoId ??
      produto.id ??
      produto.produto_id ??
      produto.produtoId ??
      produto.id_produto ??
      produto._id;

    if (
      produtoId === undefined ||
      produtoId === null ||
      String(produtoId).trim() === ""
    ) {
      setErro(
        "Não foi possível identificar o produto. " +
          "Volte à lista e selecione um produto cadastrado."
      );
      return;
    }

    // Impede saída maior que o estoque disponível.
    const estoqueAtual = Number(getStock(produto));

    if (
      !Number.isFinite(estoqueAtual) ||
      estoqueAtual < 0
    ) {
      setErro(
        "Não foi possível verificar o estoque atual. " +
          "Atualize os dados do produto e tente novamente."
      );
      return;
    }

    if (
      operacaoEhSaida &&
      quantidadeNumerica > estoqueAtual
    ) {
      setErro(
        `Estoque insuficiente. Disponível: ${estoqueAtual} unidades.`
      );
      return;
    }

    setSalvando(true);

    try {
      await api.criarMovimentacao({
        produto_id: produtoId,
        tipo: tipoNormalizado,
        quantidade: quantidadeNumerica,
        observacao:
          "Movimentação registrada pelo aplicativo Keep Stock Mobile",
      });

      setConcluido(true);
    } catch (error) {
      setErro(
        getErrorMessage(
          error,
          "Não foi possível registrar a movimentação. " +
            "Confira a conexão e tente novamente."
        )
      );
    } finally {
      setSalvando(false);
    }
  }

  function voltarAosDetalhes() {
    // Volta à tela anterior, que normalmente é a de detalhes.
    // A tela de detalhes deve recarregar os dados ao receber foco.
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  }

  return (
    <ScreenBackground>
<>
    <ScrollView
      style={[styles.screen, { backgroundColor: "transparent" }]}
      contentContainerStyle={styles.container}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
          disabled={salvando}
          accessibilityLabel="Voltar"
        >
          <Feather
            name="arrow-left"
            size={20}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Movimentação de estoque
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Cartão principal */}
      <View style={styles.card}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: concluido
                ? BRAND_COLORS.soft
                : "#1a2d42",
            },
          ]}
        >
          <Feather
            name={concluido ? "check-circle" : "package"}
            size={30}
            color={concluido ? COLORS.highlight : "#93c5fd"}
          />
        </View>

        <Text style={styles.title}>
          {concluido
            ? "Movimentação registrada"
            : "Confirmar movimentação"}
        </Text>

        <Text style={styles.subtitle}>
          {concluido
            ? "A API confirmou o registro da operação."
            : "Confira os dados antes de atualizar o estoque."}
        </Text>

        {/* Informações do produto */}
        <View style={styles.resultBox}>
          <Text style={styles.label}>Produto</Text>

          <Text style={styles.productName}>
            {getProductName(produto) || "Produto não identificado"}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.label}>
            Tipo de operação
          </Text>

          <Text
            style={[
              styles.value,
              { color: corOperacao },
            ]}
          >
            {tipoNormalizado === "SAIDA" ? "SAÍDA" : tipo}
          </Text>

          <View style={styles.divider} />

          {!concluido ? (
            <>
              <Text style={styles.label}>
                Quantidade de unidades
              </Text>

              <TextInput
                value={quantidade}
                onChangeText={(valor) => {
                  setQuantidade(valor);
                  if (erro) setErro("");
                }}
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                inputAccessoryViewID={Platform.OS === "ios" ? "quantidade-movimento" : undefined}
                editable={!salvando}
                style={styles.input}
                placeholder="Ex.: 10"
                placeholderTextColor="#64748b"
                maxLength={9}
                accessibilityLabel="Quantidade de unidades"
              />

              <Text style={styles.hint}>
                Saldo atual informado: {getStock(produto)} un.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.label}>
                Quantidade registrada
              </Text>

              <Text style={styles.value}>
                {quantidade} un.
              </Text>
            </>
          )}
        </View>

        {/* Mensagem de erro */}
        {erro ? (
          <View style={styles.errorBox}>
            <Feather
              name="alert-circle"
              size={18}
              color={COLORS.red}
            />

            <Text style={styles.errorText}>
              {erro}
            </Text>
          </View>
        ) : null}

        {/* Botão principal */}
        {!concluido ? (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              salvando && styles.disabledButton,
            ]}
            onPress={registrarMovimentacao}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#082016" />
            ) : (
              <Feather
                name="check"
                size={18}
                color="#082016"
              />
            )}

            <Text style={styles.primaryText}>
              {salvando
                ? "Registrando..."
                : "Registrar movimentação"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={voltarAosDetalhes}
          >
            <Feather
              name="check-circle"
              size={18}
              color="#082016"
            />

            <Text style={styles.primaryText}>
              Voltar ao produto
            </Text>
          </TouchableOpacity>
        )}

        {/* Botão secundário */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("CameraScanner")}
          disabled={salvando}
        >
          <Text style={styles.secondaryText}>
            Ler outro produto
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    </TouchableWithoutFeedback>
    </ScrollView>
    {Platform.OS === "ios" && (
      <InputAccessoryView nativeID="quantidade-movimento">
        <View style={styles.keyboardToolbar}>
          <TouchableOpacity
            onPress={Keyboard.dismiss}
            style={styles.keyboardDone}
            accessibilityRole="button"
            accessibilityLabel="Concluir digitação da quantidade e fechar teclado"
          >
            <Text style={styles.keyboardDoneText}>Concluir</Text>
          </TouchableOpacity>
        </View>
      </InputAccessoryView>
    )}
    </>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  keyboardToolbar: {
    backgroundColor: COLORS.panel,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    alignItems: "flex-end",
    paddingHorizontal: 12,
  },
  keyboardDone: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  keyboardDoneText: {
    color: COLORS.highlight,
    fontSize: 16,
    fontWeight: "700",
  },
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.bg,
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },

  headerSpacer: {
    width: 42,
  },

  card: {
    backgroundColor: COLORS.panel,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    alignItems: "center",
  },

  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 22,
  },

  resultBox: {
    width: "100%",
    backgroundColor: COLORS.bg,
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
  },

  label: {
    color: COLORS.muted,
    fontSize: 11,
    marginBottom: 7,
  },

  productName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },

  value: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 13,
  },

  input: {
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },

  hint: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 8,
  },

  errorBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#63303b",
    backgroundColor: "#2b1821",
    borderRadius: 12,
    marginBottom: 14,
  },

  errorText: {
    color: "#fecdd3",
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },

  primaryButton: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    backgroundColor: COLORS.highlight,
    borderRadius: 13,
    paddingVertical: 14,
    marginTop: 2,
  },

  disabledButton: {
    opacity: 0.65,
  },

  primaryText: {
    color: "#082016",
    fontSize: 13,
    fontWeight: "800",
  },

  secondaryButton: {
    padding: 14,
    marginTop: 4,
  },

  secondaryText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "600",
  },
});
