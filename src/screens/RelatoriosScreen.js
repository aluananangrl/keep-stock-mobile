import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,
  Circle,
  Rect,
} from "react-native-svg";
import KeepStockHeader from "../components/KeepStockHeader";
import KeepStockBottomNav from "../components/KeepStockBottomNav";
import SidebarModal from "../components/SidebarModal";

export default function RelatoriosScreen({ navigation }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Dados do gráfico de barras (Monthly Movements)
  const monthlyMovements = [
    { month: "Jan", in: 2800, out: 2400 },
    { month: "Feb", in: 2600, out: 3000 },
    { month: "Mar", in: 4200, out: 2700 },
    { month: "Apr", in: 1800, out: 2200 },
    { month: "May", in: 3800, out: 1900 },
    { month: "Jun", in: 2200, out: 2600 },
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
        {/* Título e Ações */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Analytics & Reports</Text>
          <Text style={styles.pageSubtitle}>
            Overview of inventory performance and metrics.
          </Text>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.periodButton} activeOpacity={0.8}>
              <Feather name="calendar" size={14} color="#cbd5e1" style={{ marginRight: 6 }} />
              <Text style={styles.periodButtonText}>This Month</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportButton} activeOpacity={0.8}>
              <Feather name="upload" size={14} color="#1e1b4b" style={{ marginRight: 6 }} />
              <Text style={styles.exportButtonText}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 1: Turnover Rate */}
        <View style={styles.metricCard}>
          <View style={styles.metricCardHeader}>
            <View style={[styles.metricIconWrap, { backgroundColor: "rgba(129, 140, 248, 0.18)" }]}>
              <Feather name="rotate-cw" size={18} color="#a5b4fc" />
            </View>
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeSuccessText}>↗ 12%</Text>
            </View>
          </View>
          <Text style={styles.metricCardLabel}>TURNOVER RATE</Text>
          <Text style={styles.metricCardValue}>4.2x</Text>
        </View>

        {/* Card 2: Total Valuation */}
        <View style={styles.metricCard}>
          <View style={styles.metricCardHeader}>
            <View style={[styles.metricIconWrap, { backgroundColor: "rgba(52, 211, 153, 0.18)" }]}>
              <Feather name="credit-card" size={18} color="#34d399" />
            </View>
            <View style={styles.badgeDanger}>
              <Text style={styles.badgeDangerText}>↘ 2.4%</Text>
            </View>
          </View>
          <Text style={styles.metricCardLabel}>TOTAL VALUATION</Text>
          <Text style={styles.metricCardValue}>$1.24M</Text>
        </View>

        {/* Card 3: Low Stock Alerts */}
        <View style={styles.metricCard}>
          <View style={styles.metricCardHeader}>
            <View style={[styles.metricIconWrap, { backgroundColor: "rgba(251, 146, 60, 0.18)" }]}>
              <Feather name="alert-triangle" size={18} color="#fb923c" />
            </View>
          </View>
          <Text style={styles.metricCardLabel}>LOW STOCK ALERTS</Text>
          <View style={styles.reorderWrap}>
            <Text style={styles.alertNumber}>24</Text>
            <Text style={styles.reorderText}>items need reorder</Text>
          </View>
        </View>

        {/* Gráfico 1: Stock Levels Over Time */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Stock Levels Over Time</Text>
            <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="more-horizontal" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View style={styles.chartBody}>
            {/* Eixo Y de Legendas */}
            <View style={styles.yAxisLabels}>
              {["14.500", "14.000", "13.500", "13.000", "12.500", "12.000", "11.500", "11.000", "10.500", "10.000"].map((yVal) => (
                <Text key={yVal} style={styles.axisLabelText}>{yVal}</Text>
              ))}
            </View>

            {/* Gráfico SVG de Linha e Área */}
            <View style={styles.svgContainer}>
              <Svg height="140" width="100%" viewBox="0 0 240 140">
                <Defs>
                  <SvgLinearGradient id="gradStock" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#818cf8" stopOpacity="0.45" />
                    <Stop offset="100%" stopColor="#818cf8" stopOpacity="0.02" />
                  </SvgLinearGradient>
                </Defs>

                {/* Preenchimento da área com degradê */}
                <Path
                  d="M 10 90 C 35 110, 50 115, 75 80 C 100 50, 120 70, 145 68 C 170 30, 185 20, 205 24 C 220 28, 230 32, 235 34 L 235 140 L 10 140 Z"
                  fill="url(#gradStock)"
                />

                {/* Linha curva */}
                <Path
                  d="M 10 90 C 35 110, 50 115, 75 80 C 100 50, 120 70, 145 68 C 170 30, 185 20, 205 24 C 220 28, 230 32, 235 34"
                  fill="none"
                  stroke="#c7d2fe"
                  strokeWidth="2.5"
                />

                {/* Pontos nas coordenadas */}
                <Circle cx="10" cy="90" r="3.5" fill="#f8fafc" />
                <Circle cx="50" cy="105" r="3.5" fill="#f8fafc" />
                <Circle cx="95" cy="65" r="3.5" fill="#f8fafc" />
                <Circle cx="145" cy="68" r="3.5" fill="#f8fafc" />
                <Circle cx="195" cy="22" r="3.5" fill="#f8fafc" />
                <Circle cx="235" cy="34" r="3.5" fill="#f8fafc" />
              </Svg>

              {/* Rótulos do Eixo X */}
              <View style={styles.xAxisLabels}>
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => (
                  <Text key={m} style={styles.axisLabelText}>{m}</Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Gráfico 2: Monthly Movements (In/Out) */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Monthly Movements (In/Out)</Text>
            <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="more-horizontal" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View style={styles.chartBody}>
            {/* Eixo Y */}
            <View style={styles.yAxisLabelsBars}>
              {["4.500", "4.000", "3.500", "3.000", "2.500", "2.000", "1.500", "1.000", "500", "0"].map((val) => (
                <Text key={val} style={styles.axisLabelText}>{val}</Text>
              ))}
            </View>

            {/* Barras SVG */}
            <View style={styles.svgContainer}>
              <Svg height="140" width="100%" viewBox="0 0 240 140">
                {monthlyMovements.map((item, idx) => {
                  const xBase = 10 + idx * 38;
                  const maxHeight = 120;
                  const inHeight = (item.in / 4500) * maxHeight;
                  const outHeight = (item.out / 4500) * maxHeight;

                  return (
                    <React.Fragment key={item.month}>
                      {/* Barra Inbound (Verde) */}
                      <Rect
                        x={xBase}
                        y={130 - inHeight}
                        width="8"
                        height={inHeight}
                        rx="4"
                        fill="#34d399"
                      />
                      {/* Barra Outbound (Laranja) */}
                      <Rect
                        x={xBase + 12}
                        y={130 - outHeight}
                        width="8"
                        height={outHeight}
                        rx="4"
                        fill="#fbbf24"
                      />
                    </React.Fragment>
                  );
                })}
              </Svg>

              {/* Rótulos do Eixo X */}
              <View style={styles.xAxisLabels}>
                {monthlyMovements.map((m) => (
                  <Text key={m.month} style={styles.axisLabelText}>{m.month}</Text>
                ))}
              </View>
            </View>
          </View>

          {/* Legenda */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#34d399" }]} />
              <Text style={styles.legendText}>Inbound</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#fbbf24" }]} />
              <Text style={styles.legendText}>Outbound</Text>
            </View>
          </View>
        </View>

        {/* Lista Top Selling Products */}
        <View style={styles.productsSection}>
          <View style={styles.productsHeader}>
            <Text style={styles.productsSectionTitle}>Top Selling Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate("ListaProdutos")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Produto 1 */}
          <View style={styles.productCard}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=200&q=80",
              }}
              style={styles.productThumb}
            />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>Quantum Core Processor QX-9</Text>
              <Text style={styles.productSku}>SKU: QX9-6821</Text>
            </View>
            <View style={styles.productStats}>
              <Text style={styles.unitsCount}>1,204 units</Text>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>+15% vs last mo</Text>
              </View>
            </View>
          </View>

          {/* Produto 2 */}
          <View style={styles.productCard}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&q=80",
              }}
              style={styles.productThumb}
            />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>Proximity Sensor Array V2</Text>
              <Text style={styles.productSku}>SKU: PSA-2214</Text>
            </View>
            <View style={styles.productStats}>
              <Text style={styles.unitsCount}>582 units</Text>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>+8% vs last mo</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Navegação Inferior */}
      <KeepStockBottomNav activeTab="inicio" navigation={navigation} />

      {/* Menu Lateral Drawer */}
      <SidebarModal
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
        currentScreen="Relatorios"
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
  titleSection: {
    marginBottom: 20,
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
    marginBottom: 16,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  periodButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161f32",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#202c44",
  },
  periodButtonText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c7d2fe",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  exportButtonText: {
    color: "#1e1b4b",
    fontSize: 12,
    fontWeight: "700",
  },
  metricCard: {
    backgroundColor: "#161f32",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#202c44",
  },
  metricCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeSuccess: {
    backgroundColor: "rgba(52, 211, 153, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeSuccessText: {
    color: "#34d399",
    fontSize: 11,
    fontWeight: "700",
  },
  badgeDanger: {
    backgroundColor: "rgba(248, 113, 113, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeDangerText: {
    color: "#f87171",
    fontSize: 11,
    fontWeight: "700",
  },
  metricCardLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricCardValue: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "700",
  },
  reorderWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  alertNumber: {
    color: "#fbbf24",
    fontSize: 26,
    fontWeight: "700",
  },
  reorderText: {
    color: "#cbd5e1",
    fontSize: 13,
  },
  chartCard: {
    backgroundColor: "#161f32",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#202c44",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
  },
  chartBody: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  yAxisLabels: {
    justifyContent: "space-between",
    height: 140,
    paddingRight: 8,
  },
  yAxisLabelsBars: {
    justifyContent: "space-between",
    height: 140,
    paddingRight: 8,
  },
  axisLabelText: {
    color: "#64748b",
    fontSize: 8.5,
  },
  svgContainer: {
    flex: 1,
  },
  xAxisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 6,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: "#94a3b8",
    fontSize: 11,
  },
  productsSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  productsSectionTitle: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
  },
  viewAllText: {
    color: "#818cf8",
    fontSize: 12,
    fontWeight: "600",
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161f32",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#202c44",
  },
  productThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#1e293b",
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    color: "#f8fafc",
    fontSize: 12.5,
    fontWeight: "600",
    marginBottom: 3,
  },
  productSku: {
    color: "#94a3b8",
    fontSize: 10.5,
  },
  productStats: {
    alignItems: "flex-end",
  },
  unitsCount: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  badgePill: {
    backgroundColor: "rgba(52, 211, 153, 0.15)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgePillText: {
    color: "#34d399",
    fontSize: 9.5,
    fontWeight: "700",
  },
});
