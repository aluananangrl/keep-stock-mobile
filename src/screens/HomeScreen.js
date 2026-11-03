
import { useCallback, useMemo, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

import api from "../services/api";

import {
  extractList,
  getMinimumStock,
  getProductCode,
  getProductName,
  getStock,
} from "../services/responseUtils";

import { useTheme } from "../context/ThemeContext";

import SidebarModal from "../components/SidebarModal";
import KeepStockBottomNav from "../components/KeepStockBottomNav";

// ============================================================
// IMAGEM DE FUNDO - MESMO MÉTODO DO LOGIN
// ============================================================

import fundoGeral from "../../assets/fundo-geral.png";

// ============================================================
// CONFIGURAÇÕES DE STATUS
// ============================================================

const STATUS_CONFIG = {
  critico: {
    label: "CRÍTICO",
    bg: "#482333",
    color: "#FF829A",
  },
  baixo: {
    label: "BAIXO",
    bg: "#463821",
    color: "#FFCA69",
  },
  normal: {
    label: "NORMAL",
    bg: "#1D4633",
    color: "#70EBA4",
  },
};

// ============================================================
// IDENTIFICAR ID DO PRODUTO
// ============================================================

function obterIdProduto(produto) {
  const id =
    produto?.id ??
    produto?.produto_id ??
    produto?.produtoId ??
    produto?.id_produto ??
    produto?._id ??
    produto?.ID;

  if (
    id === undefined ||
    id === null ||
    String(id).trim() === ""
  ) {
    return null;
  }

  return id;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  // ==========================================================
  // PALETA DE CORES
  // ==========================================================

  const palette = isDarkTheme
    ? {
        background: "#090F20",
        text: "#F4F5FF",
        muted: "#9DA9C4",
        card: "rgba(21, 32, 57, 0.94)",
        cardSoft: "rgba(32, 44, 73, 0.95)",
        border: "#354466",
        accent: "#AAA8FF",
      }
    : {
        background: "#F5F7FC",
        text: "#20273C",
        muted: "#697792",
        card: "rgba(255, 255, 255, 0.96)",
        cardSoft: "rgba(236, 240, 250, 0.96)",
        border: "#DCE3F0",
        accent: "#6254E8",
      };

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [usuario, setUsuario] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [movimentosCount, setMovimentosCount] = useState(0);
  const [busca, setBusca] = useState("");
  const [erroEstoque, setErroEstoque] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  // ==========================================================
  // BUSCAR USUÁRIO
  // ==========================================================

  const carregarUsuario = useCallback(async () => {
    try {
      const response = await api.me();

      const dadosUsuario =
        response?.data?.user ??
        response?.data?.usuario ??
        response?.data?.data?.user ??
        response?.data;

      setUsuario(dadosUsuario ?? null);
    } catch (error) {
      console.log(
        "ERRO AO BUSCAR USUÁRIO:",
        error?.response?.data ?? error?.message
      );
    }
  }, []);

  // ==========================================================
  // BUSCAR DADOS DO ESTOQUE
  // ==========================================================

  const carregarResumoEstoque = useCallback(async () => {
    try {
      const [resProdutos, resMovimentos] = await Promise.all([
        api.listarProdutos({ limit: 200 }),
        api.listarMovimentacoes({ limit: 1000 }),
      ]);

      const listaProdutos = extractList(resProdutos);
      const listaMovimentos = extractList(resMovimentos);

      setProdutos(listaProdutos);

      const dadosMovimentos = resMovimentos?.data;

      const totalMovimentos =
        dadosMovimentos?.total ??
        dadosMovimentos?.pagination?.total ??
        dadosMovimentos?.data?.total ??
        listaMovimentos.length;

      setMovimentosCount(Number(totalMovimentos) || 0);
      setErroEstoque(false);
    } catch (error) {
      console.log(
        "ERRO AO BUSCAR ESTOQUE:",
        error?.response?.data ?? error?.message
      );

      setErroEstoque(true);
    } finally {
      setCarregando(false);
    }
  }, []);

  // ==========================================================
  // ATUALIZAR AO ABRIR A HOME
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      carregarUsuario();
      carregarResumoEstoque();
    }, [carregarUsuario, carregarResumoEstoque])
  );

  // ==========================================================
  // ATUALIZAR ARRASTANDO PARA BAIXO
  // ==========================================================

  async function handleAtualizar() {
    setAtualizando(true);

    try {
      await Promise.all([
        carregarUsuario(),
        carregarResumoEstoque(),
      ]);
    } finally {
      setAtualizando(false);
    }
  }

  // ==========================================================
  // INDICADORES DO ESTOQUE
  // ==========================================================

  const resumo = useMemo(() => {
    let totalAlertas = 0;
    let totalUnidades = 0;

    produtos.forEach((produto) => {
      const estoque = getStock(produto);
      const minimo = getMinimumStock(produto);

      totalUnidades += estoque;

      if (minimo > 0 && estoque <= minimo) {
        totalAlertas++;
      }
    });

    return {
      totalProdutos: produtos.length,
      totalAlertas,
      totalUnidades,
    };
  }, [produtos]);

  // ==========================================================
  // FILTRAR PRODUTOS
  // ==========================================================

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    return produtos
      .filter((produto) => {
        const nome = getProductName(produto);
        const codigo = getProductCode(produto);

        return (
          !termo ||
          `${nome} ${codigo}`
            .toLocaleLowerCase("pt-BR")
            .includes(termo)
        );
      })
      .slice(0, 5)
      .map((produto) => {
        const quantidade = getStock(produto);
        const minimo = getMinimumStock(produto);

        let status = "normal";

        if (minimo > 0 && quantidade <= minimo) {
          status = quantidade === 0 ? "critico" : "baixo";
        }

        return {
          ...produto,
          id: obterIdProduto(produto),
          nome: getProductName(produto),
          codigo: getProductCode(produto),
          estoque: quantidade,
          status,
        };
      });
  }, [produtos, busca]);

  // ==========================================================
  // ABRIR DETALHES DO PRODUTO
  // ==========================================================

  function abrirProduto(produto) {
    const produtoId = obterIdProduto(produto);

    if (produtoId === null) {
      console.log("Produto sem ID válido:", produto);
      return;
    }

    navigation.navigate("DetalhesProduto", {
      produtoId,
      produto: {
        ...produto,
        id: produtoId,
      },
    });
  }

  // ==========================================================
  // COMPONENTE DE INDICADOR
  // ==========================================================

  function renderIndicador({
    titulo,
    valor,
    icone,
    cor,
    fundoIcone,
  }) {
    return (
      <View
        style={[
          styles.statCard,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
          },
        ]}
      >
        <View
          style={[
            styles.statIconBox,
            { backgroundColor: fundoIcone },
          ]}
        >
          <Feather name={icone} size={20} color={cor} />
        </View>

        <Text
          style={[styles.statNumber, { color: palette.text }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {valor}
        </Text>

        <Text
          style={[styles.statLabel, { color: palette.muted }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {titulo}
        </Text>
      </View>
    );
  }

  // ==========================================================
  // COMPONENTE DE PRODUTO
  // ==========================================================

  function renderProduto(produto) {
    const status =
      STATUS_CONFIG[produto.status] || STATUS_CONFIG.normal;

    return (
      <TouchableOpacity
        key={String(
          produto.id ?? produto.codigo ?? produto.nome
        )}
        style={[
          styles.productRow,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => abrirProduto(produto)}
      >
        <View
          style={[
            styles.productIconBox,
            { backgroundColor: palette.cardSoft },
          ]}
        >
          <Feather
            name="package"
            size={22}
            color={palette.accent}
          />
        </View>

        <View style={styles.productInfo}>
          <Text
            style={[
              styles.productName,
              { color: palette.text },
            ]}
            numberOfLines={1}
          >
            {produto.nome}
          </Text>

          <Text
            style={[
              styles.productStock,
              { color: palette.muted },
            ]}
          >
            Estoque: {produto.estoque} un.
          </Text>
        </View>

        <View
          style={[
            styles.badge,
            { backgroundColor: status.bg },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: status.color },
            ]}
          >
            {status.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ==========================================================
  // INTERFACE
  // ==========================================================

  return (
    <View
      style={[
        styles.background,
        { backgroundColor: palette.background },
      ]}
    >
      <StatusBar
        barStyle={isDarkTheme ? "light-content" : "dark-content"}
        backgroundColor={palette.background}
        translucent={false}
      />

      {/* ==================================================== */}
      {/* IMAGEM DE FUNDO - IGUAL AO LOGIN */}
      {/* ==================================================== */}

      <Image
        source={fundoGeral}
        style={styles.backgroundImage}
        resizeMode="cover"
        pointerEvents="none"
        accessible={false}
      />

      {/* ==================================================== */}
      {/* CONTEÚDO PRINCIPAL - ACIMA DA IMAGEM */}
      {/* ==================================================== */}

      <View style={styles.container}>
        {/* ================================================ */}
        {/* CABEÇALHO */}
        {/* ================================================ */}

        <View
          style={[
            styles.header,
            {
              backgroundColor: isDarkTheme
                ? "rgba(9, 15, 32, 0.15)"
                : "rgba(255, 255, 255, 0.50)",
            },
          ]}
        >
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => setSidebarVisible(true)}
            accessibilityLabel="Abrir menu"
          >
            <Feather
              name="menu"
              size={25}
              color={palette.text}
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.headerTitle,
              { color: palette.text },
            ]}
          >
            KeepStock
          </Text>

          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate("Notificacoes")}
            accessibilityLabel="Abrir notificações"
          >
            <Feather
              name="bell"
              size={23}
              color={palette.text}
            />
          </TouchableOpacity>
        </View>

        {/* ================================================ */}
        {/* CONTEÚDO ROLÁVEL */}
        {/* ================================================ */}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={handleAtualizar}
              tintColor={palette.accent}
              colors={["#7775FF"]}
            />
          }
        >
          {/* ============================================== */}
          {/* SAUDAÇÃO */}
          {/* ============================================== */}

          <View style={styles.welcomeSection}>
            <Text
              style={[
                styles.greeting,
                { color: palette.text },
              ]}
            >
              Olá, {usuario?.nome || usuario?.name || "Usuário"}!
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: palette.muted },
              ]}
            >
              Aqui está o resumo do seu estoque.
            </Text>
          </View>

          {/* ============================================== */}
          {/* BUSCA */}
          {/* ============================================== */}

          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: palette.cardSoft,
                borderColor: palette.border,
              },
            ]}
          >
            <Feather
              name="search"
              size={20}
              color={palette.muted}
              style={styles.searchIcon}
            />

            <TextInput
              style={[
                styles.searchInput,
                { color: palette.text },
              ]}
              placeholder="Buscar produtos ou códigos..."
              placeholderTextColor={palette.muted}
              value={busca}
              onChangeText={setBusca}
              returnKeyType="search"
              autoCorrect={false}
            />

            {busca.length > 0 && (
              <TouchableOpacity
                onPress={() => setBusca("")}
                accessibilityLabel="Limpar busca"
              >
                <Feather
                  name="x"
                  size={19}
                  color={palette.muted}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* ============================================== */}
          {/* ALERTAS DO ESTOQUE */}
          {/* ============================================== */}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate("ListaProdutos")}
          >
            <LinearGradient
              colors={["#7464EA", "#5941BC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.alertCard}
            >
              <View style={styles.alertIconBox}>
                <Feather
                  name="alert-triangle"
                  size={27}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.alertDivider} />

              <View style={styles.alertContent}>
                <Text style={styles.alertLabel}>
                  PRODUTOS EM ALERTA
                </Text>

                <Text style={styles.alertNumber}>
                  {erroEstoque ? "—" : resumo.totalAlertas}
                </Text>

                <Text style={styles.alertDescription}>
                  Estoque baixo ou crítico
                </Text>
              </View>

              <Feather
                name="chevron-right"
                size={24}
                color="#FFFFFF"
              />
            </LinearGradient>
          </TouchableOpacity>

          {/* ============================================== */}
          {/* INDICADORES */}
          {/* ============================================== */}

          <View style={styles.statsRow}>
            {renderIndicador({
              titulo: "PRODUTOS",
              valor: erroEstoque
                ? "—"
                : resumo.totalProdutos,
              icone: "archive",
              cor: "#B19CFF",
              fundoIcone: "#302551",
            })}

            {renderIndicador({
              titulo: "MOVIMENTOS",
              valor: erroEstoque
                ? "—"
                : movimentosCount.toLocaleString("pt-BR"),
              icone: "activity",
              cor: "#82BBFF",
              fundoIcone: "#223853",
            })}

            {renderIndicador({
              titulo: "UNIDADES",
              valor: erroEstoque
                ? "—"
                : resumo.totalUnidades.toLocaleString("pt-BR"),
              icone: "layers",
              cor: "#6BE4A2",
              fundoIcone: "#1D4335",
            })}
          </View>

          {/* ============================================== */}
          {/* PRODUTOS EM DESTAQUE */}
          {/* ============================================== */}

          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { color: palette.text },
              ]}
            >
              Produtos em destaque
            </Text>

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate("ListaProdutos")}
            >
              <Text
                style={[
                  styles.sectionLink,
                  { color: palette.accent },
                ]}
              >
                Ver todos
              </Text>

              <Feather
                name="chevron-right"
                size={16}
                color={palette.accent}
              />
            </TouchableOpacity>
          </View>

          {/* ============================================== */}
          {/* LISTA DE PRODUTOS */}
          {/* ============================================== */}

          <View style={styles.productList}>
            {!erroEstoque &&
              produtosFiltrados.map(renderProduto)}

            {carregando && (
              <View style={styles.emptyContainer}>
                <ActivityIndicator
                  size="small"
                  color={palette.accent}
                />

                <Text
                  style={[
                    styles.emptyText,
                    { color: palette.muted },
                  ]}
                >
                  Carregando estoque...
                </Text>
              </View>
            )}

            {!carregando &&
              !erroEstoque &&
              produtosFiltrados.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Feather
                    name="package"
                    size={27}
                    color={palette.muted}
                  />

                  <Text
                    style={[
                      styles.emptyText,
                      { color: palette.muted },
                    ]}
                  >
                    Nenhum produto encontrado.
                  </Text>
                </View>
              )}

            {!carregando && erroEstoque && (
              <View style={styles.emptyContainer}>
                <Feather
                  name="wifi-off"
                  size={25}
                  color={palette.muted}
                />

                <Text
                  style={[
                    styles.emptyText,
                    { color: palette.muted },
                  ]}
                >
                  Não foi possível atualizar o estoque.
                  Puxe para baixo para tentar novamente.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* ================================================ */}
        {/* BARRA DE NAVEGAÇÃO INFERIOR */}
        {/* ================================================ */}

        <KeepStockBottomNav
          activeTab="inicio"
          navigation={navigation}
        />
      </View>

      {/* ==================================================== */}
      {/* MENU LATERAL */}
      {/* ==================================================== */}

      <SidebarModal
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
        currentScreen="Home"
      />
    </View>
  );
}

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  // ==========================================================
  // CONTAINER PRINCIPAL - IGUAL AO LOGIN
  // ==========================================================

  background: {
    flex: 1,
    backgroundColor: "#090F20",
  },

  // ==========================================================
  // IMAGEM DE FUNDO - IGUAL AO LOGIN
  // ==========================================================

  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },

  // ==========================================================
  // CONTEÚDO ACIMA DA IMAGEM - IGUAL AO LOGIN
  // ==========================================================

  container: {
    flex: 1,
    zIndex: 1,
    elevation: 1,
    backgroundColor: "transparent",
  },

  // ==========================================================
  // CABEÇALHO
  // ==========================================================

  header: {
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  headerIcon: {
    width: 36,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  // ==========================================================
  // SCROLLVIEW
  // ==========================================================

  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },

  // ==========================================================
  // SAUDAÇÃO
  // ==========================================================

  welcomeSection: {
    marginBottom: 24,
  },

  greeting: {
    fontSize: 27,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.6,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
  },

  // ==========================================================
  // CAMPO DE BUSCA
  // ==========================================================

  searchBox: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 17,
    marginBottom: 22,
  },

  searchIcon: {
    marginRight: 13,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },

  // ==========================================================
  // CARD DE ALERTAS
  // ==========================================================

  alertCard: {
    minHeight: 126,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 22,
  },

  alertIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
  },

  alertDivider: {
    width: 1,
    height: 62,
    backgroundColor: "rgba(255,255,255,0.35)",
    marginHorizontal: 15,
  },

  alertContent: {
    flex: 1,
  },

  alertLabel: {
    color: "#F1EFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 5,
  },

  alertNumber: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },

  alertDescription: {
    color: "#E7DFFF",
    fontSize: 11,
    marginTop: 2,
  },

  // ==========================================================
  // INDICADORES
  // ==========================================================

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 30,
  },

  statCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 122,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  statIconBox: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },

  statNumber: {
    fontSize: 23,
    fontWeight: "800",
    marginBottom: 5,
    maxWidth: "100%",
  },

  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // ==========================================================
  // PRODUTOS EM DESTAQUE
  // ==========================================================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    flexShrink: 1,
  },

  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingLeft: 8,
  },

  sectionLink: {
    fontSize: 12,
    fontWeight: "600",
  },

  productList: {
    gap: 10,
  },

  // ==========================================================
  // CARD DE PRODUTO
  // ==========================================================

  productRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },

  productIconBox: {
    width: 43,
    height: 43,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  productInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },

  productName: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 5,
  },

  productStock: {
    fontSize: 12,
  },

  // ==========================================================
  // STATUS DOS PRODUTOS
  // ==========================================================

  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    minWidth: 61,
    alignItems: "center",
  },

  badgeText: {
    fontSize: 9,
    fontWeight: "800",
  },

  // ==========================================================
  // CARREGAMENTO E ERROS
  // ==========================================================

  emptyContainer: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 10,
  },

  emptyText: {
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
  },
});
