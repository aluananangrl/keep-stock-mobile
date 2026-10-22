import React, { useCallback, useEffect, useState } from "react";
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

export default function DashboardScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState("");

  // Carrega os produtos e as movimentações da API.
  const carregar = useCallback(async (pull = false) => {
    if (pull) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErro("");

    try {
      const [respostaProdutos, respostaMovimentacoes] =
        await Promise.all([
          api.listarProdutos({ limit: 200 }),
          api.listarMovimentacoes({
            limit: 5,
            sort: "desc",
          }),
        ]);

      setProdutos(extractList(respostaProdutos));
      setMovimentacoes(extractList(respostaMovimentacoes));
    } catch (e) {
      setErro(
        getErrorMessage(
          e,
          "Não foi possível carregar os dados do painel."
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

  // Identifica produtos com estoque igual ou inferior ao mínimo.
  const baixo = produtos.filter(
    (produto) =>
      getMinimumStock(produto) > 0 &&
      getStock(produto) <= getMinimumStock(produto)
  );

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
          <Text style={s.kicker}>KEEP STOCK / RESUMO</Text>
          <Text style={s.title}>Visão geral</Text>
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

      {/* Carregamento */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator
            color={C.green}
            size="large"
          />
          <Text style={s.muted}>
            Atualizando indicadores...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => carregar(true)}
              tintColor={C.green}
            />
          }
        >
          {/* Mensagem de erro */}
          {erro ? (
            <View style={s.error}>
              <Feather
                name="alert-circle"
                size={18}
                color={C.amber}
              />

              <Text style={s.muted}>{erro}</Text>

              <TouchableOpacity
                onPress={() => carregar()}
              >
                <Text
                  style={{
                    color: C.green,
                    fontWeight: "700",
                  }}
                >
                  Tentar novamente
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Indicadores do estoque */}
          <Text style={s.section}>
            Indicadores do estoque
          </Text>

          <View style={s.grid}>
            {/* Total de produtos */}
            <View style={s.metric}>
              <View style={s.metricTop}>
                <Feather
                  name="package"
                  color={C.green}
                  size={18}
                />
                <Text style={s.metricLabel}>
                  PRODUTOS
                </Text>
              </View>

              <Text style={s.metricValue}>
                {produtos.length}
              </Text>

              <Text style={s.metricFoot}>
                Itens cadastrados
              </Text>
            </View>

            {/* Produtos com estoque baixo */}
            <View style={s.metric}>
              <View style={s.metricTop}>
                <Feather
                  name="alert-triangle"
                  color={C.amber}
                  size={18}
                />
                <Text style={s.metricLabel}>
                  ESTOQUE BAIXO
                </Text>
              </View>

              <Text
                style={[
                  s.metricValue,
                  { color: C.amber },
                ]}
              >
                {baixo.length}
              </Text>

              <Text style={s.metricFoot}>
                Abaixo do mínimo
              </Text>
            </View>

            {/* Quantidade total em estoque */}
            <View style={s.metric}>
              <View style={s.metricTop}>
                <Feather
                  name="layers"
                  color="#93c5fd"
                  size={18}
                />
                <Text style={s.metricLabel}>
                  UNIDADES
                </Text>
              </View>

              <Text style={s.metricValue}>
                {produtos
                  .reduce(
                    (soma, produto) =>
                      soma + getStock(produto),
                    0
                  )
                  .toLocaleString("pt-BR")}
              </Text>

              <Text style={s.metricFoot}>
                Saldo atual somado
              </Text>
            </View>

            {/* Movimentações recentes */}
            <View style={s.metric}>
              <View style={s.metricTop}>
                <Feather
                  name="activity"
                  color="#c4b5fd"
                  size={18}
                />
                <Text style={s.metricLabel}>
                  MOVIMENTAÇÕES
                </Text>
              </View>

              <Text style={s.metricValue}>
                {movimentacoes.length}
              </Text>

              <Text style={s.metricFoot}>
                Registros recentes
              </Text>
            </View>
          </View>

          {/* Produtos que precisam de atenção */}
          <View style={s.sectionRow}>
            <Text style={s.section}>
              Precisam de atenção
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Inventario")
              }
            >
              <Text style={s.link}>
                Ver inventário
              </Text>
            </TouchableOpacity>
          </View>

          {baixo.length === 0 ? (
            <View style={s.empty}>
              <Feather
                name="check-circle"
                size={22}
                color={C.green}
              />

              <View style={{ flex: 1 }}>
                <Text style={s.emptyTitle}>
                  Nenhum alerta identificado
                </Text>

                <Text style={s.muted}>
                  Os produtos com quantidade mínima
                  configurada estão dentro do limite.
                </Text>
              </View>
            </View>
          ) : (
            baixo.slice(0, 5).map((produto, index) => (
              <TouchableOpacity
                key={String(
                  produto.id ?? produto._id ?? index
                )}
                style={s.listRow}
                onPress={() =>
                  navigation.navigate(
                    "DetalhesProduto",
                    {
                      produto: {
                        ...produto,
                        nome: getProductName(produto),
                        estoque: getStock(produto),
                      },
                    }
                  )
                }
              >
                <View style={s.alertIcon}>
                  <Feather
                    name="alert-circle"
                    size={17}
                    color={C.amber}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>
                    {getProductName(produto)}
                  </Text>

                  <Text style={s.muted}>
                    Estoque {getStock(produto)} · mínimo{" "}
                    {getMinimumStock(produto)}
                  </Text>
                </View>

                <Feather
                  name="chevron-right"
                  color={C.muted}
                  size={18}
                />
              </TouchableOpacity>
            ))
          )}

          {/* Histórico de movimentações */}
          <View style={s.sectionRow}>
            <Text style={s.section}>
              Movimentações recentes
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Historico")
              }
            >
              <Text style={s.link}>
                Ver histórico
              </Text>
            </TouchableOpacity>
          </View>

          {movimentacoes.length === 0 ? (
            <Text style={s.muted}>
              Nenhuma movimentação retornada pela API.
            </Text>
          ) : (
            movimentacoes.slice(0, 5).map(
              (movimentacao, index) => {
                const tipo = String(
                  movimentacao.tipo ||
                    movimentacao.tipo_movimentacao ||
                    ""
                ).toUpperCase();

                const entrada = tipo.includes("ENTRADA");

                return (
                  <View
                    key={String(
                      movimentacao.id ??
                        movimentacao._id ??
                        index
                    )}
                    style={s.listRow}
                  >
                    <View
                      style={[
                        s.alertIcon,
                        {
                          backgroundColor: entrada
                            ? "#18332b"
                            : "#3a202b",
                        },
                      ]}
                    >
                      <Feather
                        name={
                          entrada
                            ? "arrow-down-left"
                            : "arrow-up-right"
                        }
                        size={17}
                        color={
                          entrada ? C.green : C.red
                        }
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={s.rowTitle}>
                        {movimentacao.produto?.nome ||
                          movimentacao.nome_produto ||
                          movimentacao.produto_nome ||
                          "Movimentação de estoque"}
                      </Text>

                      <Text style={s.muted}>
                        {tipo || "MOVIMENTAÇÃO"} ·{" "}
                        {movimentacao.data_hora ||
                          movimentacao.createdAt ||
                          movimentacao.data ||
                          "Data indisponível"}
                      </Text>
                    </View>

                    <Text
                      style={[
                        s.movementQty,
                        {
                          color: entrada
                            ? C.green
                            : C.red,
                        },
                      ]}
                    >
                      {entrada ? "+" : "−"}
                      {movimentacao.quantidade ?? "—"}
                    </Text>
                  </View>
                );
              }
            )
          )}

          {/* Acesso ao leitor de produtos */}
          <TouchableOpacity
            style={s.action}
            onPress={() =>
              navigation.navigate("CameraScanner")
            }
          >
            <Feather
              name="maximize"
              size={18}
              color="#082016"
            />

            <Text style={s.actionText}>
              Escanear produto
            </Text>
          </TouchableOpacity>
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
    marginBottom: 18,
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
    letterSpacing: 1.3,
  },

  title: {
    fontSize: 25,
    color: C.text,
    fontWeight: "700",
    marginTop: 3,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  section: {
    fontSize: 16,
    color: C.text,
    fontWeight: "700",
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 26,
  },

  metric: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 15,
    minHeight: 120,
  },

  metricTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  metricLabel: {
    color: C.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  metricValue: {
    color: C.text,
    fontSize: 28,
    fontWeight: "700",
    marginTop: 13,
  },

  metricFoot: {
    color: C.muted,
    fontSize: 11,
    marginTop: 3,
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },

  link: {
    color: C.green,
    fontSize: 12,
    fontWeight: "700",
  },

  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 13,
    marginBottom: 8,
  },

  alertIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#3a3220",
    alignItems: "center",
    justifyContent: "center",
  },

  rowTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },

  muted: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
  },

  empty: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
  },

  emptyTitle: {
    color: C.text,
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 4,
  },

  movementQty: {
    fontSize: 15,
    fontWeight: "800",
  },

  action: {
    backgroundColor: C.green,
    borderRadius: 14,
    padding: 15,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  actionText: {
    color: "#082016",
    fontWeight: "800",
    fontSize: 14,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  error: {
    backgroundColor: C.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
});
