// ============================================================
// IMPORTAÇÕES
// ============================================================

import { useEffect, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";

import api from "../services/api";
import { extractList, getMinimumStock, getProductCode, getProductName, getStock } from "../services/responseUtils";
import { useTheme } from "../context/ThemeContext";
import SidebarModal from "../components/SidebarModal";
import KeepStockBottomNav from "../components/KeepStockBottomNav";


const STATUS_CONFIG = {
  critico: { label: "CRÍTICO", bg: "#3a1f2b", color: "#ff7a94" },
  baixo: { label: "BAIXO", bg: "#3a2f1f", color: "#ffc86b" },
  normal: { label: "NORMAL", bg: "#1f3a2a", color: "#6bffa0" },
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  const palette = isDarkTheme
    ? {
        background: "#1b1b1d",
        header: "#1b1b1d",
        text: "#e1e3f0",
        muted: "#858b9f",
        card: "#172035",
        cardSoft: "#20283b",
        border: "#303a55",
        tab: "#151b2e",
        tabText: "#858b9f",
        active: "#6bffa0",
      }
    : {
        background: "#f5f7fb",
        header: "#ffffff",
        text: "#1d2433",
        muted: "#60708a",
        card: "#ffffff",
        cardSoft: "#edf3ff",
        border: "#dfe6f3",
        tab: "#f1f4fb",
        tabText: "#64748b",
        active: "#2d6df6",
      };

  // ==========================================================
  // ESTADO DO USUÁRIO E MENU
  // ==========================================================

  const [usuario, setUsuario] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [movimentosCount, setMovimentosCount] = useState(0);
  const [busca, setBusca] = useState("");
  const [erroEstoque, setErroEstoque] = useState(false);


  // ==========================================================
  // USEEFFECT
  // ==========================================================

  useEffect(() => {

    carregarUsuario();
    carregarResumoEstoque();

  }, []);


  // ==========================================================
  // FUNÇÃO PARA CARREGAR O USUÁRIO
  // ==========================================================

  async function carregarUsuario() {

    try {

      const response = await api.me();
      const dadosUsuario = response?.data?.user || response?.data || null;

      console.log(
        "USUÁRIO LOGADO:",
        dadosUsuario
      );

      setUsuario(dadosUsuario);

    } catch (error) {

      console.log(
        "ERRO AO BUSCAR USUÁRIO:",
        error?.response?.data ||
          error?.message
      );

    }
  }



  async function carregarResumoEstoque() {
    try {
      const [resProdutos, resMovimentos] = await Promise.all([
        api.listarProdutos({ limit: 200 }),
        api.listarMovimentacoes({ limit: 1000 }),
      ]);
      setProdutos(extractList(resProdutos));
      const dadosMovimentos = resMovimentos?.data;
      const listaMovimentos = extractList(resMovimentos);
      setMovimentosCount(Number(dadosMovimentos?.total ?? dadosMovimentos?.pagination?.total ?? listaMovimentos.length));
      setErroEstoque(false);
    } catch (error) {
      setErroEstoque(true);
    }
  }

  const produtosFiltrados = produtos.filter((produto) => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return !termo || `${getProductName(produto)} ${getProductCode(produto)}`.toLocaleLowerCase("pt-BR").includes(termo);
  }).slice(0, 5).map((produto) => {
    const quantidade = getStock(produto);
    const minimo = getMinimumStock(produto);
    return { ...produto, id: produto.id ?? produto._id, nome: getProductName(produto), codigo: getProductCode(produto), estoque: quantidade, status: minimo > 0 && quantidade <= minimo ? "baixo" : "normal" };
  });
  const totalAlertas = produtos.filter((produto) => getMinimumStock(produto) > 0 && getStock(produto) <= getMinimumStock(produto)).length;

  // ==========================================================
  // RENDER DE UM ITEM DE PRODUTO
  // ==========================================================

  function renderProduto(produto) {

    const status = STATUS_CONFIG[produto.status] || STATUS_CONFIG.normal;

    return (
      <TouchableOpacity
        key={produto.id}
        style={styles.productRow}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("DetalhesProduto", { produto })}
      >

        <View style={styles.productIconBox}>
          <Feather name="package" size={18} color="#aaa8ff" />
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName}>{produto.nome}</Text>
          <Text style={styles.productStock}>
            Estoque: {produto.estoque} un.
          </Text>
        </View>

        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>
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

    <View style={[styles.container, { backgroundColor: palette.background }]}>

      {/* ===================== HEADER ===================== */}
      <View style={[styles.header, { backgroundColor: palette.header }]}>

        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Feather name="menu" size={22} color={palette.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: palette.text }]}>KeepStock</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Notificacoes")}>
          <Feather name="bell" size={20} color={palette.text} />
        </TouchableOpacity>

      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ===================== SAUDAÇÃO ===================== */}
        <Text style={[styles.greeting, { color: palette.text }]}>
          Olá, {usuario?.nome || "Usuário"}!
        </Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          Aqui está o resumo do seu estoque.
        </Text>

        {/* ===================== BUSCA ===================== */}
        <View style={[styles.searchBox, { backgroundColor: palette.cardSoft, borderColor: palette.border }]}>
          <Feather name="search" size={16} color={palette.muted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: palette.text }]}
            placeholder="Buscar produtos, códigos, locais..."
            placeholderTextColor={palette.muted}
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        {/* ===================== CARD DE ALERTA ===================== */}
        <LinearGradient
          colors={["#7775ff", "#aaa8ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.alertCard}
        >
          <View>
            <Text style={styles.alertLabel}>PRODUTOS EM ALERTA</Text>
            <Text style={styles.alertNumber}>{erroEstoque ? "—" : totalAlertas}</Text>
            <Text style={styles.alertDescription}>
              Estoque baixo ou crítico
            </Text>
          </View>

          <View style={styles.alertIconCircle}>
            <Feather name="alert-triangle" size={20} color="#29258a" />
          </View>
        </LinearGradient>

        {/* ===================== CARDS DE ESTATÍSTICA ===================== */}
        <View style={styles.statsRow}>

          <View style={[styles.statCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: isDarkTheme ? "#2a2450" : "#e8edff" }]}>
              <Feather name="archive" size={16} color={isDarkTheme ? "#aaa8ff" : "#3e5ef5"} />
            </View>
            <Text style={[styles.statNumber, { color: palette.text }]}>{erroEstoque ? "—" : produtos.length}</Text>
            <Text style={[styles.statLabel, { color: palette.muted }]}>PRODUTOS</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: isDarkTheme ? "#233046" : "#eaf4ff" }]}>
              <Feather name="activity" size={16} color={isDarkTheme ? "#7fb8ff" : "#2b6df6"} />
            </View>
            <Text style={[styles.statNumber, { color: palette.text }]}>{erroEstoque ? "—" : movimentosCount.toLocaleString("pt-BR")}</Text>
            <Text style={[styles.statLabel, { color: palette.muted }]}>MOVIMENTOS</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: isDarkTheme ? "#1f3a2a" : "#eafaf1" }]}>
              <Feather name="layers" size={16} color={isDarkTheme ? "#6bffa0" : "#1bb36a"} />
            </View>
            <Text style={[styles.statNumber, { color: palette.text }]}>{erroEstoque ? "—" : produtos.reduce((total, produto) => total + getStock(produto), 0).toLocaleString("pt-BR")}</Text>
            <Text style={[styles.statLabel, { color: palette.muted }]}>UNIDADES</Text>
          </View>

        </View>

        {/* ===================== PRODUTOS EM DESTAQUE ===================== */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Produtos em destaque</Text>
          <TouchableOpacity onPress={() => navigation.navigate("ListaProdutos")}>
            <Text style={[styles.sectionLink, { color: isDarkTheme ? "#aaa8ff" : "#4f6cf5" }]}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productList}>
          {produtosFiltrados.map((produto, index) => renderProduto({ ...produto, id: produto.id ?? produto._id ?? `${produto.codigo}-${index}` }))}
          {!erroEstoque && produtosFiltrados.length === 0 ? <Text style={{ color: palette.muted, padding: 14 }}>Nenhum produto cadastrado ou correspondente à busca.</Text> : null}
          {erroEstoque ? <Text style={{ color: palette.muted, padding: 14 }}>Não foi possível conectar à API. Confira o endereço do servidor.</Text> : null}
        </View>

      </ScrollView>

      {/* ===================== TAB BAR ===================== */}
      <KeepStockBottomNav activeTab="inicio" navigation={navigation} />

      {/* ===================== SIDEBAR DRAWER ===================== */}
      <SidebarModal
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
        currentScreen="Dashboard"
      />

    </View>

  );
}


// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({

  // ==========================================================
  // CONTAINER / HEADER
  // ==========================================================

  container: {
    flex: 1,
    backgroundColor: "#1b1b1d",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 16,
  },

  headerTitle: {
    color: "#e1e3f0",
    fontSize: 16,
    fontWeight: "600",
  },

  // ==========================================================
  // SCROLL
  // ==========================================================

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // ==========================================================
  // SAUDAÇÃO
  // ==========================================================

  greeting: {
    color: "#f2f3fa",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },

  subtitle: {
    color: "#858b9f",
    fontSize: 13,
    marginBottom: 20,
  },

  // ==========================================================
  // BUSCA
  // ==========================================================

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: "#20283b",
    borderWidth: 1,
    borderColor: "#303a55",
    borderRadius: 12,
    marginBottom: 18,
    paddingHorizontal: 14,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    color: "#e1e3f0",
    fontSize: 13,
  },

  // ==========================================================
  // CARD DE ALERTA
  // ==========================================================

  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },

  alertLabel: {
    color: "#29258a",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  alertNumber: {
    color: "#1b1740",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 4,
  },

  alertDescription: {
    color: "#3a3480",
    fontSize: 12,
  },

  alertIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ==========================================================
  // CARDS DE ESTATÍSTICA
  // ==========================================================

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 26,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#172035",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },

  statIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  statNumber: {
    color: "#f2f3fa",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },

  statLabel: {
    color: "#7d8299",
    fontSize: 9,
    letterSpacing: 0.5,
  },

  // ==========================================================
  // SEÇÃO / LISTA DE PRODUTOS
  // ==========================================================

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    color: "#e1e3f0",
    fontSize: 14,
    fontWeight: "600",
  },

  sectionLink: {
    color: "#aaa8ff",
    fontSize: 12,
  },

  productList: {
    marginBottom: 10,
  },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#172035",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

  productIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#20283b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  productInfo: {
    flex: 1,
  },

  productName: {
    color: "#e1e3f0",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },

  productStock: {
    color: "#858b9f",
    fontSize: 11,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 9,
    fontWeight: "700",
  },

  // ==========================================================
  // TAB BAR
  // ==========================================================

  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#151b2e",
    borderTopWidth: 1,
    borderTopColor: "#232a40",
    paddingTop: 10,
    paddingBottom: 22,
  },

  tabItem: {
    alignItems: "center",
  },

  tabItemCenter: {
    alignItems: "center",
    marginTop: -26,
  },

  tabIconBox: {
    width: 40,
    height: 28,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },

  tabIconBoxActiveGreen: {
    backgroundColor: "#6bffa0",
  },

  scannerButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    borderWidth: 4,
    borderColor: "#151b2e",
  },

  tabLabel: {
    color: "#858b9f",
    fontSize: 10,
  },

  tabLabelActive: {
    color: "#6bffa0",
    fontSize: 10,
    fontWeight: "600",
  },

});