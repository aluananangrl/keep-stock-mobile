import { BRAND_COLORS } from "../context/colors";
import ScreenBackground from "../components/ScreenBackground";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

import { useFocusEffect } from "@react-navigation/native";
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
  accent: BRAND_COLORS.highlight,
  danger: "#fb7185",
  warning: "#fbbf24",
};

function obterIdProduto(produto) {
  const id =
    produto?.id ??
    produto?.produto_id ??
    produto?.produtoId ??
    produto?.id_produto ??
    produto?._id ??
    produto?.ID;

  if (id === undefined || id === null || String(id).trim() === "") {
    return null;
  }

  return id;
}

export default function ListaProdutosScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState("");
  const requisicao = useRef(0);

  const carregar = useCallback(async (pull = false) => {
    const versao = ++requisicao.current;
    if (pull) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErro("");

    try {
      const response = await api.listarProdutos({ limit: 100, categoria_id: categoriaId });
      if (versao === requisicao.current) setProdutos(extractList(response));
    } catch (error) {
      if (versao !== requisicao.current) return;
      setErro(
        getErrorMessage(
          error,
          "Não foi possível carregar os produtos. Confira a conexão com a API."
        )
      );
    } finally {
      if (versao === requisicao.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [categoriaId]);

  useEffect(() => {
    api.listarCategorias({ limit: 100 })
      .then((response) => setCategorias(extractList(response)))
      .catch((error) => console.warn("Erro ao carregar categorias", error.code));
  }, []);

  // Atualiza a lista ao entrar na tela ou voltar dos detalhes.
  useFocusEffect(
    useCallback(() => {
      carregar();
      return () => { requisicao.current += 1; };
    }, [carregar])
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    if (!termo) {
      return produtos;
    }

    return produtos.filter((produto) => {
      const categoria =
        typeof produto?.categoria === "object"
          ? produto?.categoria?.nome ?? ""
          : produto?.categoria ?? produto?.categoria_nome ?? "";

      const texto = `
        ${getProductName(produto)}
        ${getProductCode(produto)}
        ${categoria}
      `.toLocaleLowerCase("pt-BR");

      return texto.includes(termo);
    });
  }, [produtos, busca]);

  const abrirProduto = (produto) => {
    console.log(
      "PRODUTO ORIGINAL DA API:",
      JSON.stringify(produto, null, 2)
    );

    const produtoId = obterIdProduto(produto);

    if (produtoId === null) {
      console.log("ERRO: produto sem ID válido:", produto);
      return;
    }

    const produtoSelecionado = {
      ...produto,
      id: produtoId,
      nome: getProductName(produto),
      codigo: getProductCode(produto),
      estoque: getStock(produto),
    };

    const parametros = {
      produtoId,
      produto: produtoSelecionado,
    };

    console.log(
      "PARÂMETROS ENVIADOS PARA DETALHES:",
      JSON.stringify(parametros, null, 2)
    );

    navigation.navigate("DetalhesProduto", parametros);
  };

  return (
    <ScreenBackground>
<View style={[styles.container, { backgroundColor: "transparent" }]}>
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

      {categorias.length > 0 && (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 14, paddingHorizontal: 18, paddingVertical: 10 }}>
            {[{ id: null, nome: "Todas as categorias" }, ...categorias].map((item) => (
              <TouchableOpacity key={String(item.id)} onPress={() => setCategoriaId(item.id)}
                accessibilityRole="button" accessibilityState={{ selected: item.id === categoriaId }}>
                <Text style={{ color: item.id === categoriaId ? COLORS.accent : COLORS.muted }}>
                  {item.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          {filtrados.length} produto(s)
        </Text>

        <TouchableOpacity
          onPress={() => carregar(true)}
          style={styles.refresh}
        >
          <Feather name="refresh-cw" size={14} color={COLORS.accent} />
          <Text style={styles.refreshText}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.accent} size="large" />
          <Text style={styles.muted}>Carregando produtos...</Text>
        </View>
      ) : erro ? (
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
        <View style={styles.center}>
          <Feather name="package" size={30} color={COLORS.muted} />
          <Text style={styles.stateTitle}>Nenhum produto encontrado</Text>
          <Text style={styles.muted}>
            Tente mudar a busca ou cadastre um produto pela versão
            administrativa.
          </Text>
        </View>
      ) : (
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
            const low = minimum > 0 && stock < minimum;

            const categoria =
              typeof produto?.categoria === "object"
                ? produto.categoria?.nome
                : produto?.categoria;

            const chave = String(
              obterIdProduto(produto) ??
              getProductCode(produto) ??
              index
            );

            return (
              <TouchableOpacity
                key={chave}
                style={styles.productCard}
                onPress={() => abrirProduto(produto)}
                activeOpacity={0.75}
              >
                <View style={styles.productIcon}>
                  <Feather name="package" size={20} color={COLORS.accent} />
                </View>

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

                <View style={styles.stockBlock}>
                  <Text
                    style={[
                      styles.stock,
                      low && { color: COLORS.warning },
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
    </ScreenBackground>
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
    backgroundColor: BRAND_COLORS.soft,
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
