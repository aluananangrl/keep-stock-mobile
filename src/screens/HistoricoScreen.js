 
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
} from "../services/responseUtils";

const C = {
  bg: "#0b1220",
  panel: "#121d2e",
  border: "#243247",
  text: "#f1f5f9",
  muted: "#94a3b8",
  green: "#72e0a4",
  red: "#fb7185",
};

export default function HistoricoScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [busca, setBusca] = useState("");
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
      const historico = extractList(
        await api.listarHistorico({ limit: 100 })
      );

      if (historico.length > 0) {
        setItems(historico);
      } else {
        const movimentacoes = extractList(
          await api.listarMovimentacoes({ limit: 100 })
        );

        setItems(movimentacoes);
      }
    } catch (e) {
      setErro(
        getErrorMessage(
          e,
          "Não foi possível carregar o histórico."
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

  const filtrados = useMemo(() => {
    const termo = busca.toLocaleLowerCase("pt-BR");

    return items.filter((x) => {
      const texto = `
        ${x.produto?.nome || x.produto_nome || x.nome_produto || ""}
        ${x.usuario?.nome || x.responsavel || ""}
        ${x.tipo || ""}
        ${x.observacoes || ""}
      `.toLocaleLowerCase("pt-BR");

      return texto.includes(termo);
    });
  }, [items, busca]);

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
          <Text style={s.kicker}>AUDITORIA</Text>
          <Text style={s.title}>Histórico</Text>
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

      {/* Campo de pesquisa */}
      <View style={s.search}>
        <Feather
          name="search"
          color={C.muted}
          size={17}
        />

        <TextInput
          style={s.input}
          value={busca}
          onChangeText={setBusca}
          placeholder="Produto, usuário ou tipo"
          placeholderTextColor="#64748b"
        />
      </View>

      <Text style={s.count}>
        {filtrados.length} registro(s)
      </Text>

      {/* Carregamento */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={C.green} />

          <Text style={s.muted}>
            Carregando histórico...
          </Text>
        </View>
      ) : erro ? (
        /* Erro ao carregar */
        <View style={s.center}>
          <Feather
            name="alert-circle"
            color={C.red}
            size={28}
          />

          <Text style={s.muted}>{erro}</Text>

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
        /* Lista do histórico */
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
          {filtrados.length === 0 ? (
            <Text style={s.muted}>
              Nenhum registro encontrado.
            </Text>
          ) : (
            filtrados.map((x, i) => {
              const tipo = String(
                x.tipo || x.acao || "Movimentação"
              ).toUpperCase();

              const entrada = tipo.includes("ENTRADA");

              const nomeProduto =
                x.produto?.nome ||
                x.produto_nome ||
                x.nome_produto ||
                "Registro de estoque";

              const nomeUsuario =
                x.usuario?.nome ||
                x.responsavel ||
                "Usuário não informado";

              const data =
                x.data_hora ||
                x.createdAt ||
                x.data ||
                "Data não informada";

              return (
                <View
                  key={String(x.id ?? x._id ?? i)}
                  style={s.card}
                >
                  {/* Ícone do tipo de movimentação */}
                  <View
                    style={[
                      s.badge,
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
                      size={18}
                      color={entrada ? C.green : C.red}
                    />
                  </View>

                  {/* Informações do registro */}
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>
                      {nomeProduto}
                    </Text>

                    <Text style={s.detail}>
                      {tipo} · {nomeUsuario}
                    </Text>

                    <Text style={s.date}>
                      {data}
                    </Text>

                    {x.observacoes ? (
                      <Text style={s.detail}>
                        {x.observacoes}
                      </Text>
                    ) : null}
                  </View>

                  {/* Quantidade movimentada */}
                  <Text
                    style={[
                      s.qty,
                      {
                        color: entrada ? C.green : C.red,
                      },
                    ]}
                  >
                    {x.quantidade ?? "—"}
                  </Text>
                </View>
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
    color: C.green,
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

  search: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.panel,
    borderRadius: 13,
    paddingHorizontal: 13,
  },

  input: {
    flex: 1,
    color: C.text,
    paddingVertical: 13,
    fontSize: 13,
  },

  count: {
    color: C.muted,
    fontSize: 12,
    marginHorizontal: 22,
    marginTop: 17,
    marginBottom: 10,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 10,
  },

  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
  },

  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    color: C.text,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },

  detail: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 16,
  },

  date: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 5,
  },

  qty: {
    fontSize: 15,
    fontWeight: "800",
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
    lineHeight: 19,
    textAlign: "center",
  },

  button: {
    backgroundColor: C.green,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },

  buttonText: {
    color: "#082016",
    fontWeight: "800",
  },
});
