import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Feather } from "@expo/vector-icons";

import api from "../services/api";

import {
  extractList,
  getErrorMessage,
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

export default function InventarioScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState("");

  // Carrega os produtos da API
  const carregar = useCallback(async (pull = false) => {
    if (pull) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErro("");

    try {
      const resposta = await api.listarProdutos({
        limit: 200,
      });

      setProdutos(extractList(resposta));
    } catch (e) {
      setErro(
        getErrorMessage(
          e,
          "Não foi possível consultar o inventário."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Identifica produtos com estoque baixo
  const baixo = produtos.filter((produto) => {
    const minimo = getMinimumStock(produto);
    const estoque = getStock(produto);

    return minimo > 0 && estoque <= minimo;
  });

  return (
    <View style={s.container}>
      {/* Cabeçalho */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.icon}
          onPress={() => navigation.goBack()}
        >
          <Feather
            name="arrow-left"
            size={20}
            color={C.text}
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={s.kicker}>
            VISÃO DO ESTOQUE
          </Text>

          <Text style={s.title}>
            Inventário
          </Text>
        </View>

        <TouchableOpacity
          style={s.icon}
          onPress={() => carregar(true)}
        >
          <Feather
            name="refresh-cw"
            size={18}
            color={C.green}
          />
        </TouchableOpacity>
      </View>

      {/* Resumo do inventário */}
      <View style={s.summaryRow}>
        <View style={s.summary}>
          <Text style={s.summaryLabel}>
            Produtos cadastrados
          </Text>

          <Text style={s.summaryValue}>
            {produtos.length}
          </Text>
        </View>

        <View style={s.summary}>
          <Text style={s.summaryLabel}>
            Abaixo do mínimo
          </Text>

          <Text
            style={[
              s.summaryValue,
              {
                color: baixo.length
                  ? C.amber
                  : C.green,
              },
            ]}
          >
            {baixo.length}
          </Text>
        </View>
      </View>

      {/* Estado de carregamento */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={C.green} />

          <Text style={s.muted}>
            Consultando estoque...
          </Text>
        </View>
      ) : erro ? (
        /* Estado de erro */
        <View style={s.center}>
          <Feather
            name="alert-circle"
            color={C.red}
            size={28}
          />

          <Text style={s.muted}>
            {erro}
          </Text>

          <TouchableOpacity
            onPress={() => carregar()}
            style={s.retry}
          >
            <Text style={s.retryText}>
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Lista de produtos */
        <ScrollView
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => carregar(true)}
              tintColor={C.green}
            />
          }
        >
          {produtos.length === 0 ? (
            <Text style={s.muted}>
              Ainda não há produtos cadastrados na API.
            </Text>
          ) : (
            produtos.map((produto, i) => {
              const estoque = getStock(produto);
              const minimo = getMinimumStock(produto);

              const status =
                minimo > 0 && estoque <= minimo
                  ? "Baixo"
                  : "Disponível";

              const chave = String(
                produto.id ??
                  produto._id ??
                  getProductCode(produto) ??
                  i
              );

              return (
                <TouchableOpacity
                  key={chave}
                  style={s.row}
                  onPress={() =>
                    navigation.navigate(
                      "DetalhesProduto",
                      {
                        produto: {
                          ...produto,
                          nome: getProductName(produto),
                          codigo: getProductCode(produto),
                          estoque,
                        },
                      }
                    )
                  }
                >
                  {/* Ícone do produto */}
                  <View style={s.box}>
                    <Feather
                      name="package"
                      size={18}
                      color={C.green}
                    />
                  </View>

                  {/* Informações do produto */}
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>
                      {getProductName(produto)}
                    </Text>

                    <Text style={s.code}>
                      Código: {getProductCode(produto)}
                    </Text>

                    <Text style={s.code}>
                      Mínimo: {minimo} un.
                    </Text>
                  </View>

                  {/* Quantidade e situação */}
                  <View style={s.right}>
                    <Text style={s.quantity}>
                      {estoque}
                    </Text>

                    <Text
                      style={[
                        s.status,
                        {
                          color:
                            status === "Baixo"
                              ? C.amber
                              : C.green,
                        },
                      ]}
                    >
                      {status}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 22,
  },

  icon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  kicker: {
    fontSize: 10,
    color: C.green,
    fontWeight: "800",
    letterSpacing: 1.4,
  },

  title: {
    fontSize: 25,
    color: C.text,
    fontWeight: "700",
    marginTop: 3,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  summary: {
    flex: 1,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 16,
  },

  summaryLabel: {
    color: C.muted,
    fontSize: 11,
  },

  summaryValue: {
    color: C.text,
    fontSize: 28,
    fontWeight: "700",
    marginTop: 9,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
  },

  box: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#18332b",
    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    color: C.text,
    fontSize: 14,
    fontWeight: "650",
  },

  code: {
    color: C.muted,
    fontSize: 11,
    marginTop: 4,
  },

  right: {
    alignItems: "flex-end",
    gap: 3,
  },

  quantity: {
    color: C.text,
    fontSize: 20,
    fontWeight: "700",
  },

  status: {
    fontSize: 10,
    fontWeight: "700",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },

  muted: {
    color: C.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },

  retry: {
    padding: 12,
    backgroundColor: C.panel,
    borderRadius: 10,
  },

  retryText: {
    color: C.green,
    fontWeight: "700",
  },
});
