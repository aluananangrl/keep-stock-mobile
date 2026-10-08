import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import KeepStockHeader from "../components/KeepStockHeader";
import KeepStockBottomNav from "../components/KeepStockBottomNav";
import SidebarModal from "../components/SidebarModal";

export default function HistoricoScreen({ navigation }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [busca, setBusca] = useState("");

  const movimentacoes = [
    {
      id: "1",
      tipo: "entrada",
      produto: "Processador Intel Core i9",
      horario: "14:30",
      responsavel: "João Silva",
      tag: "Lote #A102",
      quantidade: "+50",
      cor: "#34d399",
      tagColor: "#34d399",
    },
    {
      id: "2",
      tipo: "saida",
      produto: "Placa de Vídeo RTX 4090",
      horario: "11:15",
      responsavel: "Maria Oliveira",
      tag: "OS #8842",
      quantidade: "-12",
      cor: "#fb923c",
      tagColor: "#fbbf24",
    },
    {
      id: "3",
      tipo: "saida",
      produto: "Memória RAM 32GB DDR5",
      horario: "09:40",
      responsavel: "Alex (Você)",
      tag: "Transferência Interna",
      quantidade: "-30",
      cor: "#fb923c",
      tagColor: "#fbbf24",
    },
  ];

  const filtrados = movimentacoes.filter((item) =>
    item.produto.toLowerCase().includes(busca.toLowerCase()) ||
    item.tag.toLowerCase().includes(busca.toLowerCase()) ||
    item.responsavel.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <KeepStockHeader
        title="KeepStock"
        onMenuPress={() => setSidebarVisible(true)}
        onNotificationsPress={() => navigation.navigate("Notificacoes")}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Título & Subtítulo */}
        <View style={styles.headerTitleBox}>
          <Text style={styles.pageTitle}>Histórico de Movimentações</Text>
          <Text style={styles.pageSubtitle}>
            Registro detalhado de entradas e saídas do estoque.
          </Text>
        </View>

        {/* Busca e Filtro */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar produto..."
              placeholderTextColor="#64748b"
              value={busca}
              onChangeText={setBusca}
            />
          </View>

          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
            <Feather name="sliders" size={18} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        {/* Cards de Métricas Hoje */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>ENTRADAS HOJE</Text>
            <View style={styles.metricValueWrap}>
              <Text style={[styles.metricNumber, { color: "#34d399" }]}>142</Text>
              <Feather name="arrow-down" size={18} color="#34d399" style={styles.metricArrow} />
            </View>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>SAÍDAS HOJE</Text>
            <View style={styles.metricValueWrap}>
              <Text style={[styles.metricNumber, { color: "#fb923c" }]}>89</Text>
              <Feather name="arrow-up" size={18} color="#fb923c" style={styles.metricArrow} />
            </View>
          </View>
        </View>

        {/* Card Volume Total */}
        <View style={styles.volumeCard}>
          <Text style={styles.metricLabel}>VOLUME TOTAL</Text>
          <View style={styles.volumeContentRow}>
            <Text style={styles.volumeValue}>231 Unid.</Text>
            <View style={styles.badgeVs}>
              <Text style={styles.badgeVsText}>↗ +12% vs Ontem</Text>
            </View>
          </View>
        </View>

        {/* Divisor de Data */}
        <Text style={styles.dateDivider}>Hoje, 24 Out</Text>

        {/* Lista de Movimentações */}
        <View style={styles.movementsList}>
          {filtrados.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.movementCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("DetalhesProduto")}
            >
              <View
                style={[
                  styles.iconCircle,
                  item.tipo === "entrada"
                    ? styles.iconCircleGreen
                    : styles.iconCircleOrange,
                ]}
              >
                <Feather
                  name={item.tipo === "entrada" ? "arrow-down" : "arrow-up"}
                  size={18}
                  color={item.tipo === "entrada" ? "#34d399" : "#fb923c"}
                />
              </View>

              <View style={styles.movementInfo}>
                <Text style={styles.productName}>{item.produto}</Text>
                <Text style={styles.metaText}>
                  <Feather name="clock" size={11} color="#64748b" /> {item.horario} • {item.responsavel}
                </Text>
                <Text style={[styles.tagText, { color: item.tagColor }]}>{item.tag}</Text>
              </View>

              <View style={styles.quantityBox}>
                <Text style={[styles.quantityValue, { color: item.cor }]}>
                  {item.quantidade}
                </Text>
                <Text style={styles.unitText}>unid.</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botão Carregar Mais */}
        <TouchableOpacity style={styles.loadMoreBtn} activeOpacity={0.8}>
          <Text style={styles.loadMoreText}>Carregar Mais</Text>
          <Feather name="chevron-down" size={16} color="#94a3b8" />
        </TouchableOpacity>
      </ScrollView>

      {/* Navegação Inferior */}
      <KeepStockBottomNav activeTab="visualizar" navigation={navigation} />

      {/* Menu Lateral Drawer */}
      <SidebarModal
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
        currentScreen="Historico"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d131f",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerTitleBox: {
    marginBottom: 16,
  },
  pageTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  pageSubtitle: {
    color: "#94a3b8",
    fontSize: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161f32",
    borderRadius: 14,
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#202c44",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 13,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#161f32",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#202c44",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#161f32",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#202c44",
  },
  metricLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  metricValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: "700",
  },
  metricArrow: {
    marginTop: 2,
  },
  volumeCard: {
    backgroundColor: "#161f32",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#202c44",
  },
  volumeContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  volumeValue: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "700",
  },
  badgeVs: {
    backgroundColor: "rgba(52, 211, 153, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.3)",
  },
  badgeVsText: {
    color: "#34d399",
    fontSize: 11,
    fontWeight: "700",
  },
  dateDivider: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
  },
  movementsList: {
    gap: 10,
    marginBottom: 20,
  },
  movementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161f32",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#202c44",
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconCircleGreen: {
    backgroundColor: "rgba(52, 211, 153, 0.15)",
  },
  iconCircleOrange: {
    backgroundColor: "rgba(251, 146, 60, 0.15)",
  },
  movementInfo: {
    flex: 1,
  },
  productName: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  metaText: {
    color: "#94a3b8",
    fontSize: 11,
    marginBottom: 2,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  quantityBox: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  unitText: {
    color: "#64748b",
    fontSize: 11,
  },
  loadMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#161f32",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#202c44",
  },
  loadMoreText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
  },
});
