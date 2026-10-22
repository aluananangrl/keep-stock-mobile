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

export default function FornecedoresScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState("");

  // Carrega a lista de fornecedores da API.
  const carregar = useCallback(async (pull = false) => {
    if (pull) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErro("");

    try {
      const resposta = await api.listarFornecedores({
        limit: 200,
      });

      setItems(extractList(resposta));
    } catch (e) {
      setErro(
        getErrorMessage(
          e,
          "Não foi possível carregar os fornecedores."
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

  // Filtra os fornecedores conforme o texto digitado.
  const filtrados = useMemo(
    () =>
      items.filter((fornecedor) => {
        const dados = `
          ${fornecedor.nome || fornecedor.name || ""}
          ${fornecedor.cnpj || ""}
          ${fornecedor.email || ""}
          ${fornecedor.telefone || fornecedor.contato || ""}
        `;

        return dados
          .toLocaleLowerCase("pt-BR")
          .includes(busca.toLocaleLowerCase("pt-BR"));
      }),
    [items, busca]
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
          <Text style={s.kicker}>
            CADEIA DE SUPRIMENTOS
          </Text>

          <Text style={s.title}>
            Fornecedores
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

      {/* Campo de pesquisa */}
      <View style={s.search}>
        <Feather
          name="search"
          size={17}
          color={C.muted}
        />

        <TextInput
          style={s.input}
          value={busca}
          onChangeText={setBusca}
          placeholder="Nome, CNPJ ou contato"
          placeholderTextColor="#64748b"
        />
      </View>

      {/* Resumo dos fornecedores */}
      <View style={s.summary}>
        <Text style={s.summaryLabel}>
          Fornecedores cadastrados
        </Text>

        <Text style={s.summaryValue}>
          {items.length}
        </Text>
      </View>

      {/* Carregamento */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={C.green} />

          <Text style={s.muted}>
            Carregando fornecedores...
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
        /* Lista de fornecedores */
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
              Nenhum fornecedor encontrado na API.
            </Text>
          ) : (
            filtrados.map((fornecedor, index) => {
              const inativo =
                fornecedor.ativo === false ||
                String(fornecedor.status || "")
                  .toLowerCase()
                  .includes("inativo");

              return (
                <View
                  key={String(
                    fornecedor.id ??
                      fornecedor._id ??
                      fornecedor.cnpj ??
                      index
                  )}
                  style={s.card}
                >
                  {/* Ícone */}
                  <View style={s.avatar}>
                    <Feather
                      name="truck"
                      size={19}
                      color={C.green}
                    />
                  </View>

                  {/* Dados do fornecedor */}
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>
                      {fornecedor.nome ||
                        fornecedor.name ||
                        "Fornecedor sem nome"}
                    </Text>

                    <Text style={s.detail}>
                      {fornecedor.cnpj
                        ? `CNPJ: ${fornecedor.cnpj}`
                        : "CNPJ não informado"}
                    </Text>

                    <Text style={s.detail}>
                      {fornecedor.email ||
                        fornecedor.telefone ||
                        fornecedor.contato ||
                        "Sem contato cadastrado"}
                    </Text>
                  </View>

                  {/* Situação do fornecedor */}
                  <View
                    style={[
                      s.status,
                      {
                        backgroundColor: inativo
                          ? "#3a202b"
                          : "#18332b",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: inativo
                          ? C.red
                          : C.green,
                        fontSize: 10,
                        fontWeight: "700",
                      }}
                    >
                      {inativo ? "Inativo" : "Ativo"}
                    </Text>
                  </View>
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
    letterSpacing: 1.1,
  },

  title: {
    color: C.text,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 3,
  },

  search: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 13,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 13,
  },

  input: {
    flex: 1,
    color: C.text,
    paddingVertical: 13,
    fontSize: 13,
  },

  summary: {
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 8,
    padding: 16,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
  },

  summaryLabel: {
    color: C.muted,
    fontSize: 11,
  },

  summaryValue: {
    color: C.text,
    fontSize: 25,
    fontWeight: "700",
    marginTop: 6,
  },

  list: {
    paddingHorizontal: 20,
    paddingTop: 10,
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
    borderRadius: 15,
  },

  avatar: {
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
    fontWeight: "700",
    marginBottom: 5,
  },

  detail: {
    color: C.muted,
    fontSize: 11,
    marginTop: 2,
  },

  status: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
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
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  buttonText: {
    color: "#082016",
    fontWeight: "800",
  },
});
