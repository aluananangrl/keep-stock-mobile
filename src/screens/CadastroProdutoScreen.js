import { BRAND_COLORS } from "../context/colors";
import ScreenBackground from "../components/ScreenBackground";
import React, { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
  gerarCodigoProduto,
  normalizarCodigoProduto,
  CODIGO_PRODUTO_REGEX,
} from "../services/codigoProduto";

import { extractList, getErrorMessage } from "../services/responseUtils";

const C = {
  bg: "#0b1220",
  panel: "#121d2e",
  border: "#243247",
  text: "#f1f5f9",
  muted: "#94a3b8",
  highlight: BRAND_COLORS.highlight,
  red: "#fb7185",
};

export default function CadastroProdutoScreen({ navigation, route }) {
  const produto = route?.params?.produto;
  const editando = produto?.id != null;
  const [nome, setNome] = useState(produto?.nome ?? "");
  const [codigo, setCodigo] = useState(
    produto?.codigo ?? produto?.codigo_barras ?? "",
  );
  const [descricao, setDescricao] = useState(produto?.descricao ?? "");
  const [preco, setPreco] = useState(
    String(produto?.preco ?? produto?.preco_unitario ?? ""),
  );
  const [quantidade, setQuantidade] = useState("0");
  const [minimo, setMinimo] = useState(String(produto?.quantidade_minima ?? 0));

  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  const [categoria, setCategoria] = useState(null);
  const [fornecedor, setFornecedor] = useState(null);

  const [seletor, setSeletor] = useState("");
  const [carregandoListas, setCarregandoListas] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const carregarListas = useCallback(async () => {
    setCarregandoListas(true);
    setErro("");

    try {
      const [resCategorias, resFornecedores] = await Promise.all([
        api.listarCategorias({ limit: 200 }),
        api.listarFornecedores({ limit: 200 }),
      ]);

      const listaCategorias = extractList(resCategorias);
      const listaFornecedores = extractList(resFornecedores);
      setCategorias(listaCategorias);
      setFornecedores(listaFornecedores);
      if (produto?.categoria_id != null) {
        setCategoria(
          (atual) =>
            atual ?? {
              id: produto.categoria_id,
              nome: produto.categoria_nome ?? produto.categoria?.nome,
            },
        );
      }
      if (produto?.fornecedor_id != null) {
        setFornecedor(
          (atual) =>
            atual ?? {
              id: produto.fornecedor_id,
              nome: produto.fornecedor_nome ?? produto.fornecedor?.nome,
            },
        );
      }
    } catch (e) {
      setErro(
        getErrorMessage(
          e,
          "Não foi possível carregar categorias e fornecedores.",
        ),
      );
    } finally {
      setCarregandoListas(false);
    }
  }, [produto]);

  useEffect(() => {
    carregarListas();
  }, [carregarListas]);

  const obterId = (item) =>
    item?.id ?? item?._id ?? item?.categoria_id ?? item?.fornecedor_id;

  const obterNome = (item) => item?.nome ?? item?.name ?? "Sem nome";

  const validarInteiro = (valor) => {
    if (String(valor).trim() === "") return null;

    const numero = Number(valor);

    if (!Number.isSafeInteger(numero) || numero < 0) {
      return null;
    }

    return numero;
  };

  const cadastrar = async () => {
    if (!nome.trim()) {
      Alert.alert("Campo obrigatório", "Informe o nome do produto.");
      return;
    }

    const codigoUnico = normalizarCodigoProduto(codigo);
    if (!codigoUnico) {
      Alert.alert("Campo obrigatório", "Informe o código do produto.");
      return;
    }

    if (!CODIGO_PRODUTO_REGEX.test(codigoUnico)) {
      Alert.alert(
        "Código inválido",
        "Use três letras, hífen e quatro números. Ex.: PRU-0548.",
      );
      return;
    }

    const precoNumero = Number(
      String(preco).replace(/\s/g, "").replace(",", "."),
    );
    if (!preco.trim() || !Number.isFinite(precoNumero) || precoNumero < 0) {
      Alert.alert("Preço inválido", "Digite um preço válido, como 19,90.");
      return;
    }

    if (!categoria || obterId(categoria) == null) {
      Alert.alert("Categoria obrigatória", "Selecione uma categoria.");
      return;
    }

    if (!fornecedor || obterId(fornecedor) == null) {
      Alert.alert("Fornecedor obrigatório", "Selecione um fornecedor.");
      return;
    }

    const quantidadeInicial = validarInteiro(quantidade);
    const quantidadeMinima = validarInteiro(minimo);

    if (quantidadeInicial === null || quantidadeMinima === null) {
      Alert.alert(
        "Quantidade inválida",
        "O estoque inicial e o mínimo devem ser números inteiros iguais ou maiores que zero.",
      );
      return;
    }

    const dados = {
      nome: nome.trim(),
      codigo: codigoUnico,
      preco: precoNumero,
      descricao: descricao.trim() || null,
      categoria_id: obterId(categoria),
      fornecedor_id: obterId(fornecedor),
      ...(!editando && { quantidade_atual: quantidadeInicial }),
      quantidade_minima: quantidadeMinima,
      // Mantém compatibilidade com APIs que utilizam codigo_barras.
      codigo_barras: codigoUnico,
    };

    setSalvando(true);
    setErro("");

    try {
      const response = editando
        ? await api.atualizarProduto(produto.id, dados)
        : await api.criarProduto(dados);

      const recebido =
        response?.data?.produto ??
        response?.data?.data?.produto ??
        response?.data?.data ??
        response?.data;
      const produtoSalvo = {
        ...(typeof recebido === "object" &&
        recebido !== null &&
        !Array.isArray(recebido)
          ? recebido
          : {}),
        ...dados,
        id: recebido?.id ?? recebido?.produto_id ?? produto?.id,
      };

      Alert.alert(
        editando ? "Produto atualizado" : "Produto cadastrado",
        "O produto foi salvo com sucesso.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("QRCodeProduto", { produto: produtoSalvo }),
          },
        ],
      );
    } catch (e) {
      const mensagem = getErrorMessage(e, "Não foi possível salvar o produto.");

      setErro(mensagem);
      Alert.alert("Erro ao salvar", mensagem);
    } finally {
      setSalvando(false);
    }
  };

  const opcoes = seletor === "categoria" ? categorias : fornecedores;

  const itemSelecionado = seletor === "categoria" ? categoria : fornecedor;

  const selecionar = (item) => {
    if (seletor === "categoria") {
      setCategoria(item);
    } else {
      setFornecedor(item);
    }

    setSeletor("");
  };

  const campo = (label, valor, alterar, placeholder, opcoes = {}) => (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>

      <TextInput
        style={[s.input, opcoes.multiline && s.multiline]}
        value={valor}
        onChangeText={alterar}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        keyboardType={opcoes.keyboardType || "default"}
        multiline={opcoes.multiline || false}
        textAlignVertical={opcoes.multiline ? "top" : "center"}
        maxLength={opcoes.maxLength}
        editable={!salvando}
        autoCapitalize={opcoes.autoCapitalize || "sentences"}
      />
    </View>
  );

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={[s.container, { backgroundColor: "transparent" }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.header}>
          <TouchableOpacity
            style={s.back}
            onPress={() => navigation.goBack()}
            disabled={salvando}
          >
            <Feather name="arrow-left" size={21} color={C.text} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={s.kicker}>GESTÃO DE ESTOQUE</Text>
            <Text style={s.title}>
              {editando ? "Editar produto" : "Novo produto"}
            </Text>
          </View>

          <View style={s.headerIcon}>
            <Feather name="package" size={21} color={C.highlight} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.intro}>
            <Text style={s.sectionTitle}>Dados do produto</Text>
            <Text style={s.helper}>
              Preencha os campos para cadastrar um novo item no inventário.
            </Text>
          </View>

          {campo("Nome *", nome, setNome, "Ex.: Teclado sem fio", {
            maxLength: 200,
          })}

          <View style={s.field}>
            <Text style={s.label}>Código único do produto *</Text>
            <View style={s.codigoRow}>
              <TextInput
                style={[s.input, s.codigoInput]}
                value={codigo}
                onChangeText={(texto) =>
                  setCodigo(normalizarCodigoProduto(texto))
                }
                placeholder="Ex.: PRU-0548"
                placeholderTextColor="#64748b"
                autoCapitalize="characters"
                maxLength={8}
                editable={!salvando}
              />
              <TouchableOpacity
                style={s.gerarButton}
                accessibilityLabel="Gerar novo código do produto"
                onPress={() => setCodigo(gerarCodigoProduto())}
                disabled={salvando}
              >
                <Feather name="refresh-cw" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={s.helper}>
              Um código para o QR Code e o código de barras (Code 128).
            </Text>
          </View>

          {campo("Preço (R$) *", preco, setPreco, "Ex.: 29,90", {
            keyboardType: "decimal-pad",
          })}

          {campo(
            "Descrição",
            descricao,
            setDescricao,
            "Detalhes do produto (opcional)",
            { multiline: true, maxLength: 2000 },
          )}

          <View style={s.field}>
            <Text style={s.label}>Categoria *</Text>

            <TouchableOpacity
              style={s.select}
              onPress={() => setSeletor("categoria")}
              disabled={salvando || carregandoListas}
            >
              <Text
                style={[s.selectText, !categoria && s.placeholder]}
                numberOfLines={1}
              >
                {categoria ? obterNome(categoria) : "Selecione uma categoria"}
              </Text>

              <Feather name="chevron-down" size={18} color={C.muted} />
            </TouchableOpacity>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Fornecedor *</Text>

            <TouchableOpacity
              style={s.select}
              onPress={() => setSeletor("fornecedor")}
              disabled={salvando || carregandoListas}
            >
              <Text
                style={[s.selectText, !fornecedor && s.placeholder]}
                numberOfLines={1}
              >
                {fornecedor ? obterNome(fornecedor) : "Selecione um fornecedor"}
              </Text>

              <Feather name="chevron-down" size={18} color={C.muted} />
            </TouchableOpacity>
          </View>

          {carregandoListas ? (
            <View style={s.inlineLoading}>
              <ActivityIndicator color={C.highlight} />
              <Text style={s.helper}>
                Carregando categorias e fornecedores...
              </Text>
            </View>
          ) : (
            <>
              {categorias.length === 0 && (
                <Text style={s.warning}>
                  Nenhuma categoria encontrada. Cadastre uma categoria antes de
                  criar o produto.
                </Text>
              )}

              {fornecedores.length === 0 && (
                <Text style={s.warning}>
                  Nenhum fornecedor encontrado. Cadastre um fornecedor antes de
                  criar o produto.
                </Text>
              )}

              {erro ? (
                <TouchableOpacity
                  style={s.retry}
                  onPress={carregarListas}
                  disabled={salvando}
                >
                  <Text style={s.retryText}>
                    Recarregar categorias e fornecedores
                  </Text>
                </TouchableOpacity>
              ) : null}
            </>
          )}

          <View style={s.divider} />

          <Text style={s.sectionTitle}>Controle de estoque</Text>

          <Text style={s.helper}>
            Informe quantidades inteiras iguais ou maiores que zero.
          </Text>

          <View style={s.quantityRow}>
            {!editando && (
              <View style={{ flex: 1 }}>
                {campo("Estoque inicial", quantidade, setQuantidade, "0", {
                  keyboardType: "numeric",
                })}
              </View>
            )}

            <View style={{ flex: 1 }}>
              {campo("Estoque mínimo", minimo, setMinimo, "0", {
                keyboardType: "numeric",
              })}
            </View>
          </View>

          {erro ? (
            <View style={s.errorBox}>
              <Feather name="alert-circle" size={18} color={C.red} />
              <Text style={s.errorText}>{erro}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[s.saveButton, (salvando || carregandoListas) && s.disabled]}
            onPress={cadastrar}
            disabled={salvando || carregandoListas}
            activeOpacity={0.8}
          >
            {salvando ? (
              <ActivityIndicator color={C.bg} />
            ) : (
              <Feather name="check" size={19} color={C.bg} />
            )}

            <Text style={s.saveText}>
              {salvando ? "Salvando produto..." : "Salvar produto"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={salvando}
          >
            <Text style={s.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal
          visible={Boolean(seletor)}
          transparent
          animationType="fade"
          onRequestClose={() => setSeletor("")}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>
                  {seletor === "categoria"
                    ? "Selecionar categoria"
                    : "Selecionar fornecedor"}
                </Text>

                <TouchableOpacity onPress={() => setSeletor("")}>
                  <Feather name="x" size={22} color={C.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={s.modalList}>
                {opcoes.map((item, index) => {
                  const id = obterId(item);
                  const chave = String(id ?? index);
                  const selecionado =
                    String(id) === String(obterId(itemSelecionado));

                  return (
                    <TouchableOpacity
                      key={chave}
                      style={s.option}
                      onPress={() => selecionar(item)}
                    >
                      <Text style={s.optionText}>{obterNome(item)}</Text>

                      {selecionado ? (
                        <Feather name="check" size={18} color={C.highlight} />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}

                {opcoes.length === 0 ? (
                  <Text style={s.helper}>Nenhum registro disponível.</Text>
                ) : null}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  codigoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  codigoInput: {
    flex: 1,
    backgroundColor: "#15223b",
    borderWidth: 1,
    borderColor: "#526391",
    borderRadius: 13,
    minHeight: 54,
    color: "#fff",
    paddingHorizontal: 15,
  },
  gerarButton: {
    width: 54,
    height: 54,
    borderRadius: 13,
    backgroundColor: "#6754f5",
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 54 : 24,
    paddingBottom: 18,
  },

  back: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: BRAND_COLORS.soft,
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
    fontSize: 24,
    fontWeight: "700",
    marginTop: 3,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  intro: {
    marginBottom: 18,
  },

  sectionTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },

  helper: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
  },

  field: {
    marginBottom: 15,
  },

  label: {
    color: C.text,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: C.text,
    fontSize: 14,
    minHeight: 47,
  },

  multiline: {
    minHeight: 90,
    paddingTop: 12,
  },

  select: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 13,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
  },

  selectText: {
    color: C.text,
    fontSize: 13,
    flex: 1,
  },

  placeholder: {
    color: "#64748b",
  },

  inlineLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },

  warning: {
    color: "#fbbf24",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },

  retry: {
    alignSelf: "flex-start",
    paddingVertical: 9,
    marginBottom: 10,
  },

  retryText: {
    color: C.highlight,
    fontSize: 12,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 20,
  },

  quantityRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 15,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    backgroundColor: "#301d28",
    borderWidth: 1,
    borderColor: "#613044",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },

  errorText: {
    flex: 1,
    color: C.red,
    fontSize: 12,
    lineHeight: 18,
  },

  saveButton: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: C.highlight,
    borderRadius: 13,
    marginTop: 10,
  },

  saveText: {
    color: C.bg,
    fontSize: 14,
    fontWeight: "800",
  },

  disabled: {
    opacity: 0.6,
  },

  cancelButton: {
    minHeight: 45,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  cancelText: {
    color: C.muted,
    fontSize: 13,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 22,
  },

  modalCard: {
    maxHeight: "75%",
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 16,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  modalTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },

  modalList: {
    marginTop: 8,
  },

  option: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  optionText: {
    color: C.text,
    fontSize: 13,
    flex: 1,
  },
});
