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
import { usePermissoesEstoque } from "../services/usePermissoesEstoque";

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
  const { podeEditar } = usePermissoesEstoque();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState("");

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

  // Atualiza o inventário quando a tela recebe foco novamente.
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      carregar();
    });

    return unsubscribe;
  }, [navigation, carregar]);

  const baixo = produtos.filter((produto) => {
    const minimo = getMinimumStock(produto);
    const estoque = getStock(produto);

    return minimo > 0 && estoque < minimo;
  });

  const abrirCadastro = () => {
    navigation.navigate("CadastroProduto");
  };

  const abrirDetalhes = (produto, estoque) => {
    navigation.navigate("DetalhesProduto", {
      produto: {
        ...produto,
        id:
          produto.id ??
          produto._id ??
          produto.produto_id,
        nome: getProductName(produto),
        codigo: getProductCode(produto),
        estoque,
        quantidade_atual: estoque,
      },
    });
  };

  return (
    <View style={s.container}>
      {/* Cabeçalho */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.icon}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          accessibilityLabel="Voltar"
        >
          <Feather
            name="arrow-left"
            size={20}
            color={C.text}
          />
        </TouchableOpacity>

        <View style={s.headerTitle}>
          <Text style={s.kicker}>
            VISÃO DO ESTOQUE
          </Text>

          <Text style={s.title}>
            Inventário
          </Text>
        </View>

        <View style={s.headerActions}>
          {podeEditar && <TouchableOpacity
            style={s.addButton}
            onPress={abrirCadastro}
            activeOpacity={0.8}
            accessibilityLabel="Cadastrar novo produto"
          >
            <Feather
              name="plus"
              size={18}
              color={C.bg}
            />

            <Text style={s.addButtonText}>
              Novo produto
            </Text>
          </TouchableOpacity>}

          <TouchableOpacity
            style={s.icon}
            onPress={() => carregar(true)}
            activeOpacity={0.8}
            accessibilityLabel="Atualizar inventário"
          >
            <Feather
              name="refresh-cw"
              size={18}
              color={C.green}
            />
          </TouchableOpacity>
        </View>
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

      {/* Carregamento */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator
            color={C.green}
            size="large"
          />

          <Text style={s.muted}>
            Consultando estoque...
          </Text>
        </View>
      ) : erro ? (
        /* Erro da API */
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
            activeOpacity={0.8}
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
              colors={[C.green]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {produtos.length === 0 ? (
            <View style={s.empty}>
              <Feather
                name="package"
                size={36}
                color={C.muted}
              />

              <Text style={s.emptyTitle}>
                Nenhum produto cadastrado
              </Text>

              <Text style={s.muted}>
                {podeEditar ? "Cadastre seu primeiro produto para começar a controlar o estoque." : "Ainda não há produtos para exibir."}
              </Text>

              {podeEditar && <TouchableOpacity
                style={s.emptyButton}
                onPress={abrirCadastro}
                activeOpacity={0.8}
              >
                <Feather
                  name="plus"
                  size={18}
                  color={C.bg}
                />

                <Text style={s.emptyButtonText}>
                  Cadastrar produto
                </Text>
              </TouchableOpacity>}
            </View>
          ) : (
            produtos.map((produto, i) => {
              const estoque = getStock(produto);
              const minimo = getMinimumStock(produto);

              const estoqueBaixo =
                minimo > 0 && estoque < minimo;

              const status = estoqueBaixo
                ? "Baixo"
                : "Disponível";

              const chave = String(
                produto.id ??
                  produto._id ??
                  produto.produto_id ??
                  getProductCode(produto) ??
                  i
              );

              return (
                <TouchableOpacity
                  key={chave}
                  style={s.row}
                  onPress={() =>
                    abrirDetalhes(produto, estoque)
                  }
                  activeOpacity={0.75}
                >
                  <View style={s.box}>
                    <Feather
                      name="package"
                      size={18}
                      color={C.green}
                    />
                  </View>

                  <View style={s.productInfo}>
                    <Text
                      style={s.name}
                      numberOfLines={2}
                    >
                      {getProductName(produto)}
                    </Text>

                    <Text style={s.code}>
                      Código: {getProductCode(produto)}
                    </Text>

                    <Text style={s.code}>
                      Mínimo: {minimo} un.
                    </Text>
                  </View>

                  <View style={s.right}>
                    <Text style={s.quantity}>
                      {estoque}
                    </Text>

                    <Text
                      style={[
                        s.status,
                        {
                          color: estoqueBaixo
                            ? C.amber
                            : C.green,
                        },
                      ]}
                    >
                      {status}
                    </Text>

                    <Feather
                      name="chevron-right"
                      size={16}
                      color={C.muted}
                    />
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
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 22,
  },

  headerTitle: {
    flex: 1,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  icon: {
    width: 40,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: C.green,
    paddingHorizontal: 9,
    height: 42,
    borderRadius: 13,
  },

  addButtonText: {
    color: C.bg,
    fontSize: 11,
    fontWeight: "700",
  },

  kicker: {
    fontSize: 10,
    color: C.green,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  title: {
    fontSize: 23,
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
    flexGrow: 1,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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

  productInfo: {
    flex: 1,
  },

  name: {
    color: C.text,
    fontSize: 14,
    fontWeight: "600",
  },

  code: {
    color: C.muted,
    fontSize: 11,
    marginTop: 4,
  },

  right: {
    alignItems: "flex-end",
    gap: 4,
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

  empty: {
    flex: 1,
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
  },

  emptyTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },

  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.green,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 6,
  },

  emptyButtonText: {
    color: C.bg,
    fontSize: 13,
    fontWeight: "700",
  },
});
