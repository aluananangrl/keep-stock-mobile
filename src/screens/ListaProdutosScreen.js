import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

const COLORS = {
  bg: "#0b1220",
  panel: "#121d2e",
  border: "#243247",
  text: "#f1f5f9",
  muted: "#94a3b8",
  accent: "#72e0a4",
  danger: "#fb7185",
  warning: "#fbbf24",
};

export default function ListaProdutosScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState("");

  // Carrega os produtos da API
  const carregar = useCallback(
    async (pull = false) => {
      if (pull) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErro("");

      try {
        const response = await api.listarProdutos({
          busca: busca.trim() || undefined,
          limit: 100,
        });

        setProdutos(extractList(response));
      } catch (error) {
        setErro(
          getErrorMessage(
            error,
            "Não foi possível carregar os produtos. Confira a conexão com a API.",
          ),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [busca],
  );

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Filtra os produtos pelo nome, código ou categoria
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    if (!termo) {
      return produtos;
    }

    return produtos.filter((produto) => {
      const categoria = produto?.categoria?.nome || produto?.categoria || "";

      const texto = `
        ${getProductName(produto)}
        ${getProductCode(produto)}
        ${categoria}
      `.toLocaleLowerCase("pt-BR");

      return texto.includes(termo);
    });
  }, [produtos, busca]);

  // Abre os detalhes do produto selecionado
  const abrirProduto = (produto) => {
    const produtoId =
      produto?.id ??
      produto?.produto_id ??
      produto?.produtoId ??
      produto?.id_produto ??
      produto?._id;

    if (produtoId == null || String(produtoId).trim() === "") {
      console.log("Produto sem ID recebido da API:", produto);
      return;
    }

    navigation.navigate("DetalhesProduto", {
      produtoId,
      produto: {
        ...produto,
        id: produtoId,
        nome: getProductName(produto),
        codigo: getProductCode(produto),
        estoque: getStock(produto),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Voltar"
        >
          <Feather name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>CATÁLOGO</Text>

          <Text style={styles.title}>Produtos</Text>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate("Notificacoes")}
          accessibilityLabel="Notificações"
        >
          <Feather name="bell" size={19} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Campo de busca */}
      <View style={styles.search}>
        <Feather name="search" size={18} color={COLORS.muted} />

        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar por nome, código ou categoria"
          placeholderTextColor="#64748b"
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      {/* Quantidade e atualização */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{filtrados.length} produto(s)</Text>

        <TouchableOpacity onPress={() => carregar(true)} style={styles.refresh}>
          <Feather name="refresh-cw" size={14} color={COLORS.accent} />

          <Text style={styles.refreshText}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      {/* Carregamento */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.accent} size="large" />

          <Text style={styles.muted}>Carregando produtos...</Text>
        </View>
      ) : erro ? (
        /* Mensagem de erro */
        <View style={styles.stateCard}>
          <Feather name="wifi-off" size={25} color={COLORS.warning} />

          <Text style={styles.stateTitle}>Não foi possível carregar</Text>

          <Text style={styles.muted}>{erro}</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => carregar()}
          >
            <Text style={styles.primaryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : filtrados.length === 0 ? (
        /* Lista vazia */
        <View style={styles.center}>
          <Feather name="package" size={30} color={COLORS.muted} />

          <Text style={styles.stateTitle}>Nenhum produto encontrado</Text>

          <Text style={styles.muted}>
            Tente mudar a busca ou cadastre um produto pela versão
            administrativa.
          </Text>
        </View>
      ) : (
        /* Lista de produtos */
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => carregar(true)}
              tintColor={COLORS.accent}
            />
          }
        >
          {filtrados.map((produto, index) => {
            const stock = getStock(produto);
            const minimum = getMinimumStock(produto);

            const low = minimum > 0 && stock <= minimum;

            const categoria =
              typeof produto?.categoria === "object"
                ? produto.categoria?.nome
                : produto?.categoria;

            const chave = String(
              produto.id ?? produto._id ?? getProductCode(produto) ?? index,
            );

            return (
              <TouchableOpacity
                key={chave}
                style={styles.productCard}
                onPress={() => abrirProduto(produto)}
                activeOpacity={0.75}
              >
                {/* Ícone do produto */}
                <View style={styles.productIcon}>
                  <Feather name="package" size={20} color={COLORS.accent} />
                </View>

                {/* Informações */}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {getProductName(produto)}
                  </Text>

                  <Text style={styles.code}>
                    Cód. {getProductCode(produto)}
                  </Text>

                  <Text style={styles.category}>
                    {categoria || "Sem categoria"}
                  </Text>
                </View>

                {/* Estoque disponível */}
                <View style={styles.stockBlock}>
                  <Text
                    style={[
                      styles.stock,
                      low && {
                        color: COLORS.warning,
                      },
                    ]}
                  >
                    {stock}
                  </Text>

                  <Text style={styles.unit}>unidades</Text>

                  <Feather
                    name="chevron-right"
                    size={16}
                    color={COLORS.muted}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: 52,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
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

  eyebrow: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  title: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "700",
    marginTop: 3,
  },

  search: {
    marginHorizontal: 20,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    minHeight: 50,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    paddingVertical: 12,
  },

  metaRow: {
    marginHorizontal: 22,
    marginTop: 18,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  metaText: {
    color: COLORS.muted,
    fontSize: 12,
  },

  refresh: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  refreshText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: "600",
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 10,
  },

  productCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
  },

  productIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#18332b",
    alignItems: "center",
    justifyContent: "center",
  },

  productInfo: {
    flex: 1,
    gap: 3,
  },

  productName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },

  code: {
    color: COLORS.muted,
    fontSize: 11,
  },

  category: {
    color: "#64748b",
    fontSize: 11,
  },

  stockBlock: {
    alignItems: "flex-end",
    gap: 2,
  },

  stock: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
  },

  unit: {
    color: COLORS.muted,
    fontSize: 10,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 12,
  },

  muted: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },

  stateTitle: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },

  stateCard: {
    margin: 20,
    marginTop: 35,
    borderRadius: 18,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },

  primaryButton: {
    marginTop: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },

  primaryButtonText: {
    color: "#082016",
    fontWeight: "800",
    fontSize: 13,
  },
});
