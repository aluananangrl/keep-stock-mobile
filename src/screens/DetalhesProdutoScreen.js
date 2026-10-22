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

// Obtém o identificador do produto.
const getId = (produto) =>
  produto?.id ??
  produto?._id ??
  produto?.produto_id ??
  produto?.id_produto;

// Obtém o identificador do produto em uma movimentação.
const getMovementProductId = (movimentacao) =>
  movimentacao?.produto_id ??
  movimentacao?.produtoId ??
  movimentacao?.produto?.id ??
  movimentacao?.produto?._id ??
  movimentacao?.id_produto;

// Formata a data para o padrão brasileiro.
const dateText = (value) => {
  if (!value) {
    return "Data não informada";
  }

  const data = new Date(value);

  return Number.isNaN(data.getTime())
    ? String(value)
    : data.toLocaleString("pt-BR");
};

export default function DetalhesProdutoScreen({
  navigation,
  route,
}) {
  const [produto, setProduto] = useState(
    route?.params?.produto || null
  );

  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [aba, setAba] = useState("Resumo");

  const produtoId = getId(route?.params?.produto);

  // Carrega os detalhes do produto e seu histórico.
  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");

    try {
      if (!produtoId) {
        throw new Error(
          "O produto recebido não possui um identificador válido da API."
        );
      }

      const [
        produtoResponse,
        movimentosResponse,
      ] = await Promise.all([
        api.obterProduto(produtoId),

        api
          .listarMovimentacoes({
            produto_id: produtoId,
            limit: 100,
          })
          .catch(() => null),
      ]);

      const data = produtoResponse?.data;

      const atualizado =
        data?.produto ??
        data?.data?.produto ??
        data?.data ??
        data;

      if (
        !atualizado ||
        typeof atualizado !== "object" ||
        Array.isArray(atualizado)
      ) {
        throw new Error(
          "A API não retornou os dados esperados do produto."
        );
      }

      setProduto(atualizado);

      const todasMovimentacoes = movimentosResponse
        ? extractList(movimentosResponse)
        : [];

      setMovimentacoes(
        todasMovimentacoes.filter((movimentacao) => {
          const idMovimentacao =
            getMovementProductId(movimentacao);

          return (
            idMovimentacao == null ||
            String(idMovimentacao) === String(produtoId)
          );
        })
      );
    } catch (e) {
      setErro(
        getErrorMessage(
          e,
          "Não foi possível carregar os detalhes do produto."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [produtoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Dados calculados do produto.
  const nome = getProductName(produto || {});
  const codigo = getProductCode(produto || {});
  const estoque = getStock(produto || {});
  const minimo = getMinimumStock(produto || {});

  const estoqueBaixo =
    minimo > 0 && estoque <= minimo;

  // Abre a tela para registrar uma entrada ou saída.
  const iniciarMovimento = (tipo) => {
    navigation.navigate("ConfirmacaoMovimento", {
      produto: {
        ...produto,
        id: produtoId,
        nome,
        codigo,
        estoque,
        quantidade_atual: estoque,
        tipo,
      },
    });
  };

  return (
    <View style={s.container}>
      {/* Cabeçalho */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.iconButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Voltar"
        >
          <Feather
            name="arrow-left"
            size={20}
            color={C.text}
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={s.kicker}>
            CADASTRO DE ESTOQUE
          </Text>

          <Text style={s.title}>
            Detalhes do produto
          </Text>
        </View>

        <TouchableOpacity
          style={s.iconButton}
          onPress={carregar}
          accessibilityLabel="Atualizar"
        >
          <Feather
            name="refresh-cw"
            size={18}
            color={C.green}
          />
        </TouchableOpacity>
      </View>

      {/* Carregamento inicial */}
      {loading && !produto ? (
        <View style={s.center}>
          <ActivityIndicator
            color={C.green}
            size="large"
          />

          <Text style={s.muted}>
            Carregando dados do produto...
          </Text>
        </View>
      ) : erro && !produto ? (
        /* Erro sem dados do produto */
        <View style={s.center}>
          <Feather
            name="alert-circle"
            size={30}
            color={C.red}
          />

          <Text style={s.errorText}>
            {erro}
          </Text>

          <TouchableOpacity
            style={s.primary}
            onPress={carregar}
          >
            <Text style={s.primaryText}>
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.content}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={carregar}
              tintColor={C.green}
            />
          }
        >
          {/* Aviso de erro durante a atualização */}
          {erro ? (
            <View style={s.warning}>
              <Feather
                name="alert-triangle"
                size={17}
                color={C.amber}
              />

              <Text style={s.warningText}>
                {erro}
              </Text>
            </View>
          ) : null}

          {/* Informações principais do produto */}
          <View style={s.productCard}>
            <View style={s.productIcon}>
              <Feather
                name="package"
                size={27}
                color={C.green}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={s.productName}>
                {nome}
              </Text>

              <Text style={s.muted}>
                Código: {codigo}
              </Text>

              <View
                style={[
                  s.badge,
                  {
                    backgroundColor: estoqueBaixo
                      ? "#3a2d18"
                      : "#18332b",
                  },
                ]}
              >
                <Text
                  style={{
                    color: estoqueBaixo
                      ? C.amber
                      : C.green,
                    fontSize: 11,
                    fontWeight: "700",
                  }}
                >
                  {estoqueBaixo
                    ? "Estoque baixo"
                    : "Estoque normal"}
                </Text>
              </View>
            </View>
          </View>

          {/* Indicadores de estoque */}
          <View style={s.metrics}>
            <View style={s.metric}>
              <Text style={s.metricLabel}>
                Saldo atual
              </Text>

              <Text style={s.metricValue}>
                {estoque}
              </Text>

              <Text style={s.metricUnit}>
                unidades
              </Text>
            </View>

            <View style={s.metric}>
              <Text style={s.metricLabel}>
                Estoque mínimo
              </Text>

              <Text
                style={[
                  s.metricValue,
                  {
                    color: estoqueBaixo
                      ? C.amber
                      : C.text,
                  },
                ]}
              >
                {minimo}
              </Text>

              <Text style={s.metricUnit}>
                unidades
              </Text>
            </View>
          </View>

          {/* Ações de movimentação */}
          <View style={s.actions}>
            <TouchableOpacity
              style={s.entryButton}
              onPress={() =>
                iniciarMovimento("ENTRADA")
              }
            >
              <Feather
                name="plus-circle"
                size={17}
                color="#082016"
              />

              <Text style={s.actionText}>
                Registrar entrada
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.exitButton}
              onPress={() =>
                iniciarMovimento("SAIDA")
              }
            >
              <Feather
                name="minus-circle"
                size={17}
                color={C.red}
              />

              <Text style={s.exitText}>
                Registrar saída
              </Text>
            </TouchableOpacity>
          </View>

          {/* Abas */}
          <View style={s.tabs}>
            {["Resumo", "Histórico"].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setAba(item)}
                style={[
                  s.tab,
                  aba === item && s.activeTab,
                ]}
              >
                <Text
                  style={[
                    s.tabText,
                    aba === item && s.activeTabText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Conteúdo da aba selecionada */}
          {aba === "Resumo" ? (
            <View style={s.infoCard}>
              <Info
                label="Categoria"
                value={
                  typeof produto?.categoria === "object"
                    ? produto?.categoria?.nome
                    : produto?.categoria ??
                      produto?.categoria_nome ??
                      "Não informada"
                }
              />

              <Info
                label="Fornecedor"
                value={
                  typeof produto?.fornecedor === "object"
                    ? produto?.fornecedor?.nome
                    : produto?.fornecedor ??
                      produto?.fornecedor_nome ??
                      "Não informado"
                }
              />

              <Info
                label="Preço unitário"
                value={
                  produto?.preco != null
                    ? Number(produto.preco).toLocaleString(
                        "pt-BR",
                        {
                          style: "currency",
                          currency: "BRL",
                        }
                      )
                    : produto?.preco_unitario != null
                      ? Number(
                          produto.preco_unitario
                        ).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "Não informado"
                }
              />

              <Info
                label="Descrição"
                value={
                  produto?.descricao ||
                  "Sem descrição cadastrada"
                }
              />
            </View>
          ) : (
            /* Histórico de movimentações */
            <View style={s.infoCard}>
              {movimentacoes.length === 0 ? (
                <View style={s.empty}>
                  <Feather
                    name="clock"
                    size={24}
                    color={C.muted}
                  />

                  <Text style={s.muted}>
                    Nenhuma movimentação encontrada
                    para este produto.
                  </Text>
                </View>
              ) : (
                movimentacoes.map(
                  (movimentacao, index) => {
                    const tipo = String(
                      movimentacao?.tipo ??
                        movimentacao?.tipo_movimentacao ??
                        "Movimentação"
                    );

                    const quantidade = Number(
                      movimentacao?.quantidade ?? 0
                    );

                    const entrada =
                      tipo.toLowerCase().includes("entr") ||
                      tipo.toUpperCase() === "AJUSTE";

                    return (
                      <View
                        key={String(
                          movimentacao?.id ??
                            movimentacao?._id ??
                            index
                        )}
                        style={[
                          s.movement,
                          index <
                            movimentacoes.length - 1 &&
                            s.movementBorder,
                        ]}
                      >
                        <View
                          style={[
                            s.movementIcon,
                            {
                              backgroundColor: entrada
                                ? "#18332b"
                                : "#3a2029",
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
                          <Text style={s.movementTitle}>
                            {tipo}
                          </Text>

                          <Text style={s.muted}>
                            {dateText(
                              movimentacao?.data ??
                                movimentacao?.created_at ??
                                movimentacao?.createdAt ??
                                movimentacao?.data_hora
                            )}
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
                          {Math.abs(quantidade)}
                        </Text>
                      </View>
                    );
                  }
                )
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// Componente reutilizável para exibir informações.
function Info({ label, value }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>
        {label}
      </Text>

      <Text style={s.infoValue}>
        {String(value)}
      </Text>
    </View>
  );
}

// Estilos da tela.
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
    marginBottom: 20,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  kicker: {
    color: C.green,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
  },

  title: {
    color: C.text,
    fontSize: 21,
    fontWeight: "700",
    marginTop: 3,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  productCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
  },

  productIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#18332b",
    alignItems: "center",
    justifyContent: "center",
  },

  productName: {
    color: C.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 5,
  },

  muted: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    marginTop: 9,
  },

  metrics: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },

  metric: {
    flex: 1,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 16,
  },

  metricLabel: {
    color: C.muted,
    fontSize: 11,
  },

  metricValue: {
    color: C.text,
    fontSize: 29,
    fontWeight: "800",
    marginTop: 8,
  },

  metricUnit: {
    color: C.muted,
    fontSize: 10,
    marginTop: 1,
  },

  actions: {
    gap: 10,
    marginTop: 14,
  },

  entryButton: {
    backgroundColor: C.green,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  actionText: {
    color: "#082016",
    fontSize: 13,
    fontWeight: "800",
  },

  exitButton: {
    borderWidth: 1,
    borderColor: "#63303b",
    backgroundColor: "#2b1821",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  exitText: {
    color: C.red,
    fontSize: 13,
    fontWeight: "800",
  },

  tabs: {
    flexDirection: "row",
    marginTop: 24,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },

  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: C.green,
  },

  tabText: {
    color: C.muted,
    fontSize: 13,
    fontWeight: "600",
  },

  activeTabText: {
    color: C.green,
  },

  infoCard: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 16,
  },

  infoRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  infoLabel: {
    color: C.muted,
    fontSize: 11,
    marginBottom: 6,
  },

  infoValue: {
    color: C.text,
    fontSize: 13,
    lineHeight: 19,
  },

  movement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 14,
  },

  movementBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  movementIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  movementTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },

  movementQty: {
    fontSize: 16,
    fontWeight: "800",
  },

  empty: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 10,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 12,
  },

  errorText: {
    color: C.red,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },

  warning: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    backgroundColor: "#302716",
    borderRadius: 10,
    marginBottom: 12,
  },

  warningText: {
    flex: 1,
    color: C.amber,
    fontSize: 12,
    lineHeight: 18,
  },

  primary: {
    backgroundColor: C.green,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },

  primaryText: {
    color: "#082016",
    fontWeight: "800",
  },
});
