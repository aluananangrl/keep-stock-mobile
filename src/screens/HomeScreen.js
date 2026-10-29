
import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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

const STATUS_CONFIG = {
  critico: {
    label: "CRÍTICO",
    bg: "#3a1f2b",
    color: "#ff7a94",
  },
  baixo: {
    label: "BAIXO",
    bg: "#3a2f1f",
    color: "#ffc86b",
  },
  normal: {
    label: "NORMAL",
    bg: "#1f3a2a",
    color: "#6bffa0",
  },
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
        active: "#2d6df6",
      };

  const [usuario, setUsuario] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [movimentosCount, setMovimentosCount] = useState(0);
  const [busca, setBusca] = useState("");
  const [erroEstoque, setErroEstoque] = useState(false);

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
        error?.response?.data ?? error?.message ?? error
      );
    }
  }, []);

  const carregarResumoEstoque = useCallback(async () => {
    try {
      const [resProdutos, resMovimentos] = await Promise.all([
        api.listarProdutos({ limit: 200 }),
        api.listarMovimentacoes({ limit: 1000 }),
      ]);

      const listaProdutos = extractList(resProdutos);
      const listaMovimentos = extractList(resMovimentos);

      console.log("PRODUTOS RECEBIDOS NA HOME:", listaProdutos.length);
      console.log("MOVIMENTAÇÕES RECEBIDAS NA HOME:", listaMovimentos.length);

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
        "ERRO AO ATUALIZAR RESUMO DA HOME:",
        error?.response?.data ?? error?.message ?? error
      );

      setErroEstoque(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarUsuario();
      carregarResumoEstoque();
    }, [carregarUsuario, carregarResumoEstoque])
  );

  const produtosFiltrados = produtos
    .filter((produto) => {
      const termo = busca.trim().toLocaleLowerCase("pt-BR");
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

  const totalAlertas = produtos.filter((produto) => {
    return (
      getMinimumStock(produto) > 0 &&
      getStock(produto) <= getMinimumStock(produto)
    );
  }).length;

  function abrirProduto(produto) {
    console.log(
      "PRODUTO SELECIONADO NA HOME:",
      JSON.stringify(produto, null, 2)
    );

    const produtoId = obterIdProduto(produto);

    if (produtoId === null) {
      console.log("ERRO: produto sem ID válido:", produto);
      return;
    }

    const parametros = {
      produtoId,
      produto: {
        ...produto,
        id: produtoId,
      },
    };

    console.log(
      "PARÂMETROS ENVIADOS PARA DETALHES:",
      JSON.stringify(parametros, null, 2)
    );

    navigation.navigate("DetalhesProduto", parametros);
  }

  function renderProduto(produto) {
    const status =
      STATUS_CONFIG[produto.status] || STATUS_CONFIG.normal;

    return (
      <TouchableOpacity
        key={String(produto.id ?? produto.codigo ?? produto.nome)}
        style={[styles.productRow, { backgroundColor: palette.card }]}
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
            size={18}
            color={isDarkTheme ? "#aaa8ff" : "#4f6cf5"}
          />
        </View>

        <View style={styles.productInfo}>
          <Text
            style={[styles.productName, { color: palette.text }]}
            numberOfLines={1}
          >
            {produto.nome}
          </Text>

          <Text style={[styles.productStock, { color: palette.muted }]}>
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

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.header, { backgroundColor: palette.header }]}>
        <TouchableOpacity
          onPress={() => setSidebarVisible(true)}
          accessibilityLabel="Abrir menu"
        >
          <Feather name="menu" size={22} color={palette.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: palette.text }]}>
          KeepStock
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("Notificacoes")}
          accessibilityLabel="Abrir notificações"
        >
          <Feather name="bell" size={20} color={palette.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.greeting, { color: palette.text }]}>
          Olá, {usuario?.nome || usuario?.name || "Usuário"}!
        </Text>

        <Text style={[styles.subtitle, { color: palette.muted }]}>
          Aqui está o resumo do seu estoque.
        </Text>

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
            size={16}
            color={palette.muted}
            style={styles.searchIcon}
          />

          <TextInput
            style={[styles.searchInput, { color: palette.text }]}
            placeholder="Buscar produtos, códigos, locais..."
            placeholderTextColor={palette.muted}
            value={busca}
            onChangeText={setBusca}
            returnKeyType="search"
          />
        </View>

        <LinearGradient
          colors={["#7775ff", "#aaa8ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.alertCard}
        >
          <View>
            <Text style={styles.alertLabel}>PRODUTOS EM ALERTA</Text>
            <Text style={styles.alertNumber}>
              {erroEstoque ? "—" : totalAlertas}
            </Text>
            <Text style={styles.alertDescription}>
              Estoque baixo ou crítico
            </Text>
          </View>

          <View style={styles.alertIconCircle}>
            <Feather name="alert-triangle" size={20} color="#29258a" />
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <View
              style={[
                styles.statIconBox,
                { backgroundColor: isDarkTheme ? "#2a2450" : "#e8edff" },
              ]}
            >
              <Feather
                name="archive"
                size={16}
                color={isDarkTheme ? "#aaa8ff" : "#3e5ef5"}
              />
            </View>
            <Text style={[styles.statNumber, { color: palette.text }]}>
              {erroEstoque ? "—" : produtos.length}
            </Text>
            <Text style={[styles.statLabel, { color: palette.muted }]}>
              PRODUTOS
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <View
              style={[
                styles.statIconBox,
                { backgroundColor: isDarkTheme ? "#233046" : "#eaf4ff" },
              ]}
            >
              <Feather
                name="activity"
                size={16}
                color={isDarkTheme ? "#7fb8ff" : "#2b6df6"}
              />
            </View>
            <Text style={[styles.statNumber, { color: palette.text }]}>
              {erroEstoque
                ? "—"
                : movimentosCount.toLocaleString("pt-BR")}
            </Text>
            <Text style={[styles.statLabel, { color: palette.muted }]}>
              MOVIMENTOS
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <View
              style={[
                styles.statIconBox,
                { backgroundColor: isDarkTheme ? "#1f3a2a" : "#eafaf1" },
              ]}
            >
              <Feather
                name="layers"
                size={16}
                color={isDarkTheme ? "#6bffa0" : "#1bb36a"}
              />
            </View>
            <Text style={[styles.statNumber, { color: palette.text }]}>
              {erroEstoque
                ? "—"
                : produtos
                    .reduce((total, produto) => total + getStock(produto), 0)
                    .toLocaleString("pt-BR")}
            </Text>
            <Text style={[styles.statLabel, { color: palette.muted }]}>
              UNIDADES
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            Produtos em destaque
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("ListaProdutos")}
          >
            <Text
              style={[
                styles.sectionLink,
                { color: isDarkTheme ? "#aaa8ff" : "#4f6cf5" },
              ]}
            >
              Ver todos
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productList}>
          {produtosFiltrados.map(renderProduto)}

          {!erroEstoque && produtosFiltrados.length === 0 && (
            <Text style={{ color: palette.muted, padding: 14 }}>
              Nenhum produto cadastrado ou correspondente à busca.
            </Text>
          )}

          {erroEstoque && (
            <Text style={{ color: palette.muted, padding: 14 }}>
              Não foi possível atualizar os dados. Confira a conexão com a
              API e tente novamente.
            </Text>
          )}
        </View>
      </ScrollView>

      <KeepStockBottomNav activeTab="inicio" navigation={navigation} />

      <SidebarModal
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
        currentScreen="Home"
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 16,
    fontWeight: "600",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 18,
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
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
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 26,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
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
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  sectionLink: {
    fontSize: 12,
  },
  productList: {
    marginBottom: 10,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  productIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  productStock: {
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
});
