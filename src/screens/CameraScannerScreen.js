import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ImageBackground,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function CameraScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);

  // Produto detectado pelo scanner (exibido no Bottom Sheet)
  const [produtoDetectado, setProdutoDetectado] = useState({
    nome: "Água Mineral 500ml",
    codigo: "7891234560010",
    estoque: 58,
    imagem: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80",
  });

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    const codigo = (data || "").trim();
    if (codigo) {
      setProdutoDetectado((prev) => ({
        ...prev,
        codigo: codigo,
      }));
    }
  };

  const handleAcao = (tipo) => {
    navigation.navigate("ConfirmacaoMovimento", {
      produto: {
        nome: produtoDetectado.nome,
        codigo: produtoDetectado.codigo,
        quantidade: 10,
        tipo: tipo,
      },
    });
  };

  const toggleTorch = () => {
    setTorch((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {/* Câmera Real ou Fundo de Armazém do Protótipo */}
      {permission?.granted ? (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
      ) : (
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80",
          }}
          style={StyleSheet.absoluteFillObject}
        >
          <View style={styles.cameraDarkOverlay} />
        </ImageBackground>
      )}

      {/* Header Superior */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={22} color="#f8fafc" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Leitura de Código</Text>

        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={toggleTorch}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather
            name="zap"
            size={22}
            color={torch ? "#fbbf24" : "#f8fafc"}
          />
        </TouchableOpacity>
      </View>

      {/* Retículo / Mira Central do Scanner */}
      <View style={styles.viewfinderContainer} pointerEvents="none">
        <View style={styles.reticleBox}>
          {/* 4 cantos estilizados em tom coral/rosado */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Linha laser de leitura */}
          <View style={styles.laserLine} />
        </View>
      </View>

      {/* Bottom Sheet com Resultado e Ações Rápidas */}
      <View style={styles.bottomSheet}>
        {/* Puxador da Gaveta */}
        <View style={styles.dragHandle} />

        {/* Informações do Produto Lido */}
        <View style={styles.productRow}>
          <Image
            source={{ uri: produtoDetectado.imagem }}
            style={styles.productThumb}
          />
          <View style={styles.productDetails}>
            <Text style={styles.productTitle}>{produtoDetectado.nome}</Text>
            <View style={styles.codeRow}>
              <Feather name="bar-chart" size={13} color="#94a3b8" style={{ marginRight: 4 }} />
              <Text style={styles.productCode}>
                Código: {produtoDetectado.codigo}
              </Text>
            </View>
            <Text style={styles.stockText}>
              Estoque atual: {produtoDetectado.estoque} un.
            </Text>
          </View>
        </View>

        {/* 3 Botões de Ação Imediata (Entrada, Saída, Ajuste) */}
        <View style={styles.actionsGrid}>
          {/* Ação 1: Entrada */}
          <TouchableOpacity
            style={[styles.actionCard, styles.actionCardIn]}
            activeOpacity={0.8}
            onPress={() => handleAcao("Entrada")}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: "rgba(52, 211, 153, 0.2)" }]}>
              <Feather name="arrow-down" size={20} color="#34d399" />
            </View>
            <Text style={[styles.actionTitle, { color: "#34d399" }]}>Entrada</Text>
            <Text style={styles.actionSubtitle}>Adicionar</Text>
          </TouchableOpacity>

          {/* Ação 2: Saída */}
          <TouchableOpacity
            style={[styles.actionCard, styles.actionCardOut]}
            activeOpacity={0.8}
            onPress={() => handleAcao("Saída")}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: "rgba(248, 113, 113, 0.2)" }]}>
              <Feather name="arrow-up" size={20} color="#f87171" />
            </View>
            <Text style={[styles.actionTitle, { color: "#f87171" }]}>Saída</Text>
            <Text style={styles.actionSubtitle}>Remover</Text>
          </TouchableOpacity>

          {/* Ação 3: Ajuste */}
          <TouchableOpacity
            style={[styles.actionCard, styles.actionCardAdjust]}
            activeOpacity={0.8}
            onPress={() => handleAcao("Ajuste")}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: "rgba(129, 140, 248, 0.2)" }]}>
              <Feather name="edit-2" size={18} color="#818cf8" />
            </View>
            <Text style={[styles.actionTitle, { color: "#818cf8" }]}>Ajuste</Text>
            <Text style={styles.actionSubtitle}>Quantidade</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  cameraDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "700",
  },
  viewfinderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50,
  },
  reticleBox: {
    width: 250,
    height: 250,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 38,
    height: 38,
    borderColor: "#fca5a5",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 16,
  },
  laserLine: {
    width: "90%",
    height: 2,
    backgroundColor: "#f87171",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  bottomSheet: {
    backgroundColor: "#161f32",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#25334d",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 16,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#475569",
    alignSelf: "center",
    marginBottom: 16,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  productThumb: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    marginRight: 14,
  },
  productDetails: {
    flex: 1,
  },
  productTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  productCode: {
    color: "#cbd5e1",
    fontSize: 12,
  },
  stockText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  actionCardIn: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  actionCardOut: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  actionCardAdjust: {
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    borderColor: "rgba(99, 102, 241, 0.2)",
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  actionSubtitle: {
    color: "#64748b",
    fontSize: 11,
  },
});
