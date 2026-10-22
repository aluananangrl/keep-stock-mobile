import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
  green: "#72e0a4",
  red: "#fb7185",
};

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

  const tipo = String(produto.tipo || "ENTRADA");

  async function registrarMovimentacao() {
    setErro("");

    const quantidadeNumerica = Number(quantidade);

    if (
      !Number.isInteger(quantidadeNumerica) ||
      quantidadeNumerica <= 0
    ) {
      setErro("Informe uma quantidade inteira maior que zero.");
      return;
    }

    const produtoId =
      produto.id ??
      produto._id ??
      produto.produto_id;

    if (!produtoId) {
      setErro(
        "Este código não está vinculado a um produto cadastrado na API. " +
          "Não foi registrada nenhuma movimentação."
      );
      return;
    }

    setSalvando(true);

    try {
      const tipoNormalizado = tipo
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();

      await api.criarMovimentacao({
        produto_id: produtoId,
        tipo: tipoNormalizado,
        quantidade: quantidadeNumerica,
        observacoes:
          "Movimentação registrada pelo aplicativo Keep Stock Mobile",
      });

      setConcluido(true);
    } catch (error) {
      setErro(
        getErrorMessage(
          error,
          "Não foi possível registrar a movimentação. " +
            "O estoque não foi confirmado como atualizado."
        )
      );
    } finally {
      setSalvando(false);
    }
  }

  const operacaoEhSaida = tipo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase() === "SAIDA";

  const corOperacao = operacaoEhSaida
    ? COLORS.red
    : COLORS.green;

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
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
                ? "#18332b"
                : "#1a2d42",
            },
          ]}
        >
          <Feather
            name={concluido ? "check-circle" : "package"}
            size={30}
            color={concluido ? COLORS.green : "#93c5fd"}
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
            {getProductName(produto)}
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
            {tipo}
          </Text>

          <View style={styles.divider} />

          {!concluido ? (
            <>
              <Text style={styles.label}>
                Quantidade de unidades
              </Text>

              <TextInput
                value={quantidade}
                onChangeText={setQuantidade}
                keyboardType="number-pad"
                editable={!salvando}
                style={styles.input}
                placeholder="Ex.: 10"
                placeholderTextColor="#64748b"
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
            onPress={() => navigation.navigate("Home")}
          >
            <Feather
              name="home"
              size={18}
              color="#082016"
            />

            <Text style={styles.primaryText}>
              Voltar ao início
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: 52,
    paddingHorizontal: 20,
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
    backgroundColor: COLORS.green,
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
