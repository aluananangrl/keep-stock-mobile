import { BRAND_COLORS } from "../context/colors";
import ScreenBackground from "../components/ScreenBackground";
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
  getProductName,
  getStock,
} from "../services/responseUtils";

const C = {
  bg: "#0b1220",
  panel: "#121d2e",
  border: "#243247",
  text: "#f1f5f9",
  muted: "#94a3b8",
  highlight: BRAND_COLORS.highlight,
  amber: "#fbbf24",
  red: "#fb7185",
};

export default function NotificacoesScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState("");

  // Carrega os alertas de estoque
  const carregar = useCallback(async (pull = false) => {
    if (pull) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErro("");

    try {
      const resposta = await api.listarAlertasEstoque({
        limit: 100,
      });

      let lista = extractList(resposta);

      // Se a API não retornar alertas, verifica os produtos
      if (lista.length === 0) {
        const respostaProdutos = await api.listarProdutos({
          limit: 200,
        });

        const produtos = extractList(respostaProdutos);

        lista = produtos.filter((produto) => {
          const minimo = getMinimumStock(produto);
          const estoque = getStock(produto);

          return minimo > 0 && estoque <= minimo;
        });
      }

      setItems(lista);
    } catch (e) {
      setErro(
        getErrorMessage(
          e,
          "Não foi possível carregar os alertas."
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

  return (
    <ScreenBackground>
<View style={[s.container, { backgroundColor: "transparent" }]}>
      {/* Cabeçalho */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.icon}
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
            CENTRAL DE ALERTAS
          </Text>

          <Text style={s.title}>
            Notificações
          </Text>
        </View>

        <TouchableOpacity
          style={s.icon}
          onPress={() => carregar(true)}
          accessibilityLabel="Atualizar notificações"
        >
          <Feather
            name="refresh-cw"
            size={18}
            color={C.highlight}
          />
        </TouchableOpacity>
      </View>

      {/* Resumo dos alertas */}
      <View style={s.summary}>
        <View style={s.alertIcon}>
          <Feather
            name="alert-triangle"
            size={19}
            color={C.amber}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={s.summaryTitle}>
            Estoque abaixo do mínimo
          </Text>

          <Text style={s.muted}>
            Alertas calculados a partir dos dados cadastrados.
          </Text>
        </View>

        <Text style={s.count}>
          {items.length}
        </Text>
      </View>

      {/* Carregamento */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={C.highlight} />

          <Text style={s.muted}>
            Verificando alertas...
          </Text>
        </View>
      ) : erro ? (
        /* Mensagem de erro */
        <View style={s.center}>
          <Feather
            name="alert-circle"
            size={28}
            color={C.red}
          />

          <Text style={s.muted}>
            {erro}
          </Text>

          <TouchableOpacity
            style={s.button}
            onPress={() => carregar()}
          >
            <Text style={s.buttonText}>
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Lista de notificações */
        <ScrollView
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => carregar(true)}
              tintColor={C.highlight}
            />
          }
        >
          {items.length === 0 ? (
            <View style={s.empty}>
              <Feather
                name="check-circle"
                size={28}
                color={C.highlight}
              />

              <Text style={s.emptyTitle}>
                Nenhum alerta no momento
              </Text>

              <Text style={s.muted}>
                Não há produtos abaixo da quantidade
                mínima configurada.
              </Text>
            </View>
          ) : (
            items.map((produto, index) => {
              const estoque = getStock(produto);
              const minimo = getMinimumStock(produto);

              return (
                <TouchableOpacity
                  key={String(
                    produto.id ?? produto._id ?? index
                  )}
                  style={s.card}
                  onPress={() =>
                    navigation.navigate(
                      "DetalhesProduto",
                      {
                        produto: {
                          ...produto,
                          nome: getProductName(produto),
                          estoque,
                        },
                      }
                    )
                  }
                  activeOpacity={0.75}
                >
                  {/* Ícone do alerta */}
                  <View style={s.alertIcon}>
                    <Feather
                      name="alert-circle"
                      size={19}
                      color={C.amber}
                    />
                  </View>

                  {/* Dados do produto */}
                  <View style={{ flex: 1 }}>
                    <Text style={s.product}>
                      {getProductName(produto)}
                    </Text>

                    <Text style={s.muted}>
                      Saldo atual: {estoque} un. · mínimo:{" "}
                      {minimo} un.
                    </Text>
                  </View>

                  <Feather
                    name="chevron-right"
                    size={18}
                    color={C.muted}
                  />
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
    </ScreenBackground>
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
    marginBottom: 20,
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
    color: C.highlight,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  title: {
    color: C.text,
    fontSize: 25,
    fontWeight: "700",
    marginTop: 3,
  },

  summary: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 15,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    marginBottom: 18,
  },

  alertIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#3a3220",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },

  muted: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
  },

  count: {
    color: C.amber,
    fontSize: 22,
    fontWeight: "800",
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 10,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
  },

  product: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 12,
    backgroundColor: C.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
  },

  emptyTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: "700",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },

  button: {
    backgroundColor: C.highlight,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  buttonText: {
    color: "#082016",
    fontWeight: "800",
  },
});
