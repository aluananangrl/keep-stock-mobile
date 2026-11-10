import { BRAND_COLORS } from "../context/colors";
import ScreenBackground from "../components/ScreenBackground";
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
  highlight: BRAND_COLORS.highlight,
  amber: "#fbbf24",
  red: "#fb7185",
};

export default function RelatoriosScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [movimentos, setMovimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async (pull = false) => {
    pull ? setRefreshing(true) : setLoading(true);
    setErro("");

    try {
      const [p, m] = await Promise.all([
        api.listarProdutos({ limit: 500 }),
        api.listarMovimentacoes({ limit: 100 }),
      ]);

      setProdutos(extractList(p));
      setMovimentos(extractList(m));
    } catch (e) {
      setErro(
        getErrorMessage(
          e,
          "Não foi possível gerar o resumo dos relatórios."
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

  // Calcula os indicadores do estoque.
  const alertas = produtos.filter(
    (p) =>
      getMinimumStock(p) > 0 &&
      getStock(p) <= getMinimumStock(p)
  );

  const unidades = produtos.reduce(
    (total, p) => total + getStock(p),
    0
  );

  // Conta as entradas e saídas retornadas pela API.
  const entradas = movimentos.filter((m) =>
    String(m.tipo || "")
      .toUpperCase()
      .includes("ENTRADA")
  ).length;

  const saidas = movimentos.filter((m) => {
    const tipo = String(m.tipo || "").toUpperCase();

    return tipo.includes("SAIDA") || tipo.includes("SAÍDA");
  }).length;

  const outros = Math.max(
    0,
    movimentos.length - entradas - saidas
  );

  return (
    <ScreenBackground>
<View style={[s.container, { backgroundColor: "transparent" }]}>
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
          <Text style={s.kicker}>ACOMPANHAMENTO</Text>
          <Text style={s.title}>Relatórios</Text>
        </View>

        <TouchableOpacity
          style={s.icon}
          onPress={() => carregar(true)}
        >
          <Feather
            name="refresh-cw"
            size={18}
            color={C.highlight}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={C.highlight} />
          <Text style={s.muted}>
            Calculando indicadores...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => carregar(true)}
              tintColor={C.highlight}
            />
          }
        >
          {/* Mensagem de erro */}
          {erro ? (
            <View style={s.error}>
              <Feather
                name="alert-circle"
                size={18}
                color={C.red}
              />

              <Text style={s.muted}>{erro}</Text>

              <TouchableOpacity onPress={() => carregar()}>
                <Text
                  style={{
                    color: C.highlight,
                    fontWeight: "700",
                  }}
                >
                  Tentar novamente
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Resumo geral */}
          <Text style={s.section}>Resumo atual</Text>

          <View style={s.grid}>
            <View style={s.metric}>
              <Feather
                name="package"
                size={19}
                color={C.highlight}
              />

              <Text style={s.value}>
                {produtos.length}
              </Text>

              <Text style={s.label}>
                Produtos cadastrados
              </Text>
            </View>

            <View style={s.metric}>
              <Feather
                name="layers"
                size={19}
                color="#93c5fd"
              />

              <Text style={s.value}>
                {unidades.toLocaleString("pt-BR")}
              </Text>

              <Text style={s.label}>
                Unidades em estoque
              </Text>
            </View>

            <View style={s.metric}>
              <Feather
                name="alert-triangle"
                size={19}
                color={C.amber}
              />

              <Text
                style={[
                  s.value,
                  { color: C.amber },
                ]}
              >
                {alertas.length}
              </Text>

              <Text style={s.label}>
                Abaixo do mínimo
              </Text>
            </View>

            <View style={s.metric}>
              <Feather
                name="activity"
                size={19}
                color="#c4b5fd"
              />

              <Text style={s.value}>
                {movimentos.length}
              </Text>

              <Text style={s.label}>
                Movimentações consultadas
              </Text>
            </View>
          </View>

          {/* Resumo das movimentações */}
          <Text style={s.section}>
            Movimentações retornadas pela API
          </Text>

          <View style={s.panel}>
            <View style={s.statLine}>
              <Text style={s.label}>
                Entradas registradas
              </Text>

              <Text
                style={[
                  s.statValue,
                  { color: C.highlight },
                ]}
              >
                {entradas}
              </Text>
            </View>

            <View style={s.separator} />

            <View style={s.statLine}>
              <Text style={s.label}>
                Saídas registradas
              </Text>

              <Text
                style={[
                  s.statValue,
                  { color: C.red },
                ]}
              >
                {saidas}
              </Text>
            </View>

            <View style={s.separator} />

            <View style={s.statLine}>
              <Text style={s.label}>Outros tipos</Text>

              <Text style={s.statValue}>
                {outros}
              </Text>
            </View>
          </View>

          {/* Observação sobre os dados */}
          <Text style={s.note}>
            Os indicadores refletem os registros devolvidos
            pela API. Para relatórios por período e
            exportação em PDF/Excel, será necessário
            implementar os filtros e o serviço de exportação
            no backend ou no aplicativo.
          </Text>

          {/* Acesso ao histórico */}
          <TouchableOpacity
            style={s.action}
            onPress={() => navigation.navigate("Historico")}
          >
            <Feather
              name="list"
              size={18}
              color="#082016"
            />

            <Text style={s.actionText}>
              Consultar histórico completo
            </Text>
          </TouchableOpacity>

          {/* Produtos com estoque baixo */}
          <Text style={s.section}>
            Produtos com estoque baixo
          </Text>

          {alertas.length === 0 ? (
            <View style={s.panel}>
              <Text style={s.muted}>
                Nenhum produto abaixo do mínimo configurado.
              </Text>
            </View>
          ) : (
            alertas.slice(0, 10).map((p, i) => (
              <TouchableOpacity
                key={String(p.id ?? p._id ?? i)}
                style={s.product}
                onPress={() =>
                  navigation.navigate("DetalhesProduto", {
                    produto: {
                      ...p,
                      nome: getProductName(p),
                      estoque: getStock(p),
                    },
                  })
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
                  <Text style={s.productName}>
                    {getProductName(p)}
                  </Text>

                  <Text style={s.label}>
                    Saldo {getStock(p)} · mínimo{" "}
                    {getMinimumStock(p)}
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
    letterSpacing: 1.4,
  },

  title: {
    color: C.text,
    fontSize: 25,
    fontWeight: "700",
    marginTop: 3,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  section: {
    color: C.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 8,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },

  metric: {
    width: "48%",
    flexGrow: 1,
    minHeight: 125,
    padding: 15,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
  },

  value: {
    color: C.text,
    fontSize: 25,
    fontWeight: "700",
    marginTop: 12,
  },

  label: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  panel: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
  },

  statLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  statValue: {
    fontSize: 17,
    fontWeight: "800",
    color: C.text,
  },

  separator: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 10,
  },

  note: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 15,
  },

  action: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: C.highlight,
    borderRadius: 13,
    padding: 14,
    marginBottom: 24,
  },

  actionText: {
    color: "#082016",
    fontSize: 13,
    fontWeight: "800",
  },

  product: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
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

  productName: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },

  muted: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
  },

  error: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    gap: 8,
  },
});
