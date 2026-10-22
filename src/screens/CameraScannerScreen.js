import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { buscarProdutoPorCodigo } from "../services/produtosService";

export default function CameraScannerScreen({ navigation, route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [open, setOpen] = useState(false);
  const [torch, setTorch] = useState(false);
  const [facing, setFacing] = useState("back");
  const [scanned, setScanned] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [notificacaoSucesso, setNotificacaoSucesso] = useState(null);
  const camRef = useRef(null);

  // Só exibe um produto depois de recebê-lo da API ou da navegação.
  const [produtoDetectado, setProdutoDetectado] = useState(route?.params?.produto || null);

  // Solicita permissão automaticamente ao montar o componente
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // Tira foto real com a câmera usando CameraView ref
  async function takePicture() {
    if (camRef.current && !isTakingPhoto) {
      try {
        setIsTakingPhoto(true);
        const data = await camRef.current.takePictureAsync({
          quality: 0.85,
        });
        if (data?.uri) {
          setCapturedPhoto(data.uri);
          setOpen(true);
        }
      } catch (error) {
        console.log("Erro ao capturar foto:", error);
        Alert.alert("Erro", "Não foi possível capturar a foto. Tente novamente.");
      } finally {
        setIsTakingPhoto(false);
      }
    }
  }

  // Leitura inteligente de código de barras ou QR Code
  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || isSearching) return;
    const codigo = (data || "").trim();
    if (!codigo) return;

    setScanned(true);
    setIsSearching(true);

    try {
      const produtoEncontrado = await buscarProdutoPorCodigo(codigo);

      if (!produtoEncontrado) {
        Alert.alert("Produto não encontrado", "Não foi possível localizar esse código.");
        return;
      }

      setProdutoDetectado(produtoEncontrado);
      setNotificacaoSucesso(`Produto: ${produtoEncontrado.nome}`);

      navigation.navigate("ResultadoLeitura", {
        codigo: produtoEncontrado.codigo || codigo,
        produto: produtoEncontrado,
      });

      setTimeout(() => {
        setNotificacaoSucesso(null);
      }, 3500);
    } catch (error) {
      console.log("Erro na busca do produto:", error);
      Alert.alert("Erro", "Não foi possível carregar as informações do produto.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAcao = (tipo) => {
    navigation.navigate("ConfirmacaoMovimento", {
      produto: {
        ...produtoDetectado,
        id: produtoDetectado.id || produtoDetectado._id || produtoDetectado.produto_id,
        nome: produtoDetectado.nome || produtoDetectado.name,
        codigo: produtoDetectado.codigo || produtoDetectado.sku || produtoDetectado.codigo_barras,
        quantidade: undefined,
        tipo: tipo,
        imagem: produtoDetectado.imagem,
      },
    });
  };

  const toggleTorch = () => {
    setTorch((prev) => !prev);
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const handleUsePhotoForProduct = () => {
    if (capturedPhoto) {
      setProdutoDetectado((prev) => ({
        ...prev,
        imagem: capturedPhoto,
      }));
      setOpen(false);
      Alert.alert("Foto Atualizada", "A imagem do produto foi atualizada com sucesso!");
    }
  };

  const handleVerDetalhes = () => {
    navigation.navigate("DetalhesProduto", {
      produto: produtoDetectado,
    });
  };

  // Se a permissão ainda estiver carregando
  if (!permission) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.permissionText}>Carregando câmera...</Text>
      </View>
    );
  }

  // Se a permissão não foi concedida
  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View style={styles.permissionCard}>
          <View style={styles.permissionIconCircle}>
            <MaterialIcons name="no-photography" size={48} color="#ef4444" />
          </View>

          <Text style={styles.permissionTitle}>Permissão Necessária</Text>
          <Text style={styles.permissionDescription}>
            Precisamos de permissão para exibir e usar a câmera para escanear
            códigos de barras e identificar produtos do seu estoque.
          </Text>

          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="camera-alt"
              size={20}
              color="#ffffff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.permissionButtonText}>Permitir Acesso à Câmera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Câmera Real com Expo CameraView */}
      <CameraView
        ref={camRef}
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Header Superior */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={22} color="#f8fafc" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Leitor KeepStock</Text>

        <View style={styles.headerActions}>
          {/* Botão de Alternar Câmera Frontal / Traseira */}
          <TouchableOpacity
            style={[styles.headerIconBtn, { marginRight: 8 }]}
            onPress={toggleFacing}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons name="flip-camera-ios" size={22} color="#f8fafc" />
          </TouchableOpacity>

          {/* Botão de Lanterna / Flash */}
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
      </View>

      {/* Notificação Toast de Sucesso no topo */}
      {notificacaoSucesso && (
        <View style={styles.toastContainer}>
          <Feather name="check-circle" size={16} color="#34d399" style={{ marginRight: 8 }} />
          <Text style={styles.toastText} numberOfLines={1}>
            {notificacaoSucesso}
          </Text>
        </View>
      )}

      {/* Retículo / Mira Central do Scanner */}
      <View style={styles.viewfinderContainer} pointerEvents="box-none">
        <View style={[styles.reticleBox, scanned && styles.reticleBoxScanned]}>
          {/* 4 cantos estilizados */}
          <View style={[styles.corner, styles.cornerTL, scanned && styles.cornerScanned]} />
          <View style={[styles.corner, styles.cornerTR, scanned && styles.cornerScanned]} />
          <View style={[styles.corner, styles.cornerBL, scanned && styles.cornerScanned]} />
          <View style={[styles.corner, styles.cornerBR, scanned && styles.cornerScanned]} />

          {/* Linha laser de leitura */}
          <View style={[styles.laserLine, scanned && styles.laserScanned]} />

          {/* Indicador quando já leu o código */}
          {scanned && (
            <TouchableOpacity
              style={styles.scannedBadge}
              onPress={() => setScanned(false)}
              activeOpacity={0.8}
            >
              <Feather name="refresh-cw" size={14} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.scannedBadgeText}>Ler outro código</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Botão de Tirar Foto */}
      <View style={styles.captureContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.buttonTake}
          onPress={takePicture}
          disabled={isTakingPhoto}
          activeOpacity={0.8}
        >
          <View style={styles.buttonTakeInner}>
            {isTakingPhoto ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <MaterialIcons name="camera" size={32} color="#ffffff" />
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.captureHint}>Fotografar produto</Text>
      </View>

      {/* Bottom Sheet com Informações do Produto Lido */}
      <View style={styles.bottomSheet}>
        {/* Puxador da Gaveta */}
        <View style={styles.dragHandle} />

        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#38bdf8" />
            <Text style={styles.loadingText}>Buscando dados do produto...</Text>
          </View>
        ) : (
          produtoDetectado ? <>
            {/* Tag de Status de Reconhecimento */}
            <View style={styles.badgeRow}>
              <View style={styles.tagSuccess}>
                <Feather name="check" size={12} color="#34d399" style={{ marginRight: 4 }} />
                <Text style={styles.tagSuccessText}>Produto Identificado</Text>
              </View>

              {produtoDetectado.local && (
                <View style={styles.tagLocation}>
                  <Feather name="map-pin" size={11} color="#94a3b8" style={{ marginRight: 4 }} />
                  <Text style={styles.tagLocationText}>{produtoDetectado.local}</Text>
                </View>
              )}
            </View>

            {/* Informações do Produto Lido */}
            <View style={styles.productRow}>
              <Image
                source={{ uri: produtoDetectado.imagem }}
                style={styles.productThumb}
              />
              <View style={styles.productDetails}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {produtoDetectado.nome}
                </Text>

                <View style={styles.codeRow}>
                  <Feather
                    name="bar-chart-2"
                    size={13}
                    color="#94a3b8"
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.productCode}>
                    Cód: {produtoDetectado.codigo}
                  </Text>
                  {produtoDetectado.categoria && (
                    <Text style={styles.categoryBadge}>
                      • {produtoDetectado.categoria}
                    </Text>
                  )}
                </View>

                <View style={styles.stockValueRow}>
                  <Text style={styles.stockText}>
                    Estoque: <Text style={styles.stockHighlight}>{produtoDetectado.estoque} un.</Text>
                  </Text>
                  {produtoDetectado.valor && (
                    <Text style={styles.priceText}>{produtoDetectado.valor}</Text>
                  )}
                </View>
              </View>

              {/* Botão Ver Detalhes */}
              <TouchableOpacity
                style={styles.detailsBtn}
                onPress={handleVerDetalhes}
                activeOpacity={0.7}
              >
                <Feather name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* 3 Botões de Ação Imediata (Entrada, Saída, Ajuste) */}
            <View style={styles.actionsGrid}>
              {/* Ação 1: Entrada */}
              <TouchableOpacity
                style={[styles.actionCard, styles.actionCardIn]}
                activeOpacity={0.8}
                onPress={() => handleAcao("Entrada")}
              >
                <View
                  style={[
                    styles.actionIconCircle,
                    { backgroundColor: "rgba(52, 211, 153, 0.2)" },
                  ]}
                >
                  <Feather name="arrow-down" size={18} color="#34d399" />
                </View>
                <Text style={[styles.actionTitle, { color: "#34d399" }]}>
                  Entrada
                </Text>
                <Text style={styles.actionSubtitle}>Adicionar</Text>
              </TouchableOpacity>

              {/* Ação 2: Saída */}
              <TouchableOpacity
                style={[styles.actionCard, styles.actionCardOut]}
                activeOpacity={0.8}
                onPress={() => handleAcao("Saída")}
              >
                <View
                  style={[
                    styles.actionIconCircle,
                    { backgroundColor: "rgba(248, 113, 113, 0.2)" },
                  ]}
                >
                  <Feather name="arrow-up" size={18} color="#f87171" />
                </View>
                <Text style={[styles.actionTitle, { color: "#f87171" }]}>
                  Saída
                </Text>
                <Text style={styles.actionSubtitle}>Remover</Text>
              </TouchableOpacity>

              {/* Ação 3: Ajuste */}
              <TouchableOpacity
                style={[styles.actionCard, styles.actionCardAdjust]}
                activeOpacity={0.8}
                onPress={() => handleAcao("Ajuste")}
              >
                <View
                  style={[
                    styles.actionIconCircle,
                    { backgroundColor: "rgba(129, 140, 248, 0.2)" },
                  ]}
                >
                  <Feather name="edit-2" size={16} color="#818cf8" />
                </View>
                <Text style={[styles.actionTitle, { color: "#818cf8" }]}>
                  Ajuste
                </Text>
                <Text style={styles.actionSubtitle}>Quantidade</Text>
              </TouchableOpacity>
            </View>
          </> : (
            <View style={styles.loadingContainer}>
              <Feather name="maximize" size={26} color="#94a3b8" />
              <Text style={styles.loadingText}>Aponte a câmera para o código de barras de um produto cadastrado.</Text>
            </View>
          )
        )}
      </View>

      {/* Modal de Foto Capturada */}
      {capturedPhoto && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={open}
          onRequestClose={() => setOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Foto Capturada</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setOpen(false)}
                >
                  <MaterialIcons name="close" size={26} color="#f8fafc" />
                </TouchableOpacity>
              </View>

              <Image
                style={styles.photo}
                source={{ uri: capturedPhoto }}
                resizeMode="cover"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalBtnSecondary}
                  onPress={() => setOpen(false)}
                >
                  <Text style={styles.modalBtnSecondaryText}>Descartar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalBtnPrimary}
                  onPress={handleUsePhotoForProduct}
                >
                  <MaterialIcons
                    name="check"
                    size={18}
                    color="#ffffff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.modalBtnPrimaryText}>
                    Usar no Produto
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  permissionContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 24,
  },
  permissionCard: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    width: "100%",
    maxWidth: 380,
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  permissionIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  permissionTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  permissionDescription: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  permissionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0284c7",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    width: "100%",
    marginBottom: 12,
  },
  permissionButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  permissionText: {
    color: "#94a3b8",
    fontSize: 15,
    marginTop: 12,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  headerTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "700",
  },
  toastContainer: {
    position: "absolute",
    top: 110,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.4)",
    zIndex: 20,
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "600",
  },
  viewfinderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -40,
  },
  reticleBox: {
    width: 250,
    height: 250,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  reticleBoxScanned: {
    borderColor: "#10b981",
  },
  corner: {
    position: "absolute",
    width: 38,
    height: 38,
    borderColor: "#38bdf8",
  },
  cornerScanned: {
    borderColor: "#10b981",
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
    width: "88%",
    height: 2,
    backgroundColor: "#38bdf8",
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  laserScanned: {
    backgroundColor: "#10b981",
    shadowColor: "#059669",
  },
  scannedBadge: {
    position: "absolute",
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  scannedBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  captureContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  buttonTake: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonTakeInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0284c7",
    justifyContent: "center",
    alignItems: "center",
  },
  captureHint: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 11,
    marginTop: 5,
    fontWeight: "500",
  },
  bottomSheet: {
    backgroundColor: "#161f32",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
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
    marginBottom: 12,
  },
  loadingContainer: {
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 10,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tagSuccess: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52, 211, 153, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagSuccessText: {
    color: "#34d399",
    fontSize: 11,
    fontWeight: "700",
  },
  tagLocation: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagLocationText: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "500",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#25334d",
  },
  productThumb: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#0f172a",
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
    lineHeight: 19,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  productCode: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "600",
  },
  categoryBadge: {
    color: "#38bdf8",
    fontSize: 11,
    marginLeft: 4,
    fontWeight: "500",
  },
  stockValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 6,
  },
  stockText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  stockHighlight: {
    color: "#f8fafc",
    fontWeight: "700",
  },
  priceText: {
    color: "#34d399",
    fontSize: 12,
    fontWeight: "700",
  },
  detailsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  actionSubtitle: {
    color: "#64748b",
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  photo: {
    width: "100%",
    height: 320,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  modalBtnSecondary: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnSecondaryText: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "600",
  },
  modalBtnPrimary: {
    flex: 1.4,
    flexDirection: "row",
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#0284c7",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnPrimaryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
