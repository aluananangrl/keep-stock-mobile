import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import KeepStockHeader from "../components/KeepStockHeader";
import KeepStockBottomNav from "../components/KeepStockBottomNav";
import SidebarModal from "../components/SidebarModal";

export default function DetalhesProdutoScreen({ navigation, route }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("Resumo");

  const produto = route?.params?.produto || {
    nome: "Água Mineral 500ml",
    codigo: "7891234560010",
    estoque: 38,
    status: "CRÍTICO",
    consumoMedio: 24,
    previsaoRuptura: "Em 2 dias",
    dataEstimada: "10/11/2026",
    ativo: true,
  };

  const historicoRecente = [
    { id: "1", tipo: "Saída", data: "06/03/2025 14:32", quantidade: "-30 un.", cor: "#f87171" },
    { id: "2", tipo: "Entrada", data: "05/03/2025 09:15", quantidade: "+50 un.", cor: "#34d399" },
    { id: "3", tipo: "Saída", data: "04/03/2025 16:48", quantidade: "-20 un.", cor: "#f87171" },
  ];

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
        {/* Card do Produto */}
        <View style={styles.productCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80",
            }}
            style={styles.productImage}
          />
          <View style={styles.productDetails}>
            <Text style={styles.productTitle}>{produto.nome}</Text>
            <Text style={styles.productCode}>Código: {produto.codigo}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Ativo</Text>
            </View>
          </View>
        </View>

        {/* Abas */}
        <View style={styles.tabContainer}>
          {["Resumo", "Histórico", "Previsão"].map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[styles.tabButtonText, isSelected && styles.tabButtonTextActive]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Cards de Métricas */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Estoque atual</Text>
            <View style={styles.metricValueWrap}>
              <Text style={styles.metricValue}>{produto.estoque} </Text>
              <Text style={styles.metricUnit}>un.</Text>
            </View>
            <Text style={styles.criticalText}>CRÍTICO</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Consumo médio (7d)</Text>
            <View style={styles.metricValueWrap}>
              <Text style={styles.metricValue}>{produto.consumoMedio} </Text>
              <Text style={styles.metricUnit}>un.</Text>
            </View>
            <Text style={styles.metricSubtext}>por dia</Text>
          </View>
        </View>

        {/* Previsão de Ruptura */}
        <View style={styles.ruptureCard}>
          <View style={styles.ruptureTextWrap}>
            <Text style={styles.ruptureLabel}>Previsão de ruptura</Text>
            <Text style={styles.ruptureDays}>{produto.previsaoRuptura}</Text>
            <Text style={styles.ruptureDate}>Data estimada: {produto.dataEstimada}</Text>
          </View>

          {/* Mini gráfico de linha descendente */}
          <View style={styles.ruptureChartWrap}>
            <Svg height="48" width="100" viewBox="0 0 100 48">
              <Path
                d="M 5 15 C 25 15, 35 24, 48 22 C 60 20, 70 32, 95 38"
                fill="none"
                stroke="#f87171"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </Svg>
          </View>
        </View>

        {/* Histórico Recente */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>HISTÓRICO RECENTE</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Historico")}>
              <Text style={styles.viewMoreText}>Ver mais</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.historyCard}>
            {historicoRecente.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.historyItem,
                  index < historicoRecente.length - 1 && styles.historyItemBorder,
                ]}
              >
                <View>
                  <Text style={styles.historyItemType}>{item.tipo}</Text>
                  <Text style={styles.historyItemDate}>{item.data}</Text>
                </View>
                <Text style={[styles.historyItemQty, { color: item.cor }]}>
                  {item.quantidade}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Navegação Inferior */}
      <KeepStockBottomNav activeTab="visualizar" navigation={navigation} />

      {/* Menu Lateral Drawer */}
      <SidebarModal
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
        currentScreen="DetalhesProduto"
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
    paddingTop: 12,
    paddingBottom: 24,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161f32",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#202c44",
  },
  productImage: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
  },
  productTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  productCode: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  statusBadgeText: {
    color: "#34d399",
    fontSize: 11,
    fontWeight: "700",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 12,
    marginRight: 28,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#818cf8",
  },
  tabButtonText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
  tabButtonTextActive: {
    color: "#f8fafc",
    fontWeight: "700",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#161f32",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#202c44",
  },
  metricLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 8,
  },
  metricValueWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 6,
  },
  metricValue: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "700",
  },
  metricUnit: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "500",
  },
  criticalText: {
    color: "#fb923c",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  metricSubtext: {
    color: "#64748b",
    fontSize: 11,
  },
  ruptureCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#161f32",
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#202c44",
  },
  ruptureTextWrap: {
    flex: 1,
  },
  ruptureLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 4,
  },
  ruptureDays: {
    color: "#f87171",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  ruptureDate: {
    color: "#64748b",
    fontSize: 11,
  },
  ruptureChartWrap: {
    width: 100,
    alignItems: "flex-end",
  },
  historySection: {
    marginBottom: 10,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyTitle: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  viewMoreText: {
    color: "#818cf8",
    fontSize: 12,
    fontWeight: "600",
  },
  historyCard: {
    backgroundColor: "#161f32",
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#202c44",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  historyItemType: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  historyItemDate: {
    color: "#64748b",
    fontSize: 11,
  },
  historyItemQty: {
    fontSize: 14,
    fontWeight: "700",
  },
});
