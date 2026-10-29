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
  getProductCode,
  getProductName,
  getStock,
} from "../services/responseUtils";

// ============================================================
// CORES
// ============================================================

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

// ============================================================
// IDENTIFICAR O ID DO PRODUTO
// ============================================================

const getId = (produto) => {
  if (!produto || typeof produto !== "object") {
    return null;
  }

  const candidatos = [
    produto.id,
    produto.produto_id,
    produto.produtoId,
    produto.id_produto,
    produto._id,
    produto.ID,
    produto.idProduto,
    produto.produto?.id,
    produto.produto?.produto_id,
    produto.produto?._id,
    produto.data?.id,
    produto.data?.produto_id,
    produto.data?.produto?.id,
  ];

  const id = candidatos.find(
    (valor) =>
      valor !== undefined &&
      valor !== null &&
      String(valor).trim() !== ""
  );

  return id ?? null;
};

// ============================================================
// EXTRAIR PRODUTO DA NAVEGAÇÃO
// ============================================================

const getInitialProduct = (params) => {
  if (!params || typeof params !== "object") {
    return null;
  }

  const recebido =
    params.produto ??
    params.product ??
    params.item ??
    params.data?.produto ??
    params.data ??
    params;

  if (!recebido || typeof recebido !== "object") {
    return null;
  }

  if (Array.isArray(recebido)) {
    return null;
  }

  const produto =
    recebido.produto ??
    recebido.data?.produto ??
    recebido.data ??
    recebido;

  return produto && typeof produto === "object" && !Array.isArray(produto)
    ? produto
    : null;
};

// ============================================================
// ID DO PRODUTO NA MOVIMENTAÇÃO
// ============================================================

const getMovementProductId = (movimentacao) =>
  movimentacao?.produto_id ??
  movimentacao?.produtoId ??
  movimentacao?.id_produto ??
  movimentacao?.produto?.id ??
  movimentacao?.produto?._id ??
  null;

// ============================================================
// FORMATAR DATA
// ============================================================

const dateText = (value) => {
  if (!value) {
    return "Data não informada";
  }

  const data = new Date(value);

  return Number.isNaN(data.getTime())
    ? String(value)
    : data.toLocaleString("pt-BR");
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function DetalhesProdutoScreen({ navigation, route }) {
  const params = route?.params || {};

  const produtoInicial = getInitialProduct(params);

  const idRecebido =
    params.produtoId ??
    params.productId ??
    params.id ??
    params.produto_id ??
    params.produtoIdSelecionado ??
    getId(produtoInicial);

  const [produto, setProduto] = useState(produtoInicial);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [aba, setAba] = useState("Resumo");

  const produtoId = idRecebido;

  // ==========================================================
  // CARREGAR DADOS DO PRODUTO E HISTÓRICO
  // ==========================================================

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");

    try {
      if (
        produtoId === undefined ||
        produtoId === null ||
        String(produtoId).trim() === ""
      ) {
        console.log("PARÂMETROS RECEBIDOS:", params);
        console.log("PRODUTO RECEBIDO:", produtoInicial);
        console.log("ID RECEBIDO:", produtoId);

        throw new Error(
          "O produto foi recebido, mas não contém um ID válido. Confira o retorno da API e a navegação."
        );
      }

      // Busca os dados atualizados do produto.
      const produtoResponse = await api.obterProduto(produtoId);

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
        throw new Error("A API não retornou um produto válido.");
      }

      // Mantém o ID recebido se a resposta não trouxer um identificador.
      const produtoAtualizado = {
        ...atualizado,
        id: getId(atualizado) ?? produtoId,
      };

      setProduto(produtoAtualizado);

      // O histórico é complementar: falha nele não impede
      // a exibição dos detalhes do produto.
      try {
        const movimentosResponse = await api.listarMovimentacoes({
          produto_id: produtoId,
          limit: 100,
        });

        const lista = extractList(movimentosResponse);

        setMovimentacoes(
          lista.filter((movimentacao) => {
            const idMovimentacao =
              getMovementProductId(movimentacao);

            return (
              idMovimentacao == null ||
              String(idMovimentacao) === String(produtoId)
            );
          })
        );
      } catch (erroMovimentos) {
        console.log(
          "ERRO AO CARREGAR MOVIMENTAÇÕES:",
          erroMovimentos?.response?.data ??
            erroMovimentos?.message ??
            erroMovimentos
        );

        setMovimentacoes([]);
      }
    } catch (e) {
      console.log(
        "ERRO AO CARREGAR PRODUTO:",
        e?.response?.data ?? e?.message ?? e
      );

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

  // ==========================================================
  // CARREGAR AO ABRIR A TELA
  // ==========================================================

  useEffect(() => {
    carregar();
  }, [carregar]);

  // ==========================================================
  // DADOS PARA EXIBIÇÃO
  // ==========================================================

  const nome = getProductName(produto || {});
  const codigo = getProductCode(produto || {});
  const estoque = getStock(produto || {});
  const minimo = getMinimumStock(produto || {});

  const estoqueBaixo = minimo > 0 && estoque <= minimo;

  const categoria =
    typeof produto?.categoria === "object"
      ? produto?.categoria?.nome ?? "Não informada"
      : produto?.categoria ??
        produto?.categoria_nome ??
        "Não informada";

  const fornecedor =
    typeof produto?.fornecedor === "object"
      ? produto?.fornecedor?.nome ?? "Não informado"
      : produto?.fornecedor ??
        produto?.fornecedor_nome ??
        "Não informado";

  const preco = produto?.preco ?? produto?.preco_unitario;

  // ==========================================================
  // REGISTRAR ENTRADA OU SAÍDA
  // ==========================================================

  const iniciarMovimento = (tipo) => {
    const id = getId(produto) ?? produtoId;

    if (
      id === undefined ||
      id === null ||
      String(id).trim() === ""
    ) {
      setErro(
        "Não foi possível identificar o produto para registrar a movimentação."
      );
      return;
    }

    navigation.navigate("ConfirmacaoMovimento", {
      produto: {
        ...produto,
        id,
        nome,
        codigo,
        estoque,
        quantidade_atual: estoque,
        tipo,
      },
      produtoId: id,
      tipo,
    });
  };

  // ==========================================================
  // INTERFACE
  // ==========================================================

  return (
    <View style={s.container}>
      {/* CABEÇALHO */}

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
          <Text style={s.kicker}>CADASTRO DE ESTOQUE</Text>
          <Text style={s.title}>Detalhes do produto</Text>
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

      {/* CARREGAMENTO */}

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
        <View style={s.center}>
          <Feather
            name="alert-circle"
            size={30}
            color={C.red}
          />

          <Text style={s.errorText}>{erro}</Text>

          <TouchableOpacity
            style={s.primary}
            onPress={carregar}
          >
            <Text style={s.primaryText}>
              Tentar novamente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.secondary}
            onPress={() => navigation.goBack()}
          >
            <Text style={s.secondaryText}>
              Voltar à lista
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
          {/* MENSAGEM DE ERRO */}

          {erro ? (
            <View style={s.warning}>
              <Feather
                name="alert-triangle"
                size={17}
                color={C.amber}
              />
              <Text style={s.warningText}>{erro}</Text>
            </View>
          ) : null}

          {/* CARTÃO DO PRODUTO */}

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
                {nome || "Produto sem nome"}
              </Text>

              <Text style={s.muted}>
                Código: {codigo || "Não informado"}
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
                    color: estoqueBaixo ? C.amber : C.green,
                    fontSize: 11,
                    fontWeight: "700",
                  }}
                >
                  {estoqueBaixo
                    ? "Estoque baixo ou no mínimo"
                    : "Estoque normal"}
                </Text>
              </View>
            </View>
          </View>

          {/* INDICADORES DE ESTOQUE */}

          <View style={s.metrics}>
            <View style={s.metric}>
              <Text style={s.metricLabel}>Saldo atual</Text>
              <Text style={s.metricValue}>{estoque}</Text>
              <Text style={s.metricUnit}>unidades</Text>
            </View>

            <View style={s.metric}>
              <Text style={s.metricLabel}>Estoque mínimo</Text>

              <Text
                style={[
                  s.metricValue,
                  {
                    color: estoqueBaixo ? C.amber : C.text,
                  },
                ]}
              >
                {minimo}
              </Text>

              <Text style={s.metricUnit}>unidades</Text>
            </View>
          </View>

          {/* AÇÕES DE ESTOQUE */}

          <View style={s.actions}>
            <TouchableOpacity
              style={s.entryButton}
              onPress={() => iniciarMovimento("ENTRADA")}
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
              onPress={() => iniciarMovimento("SAIDA")}
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

          {/* ABAS */}

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

          {/* ABA RESUMO */}

          {aba === "Resumo" ? (
            <View style={s.infoCard}>
              <Info
                label="Categoria"
                value={categoria}
              />

              <Info
                label="Fornecedor"
                value={fornecedor}
              />

              <Info
                label="Preço unitário"
                value={
                  preco != null && Number.isFinite(Number(preco))
                    ? Number(preco).toLocaleString("pt-BR", {
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

              <Info
                label="ID do produto"
                value={String(getId(produto) ?? produtoId)}
              />
            </View>
          ) : (
            /* ABA HISTÓRICO */

            <View style={s.infoCard}>
              {movimentacoes.length === 0 ? (
                <View style={s.empty}>
                  <Feather
                    name="clock"
                    size={24}
                    color={C.muted}
                  />

                  <Text style={s.muted}>
                    Nenhuma movimentação encontrada para este produto.
                  </Text>
                </View>
              ) : (
                movimentacoes.map((movimentacao, index) => {
                  const tipo = String(
                    movimentacao?.tipo ??
                      movimentacao?.tipo_movimentacao ??
                      "Movimentação"
                  );

                  const quantidade = Number(
                    movimentacao?.quantidade ?? 0
                  );

                  const entrada =
                    tipo.toUpperCase() === "ENTRADA";

                  return (
                    <View
                      key={String(
                        movimentacao?.id ??
                          movimentacao?._id ??
                          index
                      )}
                      style={[
                        s.movement,
                        index < movimentacoes.length - 1 &&
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
                          color={entrada ? C.green : C.red}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={s.movementTitle}>
                          {tipo}
                        </Text>

                        <Text style={s.muted}>
                          {dateText(
                            movimentacao?.data_hora ??
                              movimentacao?.data ??
                              movimentacao?.created_at ??
                              movimentacao?.createdAt
                          )}
                        </Text>
                      </View>

                      <Text
                        style={[
                          s.movementQty,
                          {
                            color: entrada ? C.green : C.red,
                          },
                        ]}
                      >
                        {entrada ? "+" : "−"}
                        {Math.abs(quantidade)}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ============================================================
// COMPONENTE DE INFORMAÇÃO
// ============================================================

function Info({ label, value }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>
        {String(value ?? "Não informado")}
      </Text>
    </View>
  );
}

// ============================================================
// ESTILOS
// ============================================================

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

  secondary: {
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },

  secondaryText: {
    color: C.text,
    fontWeight: "700",
  },
});
