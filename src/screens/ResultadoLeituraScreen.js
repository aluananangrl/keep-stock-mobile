import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import {
  getMinimumStock,
  getProductCode,
  getProductName,
  getStock,
} from "../services/responseUtils";

const C = {
  bg: "#0b1220",
  panel: "#121d2e",
  border: "#243247",
  text: "#f1f5f9",
  muted: "#94a3b8",
  green: "#72e0a4",
  amber: "#fbbf24",
  red: "#fb7185",
};

const idOf = (p) =>
  p?.id ?? p?._id ?? p?.produto_id ?? p?.id_produto;

export default function ResultadoLeituraScreen({
  navigation,
  route,
}) {
  const produto = route?.params?.produto;

  const codigoLido =
    route?.params?.codigo ?? getProductCode(produto || {});

  // Exibe uma mensagem caso o produto não seja válido.
  if (!produto || !idOf(produto)) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity
            style={s.back}
            onPress={() => navigation.goBack()}
          >
            <Feather
              name="arrow-left"
              size={20}
              color={C.text}
            />
          </TouchableOpacity>

          <Text style={s.heading}>
            Resultado da leitura
          </Text>
        </View>

        <View style={s.empty}>
          <Feather
            name="alert-circle"
            size={34}
            color={C.amber}
          />

          <Text style={s.title}>
            Produto não identificado
          </Text>

          <Text style={s.muted}>
            O código {String(codigoLido)} não correspondeu
            a um produto cadastrado com identificador válido
            na API. Nenhum estoque foi alterado.
          </Text>

          <TouchableOpacity
            style={s.primary}
            onPress={() =>
              navigation.navigate("CameraScanner")
            }
          >
            <Text style={s.primaryText}>
              Ler outro código
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Dados do produto identificado.
  const nome = getProductName(produto);
  const estoque = getStock(produto);
  const minimo = getMinimumStock(produto);

  const baixo = minimo > 0 && estoque <= minimo;

  // Encaminha o produto para a confirmação da movimentação.
  const mover = (tipo) => {
    navigation.navigate("ConfirmacaoMovimento", {
      produto: {
        ...produto,
        id: idOf(produto),
        nome,
        codigo: getProductCode(produto),
        estoque,
        tipo,
      },
    });
  };

  return (
    <View style={s.container}>
      {/* Cabeçalho */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.back}
          onPress={() => navigation.goBack()}
        >
          <Feather
            name="arrow-left"
            size={20}
            color={C.text}
          />
        </TouchableOpacity>

        <Text style={s.heading}>
          Resultado da leitura
        </Text>

        <TouchableOpacity
          style={s.back}
          onPress={() =>
            navigation.navigate("CameraScanner")
          }
        >
          <Feather
            name="camera"
            size={18}
            color={C.green}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
      >
        <View style={s.card}>
          {/* Ícone do produto */}
          <View style={s.productIcon}>
            <Feather
              name="package"
              size={30}
              color={C.green}
            />
          </View>

          <Text style={s.title}>{nome}</Text>

          <Text style={s.muted}>
            Código:{" "}
            {String(getProductCode(produto) || codigoLido)}
          </Text>

          {/* Situação do estoque */}
          <View
            style={[
              s.badge,
              {
                backgroundColor: baixo
                  ? "#302716"
                  : "#18332b",
              },
            ]}
          >
            <Text
              style={{
                color: baixo ? C.amber : C.green,
                fontWeight: "700",
                fontSize: 12,
              }}
            >
              {baixo
                ? "Estoque abaixo do mínimo"
                : "Produto cadastrado"}
            </Text>
          </View>

          {/* Indicadores de estoque */}
          <View style={s.stats}>
            <View style={s.stat}>
              <Text style={s.label}>
                Saldo atual
              </Text>

              <Text style={s.number}>
                {estoque}
              </Text>

              <Text style={s.muted}>
                unidades
              </Text>
            </View>

            <View style={s.stat}>
              <Text style={s.label}>
                Estoque mínimo
              </Text>

              <Text
                style={[
                  s.number,
                  {
                    color: baixo ? C.amber : C.text,
                  },
                ]}
              >
                {minimo}
              </Text>

              <Text style={s.muted}>
                unidades
              </Text>
            </View>
          </View>

          <Text style={s.helper}>
            Selecione a operação que deseja registrar.
            O saldo só será atualizado depois da confirmação
            da API.
          </Text>

          {/* Registrar entrada */}
          <TouchableOpacity
            style={s.entry}
            onPress={() => mover("ENTRADA")}
          >
            <Feather
              name="plus-circle"
              size={18}
              color="#082016"
            />

            <Text style={s.entryText}>
              Registrar entrada
            </Text>
          </TouchableOpacity>

          {/* Registrar saída */}
          <TouchableOpacity
            style={s.exit}
            onPress={() => mover("SAIDA")}
          >
            <Feather
              name="minus-circle"
              size={18}
              color={C.red}
            />

            <Text style={s.exitText}>
              Registrar saída
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    paddingTop: 52,
  },

  header: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
  },

  back: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  heading: {
    flex: 1,
    color: C.text,
    fontSize: 17,
    fontWeight: "700",
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
  },

  productIcon: {
    width: 70,
    height: 70,
    borderRadius: 21,
    backgroundColor: "#18332b",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  title: {
    color: C.text,
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 7,
  },

  muted: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 13,
  },

  stats: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 22,
  },

  stat: {
    flex: 1,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
  },

  label: {
    color: C.muted,
    fontSize: 11,
  },

  number: {
    color: C.text,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 2,
  },

  helper: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginVertical: 22,
  },

  entry: {
    width: "100%",
    backgroundColor: C.green,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    marginBottom: 10,
  },

  entryText: {
    color: "#082016",
    fontSize: 13,
    fontWeight: "800",
  },

  exit: {
    width: "100%",
    backgroundColor: "#2b1821",
    borderWidth: 1,
    borderColor: "#63303b",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
  },

  exitText: {
    color: C.red,
    fontSize: 13,
    fontWeight: "800",
  },

  empty: {
    margin: 20,
    marginTop: 70,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    gap: 14,
  },

  primary: {
    backgroundColor: C.green,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    marginTop: 8,
  },

  primaryText: {
    color: "#082016",
    fontWeight: "800",
    fontSize: 13,
  },
});
