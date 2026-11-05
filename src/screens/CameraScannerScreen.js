import React, { useState, useEffect, useRef, useCallback } from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Keyboard,
  StatusBar,
  Platform,
  Linking,
} from "react-native";

import { Feather, MaterialIcons } from "@expo/vector-icons";

import { CameraView, useCameraPermissions } from "expo-camera";

import { useFocusEffect, useIsFocused } from "@react-navigation/native";

import { buscarProdutoPorCodigo } from "../services/produtosService";

// ============================================================
// CORES DO KEEPSTOCK
// ============================================================

const C = {
  background: "#090F20",
  panel: "#152039",
  surface: "#202C49",
  border: "#344263",
  text: "#F4F5FF",
  muted: "#9DA9C4",
  accent: "#AAA8FF",
  primary: "#6554FF",
  green: "#34D399",
  red: "#FB7185",
  amber: "#FBBF24",
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function CameraScannerScreen({ navigation, route }) {
  // ==========================================================
  // PERMISSÕES E FOCO
  // ==========================================================

  const [permission, requestPermission] = useCameraPermissions();

  const isFocused = useIsFocused();

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [facing, setFacing] = useState("back");
  const [torch, setTorch] = useState(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const [cameraKey, setCameraKey] = useState(0);

  const [codigoManual, setCodigoManual] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [scanned, setScanned] = useState(false);

  const [produtoDetectado, setProdutoDetectado] = useState(
    route?.params?.produto || null,
  );

  const [notificacaoSucesso, setNotificacaoSucesso] = useState(null);

  const scanLock = useRef(false);
  const searchingRef = useRef(false);

  // ==========================================================
  // SOLICITAR PERMISSÃO
  // ==========================================================

  useEffect(() => {
    if (
      isFocused &&
      permission &&
      !permission.granted &&
      permission.canAskAgain
    ) {
      requestPermission();
    }
  }, [
    isFocused,
    permission?.granted,
    permission?.canAskAgain,
    requestPermission,
  ]);

  // ==========================================================
  // CONTROLE DA TELA
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      scanLock.current = false;

      setScanned(false);
      setCameraError(null);
      setCameraReady(false);

      return () => {
        scanLock.current = true;

        setTorch(false);
        setCameraReady(false);
      };
    }, []),
  );

  // ==========================================================
  // REINICIAR CÂMERA
  // ==========================================================

  function reiniciarCamera() {
    setTorch(false);
    setCameraReady(false);
    setCameraError(null);

    scanLock.current = false;
    setScanned(false);

    setCameraKey((anterior) => anterior + 1);
  }

  // ==========================================================
  // REINICIAR LEITOR
  // ==========================================================

  function reiniciarLeitura() {
    if (searchingRef.current) return;

    scanLock.current = false;

    setScanned(false);
    setNotificacaoSucesso(null);
  }

  // ==========================================================
  // ERRO DA CÂMERA
  // ==========================================================

  function handleCameraError(error) {
    const mensagem = error?.message || "Erro desconhecido na câmera";

    console.log("ERRO CAMERA KEEPSTOCK:", mensagem);

    setCameraReady(false);
    setCameraError(mensagem);
  }

  // ==========================================================
  // TROCAR CÂMERA
  // ==========================================================

  function toggleFacing() {
    setTorch(false);
    setCameraReady(false);
    setCameraError(null);

    setFacing((anterior) => (anterior === "back" ? "front" : "back"));

    setCameraKey((anterior) => anterior + 1);
  }

  // ==========================================================
  // LANTERNA
  // ==========================================================

  function toggleTorch() {
    if (facing !== "back") return;

    setTorch((anterior) => !anterior);
  }

  // ==========================================================
  // BUSCAR PRODUTO
  // ==========================================================

  async function pesquisarProduto(codigoInformado) {
    const codigo = String(codigoInformado || "").trim();

    if (!codigo) {
      Alert.alert("Código obrigatório", "Digite ou escaneie um código.");
      return;
    }

    if (searchingRef.current) return;

    searchingRef.current = true;
    scanLock.current = true;

    Keyboard.dismiss();

    setScanned(true);
    setIsSearching(true);
    setNotificacaoSucesso(null);

    try {
      const produtoEncontrado = await buscarProdutoPorCodigo(codigo);

      if (!produtoEncontrado) {
        Alert.alert(
          "Produto não encontrado",
          `Nenhum produto encontrado para o código "${codigo}".`,
        );

        return;
      }

      setProdutoDetectado(produtoEncontrado);
      setCodigoManual(codigo);

      const nome =
        produtoEncontrado.nome ||
        produtoEncontrado.name ||
        "Produto identificado";

      setNotificacaoSucesso(nome);

      navigation.navigate("ResultadoLeitura", {
        codigo:
          produtoEncontrado.codigo ||
          produtoEncontrado.sku ||
          produtoEncontrado.codigo_barras ||
          codigo,

        produto: produtoEncontrado,
      });
    } catch (error) {
      console.log(
        "ERRO BUSCA PRODUTO:",
        error?.response?.data || error?.message,
      );

      Alert.alert(
        "Erro ao buscar produto",
        "Não foi possível consultar o código. Verifique sua conexão.",
      );
    } finally {
      searchingRef.current = false;

      setIsSearching(false);
      setScanned(false);

      scanLock.current = !isFocused;
    }
  }

  // ==========================================================
  // LEITURA DE QR CODE E CÓDIGO DE BARRAS
  // ==========================================================

  function handleBarCodeScanned(resultado) {
    if (scanLock.current || searchingRef.current || !isFocused) {
      return;
    }

    const codigo = String(resultado?.data || "").trim();

    if (!codigo) return;

    console.log("CODIGO ESCANEADO:", codigo);

    scanLock.current = true;

    pesquisarProduto(codigo);
  }

  // ==========================================================
  // BUSCA MANUAL
  // ==========================================================

  function handleBuscarManual() {
    if (searchingRef.current) return;

    const codigo = codigoManual.trim();

    if (!codigo) {
      Alert.alert("Digite um código", "Informe o código de barras ou QR Code.");

      return;
    }

    pesquisarProduto(codigo);
  }

  // ==========================================================
  // MOVIMENTAÇÃO DE ESTOQUE
  // ==========================================================

  function handleAcao(tipo) {
    if (!produtoDetectado) {
      Alert.alert("Atenção", "Leia ou pesquise um produto primeiro.");
      return;
    }

    navigation.navigate("ConfirmacaoMovimento", {
      produto: {
        ...produtoDetectado,

        id:
          produtoDetectado.id ||
          produtoDetectado._id ||
          produtoDetectado.produto_id,

        nome: produtoDetectado.nome || produtoDetectado.name,

        codigo:
          produtoDetectado.codigo ||
          produtoDetectado.sku ||
          produtoDetectado.codigo_barras,

        quantidade: undefined,
        tipo,
        imagem: produtoDetectado.imagem,
      },
    });
  }

  // ==========================================================
  // GERAR QR CODE
  // ==========================================================

  function handleGenerateQR() {
    if (!produtoDetectado) {
      Alert.alert("Atenção", "Selecione um produto primeiro.");
      return;
    }

    navigation.navigate("QRCodeProduto", {
      produto: produtoDetectado,
    });
  }

  // ==========================================================
  // DETALHES
  // ==========================================================

  function handleVerDetalhes() {
    if (!produtoDetectado) return;

    navigation.navigate("DetalhesProduto", {
      produto: produtoDetectado,
    });
  }

  // ==========================================================
  // PERMISSÃO
  // ==========================================================

  const cameraPermitida = permission?.granted === true;

  // ==========================================================
  // INTERFACE
  // ==========================================================

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.background} />

      {/* ================================================== */}
      {/* ÁREA DA CÂMERA */}
      {/* ================================================== */}

      <View style={styles.cameraArea}>
        {/* CÂMERA NATIVA */}

        {cameraPermitida && isFocused && !cameraError && (
          <CameraView
            key={`${facing}-${cameraKey}`}
            style={styles.cameraPreview}
            facing={facing}
            active={isFocused}
            enableTorch={torch && facing === "back"}
            barcodeScannerSettings={{
              barcodeTypes: [
                "qr",
                "ean13",
                "ean8",
                "code128",
                "code39",
                "upc_a",
                "upc_e",
                "itf14",
              ],
            }}
            onCameraReady={() => {
              console.log("CAMERA KEEPSTOCK INICIADA!");

              setCameraReady(true);
              setCameraError(null);
            }}
            onMountError={handleCameraError}
            onBarcodeScanned={
              scanned || isSearching ? undefined : handleBarCodeScanned
            }
          />
        )}

        {/* PERMISSÃO NÃO CONCEDIDA */}

        {!cameraPermitida && (
          <View style={styles.cameraUnavailable}>
            <MaterialIcons name="qr-code-scanner" size={55} color={C.accent} />

            <Text style={styles.cameraUnavailableTitle}>Leitor de códigos</Text>

            <Text style={styles.cameraUnavailableText}>
              Autorize o acesso à câmera para escanear QR Codes e códigos de
              barras.
            </Text>

            <TouchableOpacity
              style={styles.permissionButton}
              onPress={() => {
                if (permission?.canAskAgain) {
                  requestPermission();
                } else {
                  Linking.openSettings();
                }
              }}
            >
              <Feather name="camera" size={18} color="#FFFFFF" />

              <Text style={styles.permissionButtonText}>Permitir câmera</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ERRO AO INICIAR CÂMERA */}

        {cameraPermitida && cameraError && (
          <View style={styles.cameraUnavailable}>
            <Feather name="camera-off" size={48} color={C.red} />

            <Text style={styles.cameraUnavailableTitle}>
              Câmera indisponível
            </Text>

            <Text style={styles.cameraUnavailableText}>
              Não foi possível iniciar a câmera. Você pode tentar novamente ou
              usar a busca manual.
            </Text>

            <Text style={styles.errorDetails}>{cameraError}</Text>

            <TouchableOpacity
              style={styles.permissionButton}
              onPress={reiniciarCamera}
            >
              <Feather name="refresh-cw" size={17} color="#FFFFFF" />

              <Text style={styles.permissionButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================================================== */}
        {/* CABEÇALHO */}
        {/* ================================================== */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Scanner KeepStock</Text>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={toggleFacing}
              disabled={!cameraPermitida || !!cameraError}
            >
              <MaterialIcons name="flip-camera-ios" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerIconBtn, { marginLeft: 8 }]}
              onPress={toggleTorch}
              disabled={!cameraPermitida || facing !== "back" || !!cameraError}
            >
              <Feather
                name="zap"
                size={21}
                color={torch ? C.amber : "#FFFFFF"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================================================== */}
        {/* QUADRO DO SCANNER */}
        {/* ================================================== */}

        {cameraPermitida && isFocused && !cameraError && (
          <View style={styles.scannerCenter} pointerEvents="none">
            <View style={[styles.reticleBox, scanned && { opacity: 0.6 }]}>
              <View style={[styles.corner, styles.cornerTL]} />

              <View style={[styles.corner, styles.cornerTR]} />

              <View style={[styles.corner, styles.cornerBL]} />

              <View style={[styles.corner, styles.cornerBR]} />
            </View>

            <View style={styles.scanInstruction}>
              <Text style={styles.scanInstructionTitle}>
                Aponte a câmera para o código
              </Text>

              <Text style={styles.scanInstructionSubtitle}>
                QR Code ou código de barras
              </Text>
            </View>

            {isSearching && (
              <View style={styles.scanStatus}>
                <ActivityIndicator color={C.accent} size="small" />

                <Text style={styles.scanStatusText}>Consultando código...</Text>
              </View>
            )}

            {!cameraReady && (
              <View style={styles.loadingStatus}>
                <ActivityIndicator color={C.accent} size="small" />

                <Text style={styles.scanStatusText}>
                  Inicializando câmera...
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* ================================================== */}
      {/* PAINEL INFERIOR */}
      {/* ================================================== */}

      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bottomContent}
        >
          {/* BUSCA MANUAL */}

          <View style={styles.manualHeader}>
            <View style={styles.manualIcon}>
              <Feather name="edit-3" size={18} color={C.accent} />
            </View>

            <View style={styles.manualHeaderText}>
              <Text style={styles.manualTitle}>Digitar código manualmente</Text>

              <Text style={styles.manualSubtitle}>
                QR Code ou código de barras
              </Text>
            </View>
          </View>

          {/* CAMPO DO CÓDIGO */}

          <View style={styles.manualInputRow}>
            <View style={styles.manualInputBox}>
              <Feather name="hash" size={19} color={C.muted} />

              <TextInput
                style={styles.manualInput}
                value={codigoManual}
                onChangeText={setCodigoManual}
                placeholder="Digite ou cole o código"
                placeholderTextColor={C.muted}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={handleBuscarManual}
                editable={!isSearching}
              />

              {codigoManual.length > 0 && (
                <TouchableOpacity
                  onPress={() => setCodigoManual("")}
                  disabled={isSearching}
                >
                  <Feather name="x-circle" size={18} color={C.muted} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.manualSearchButton}
              onPress={handleBuscarManual}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Feather name="search" size={21} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {/* BOTÃO BUSCAR */}

          <TouchableOpacity
            style={[styles.searchButton, isSearching && { opacity: 0.6 }]}
            onPress={handleBuscarManual}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Feather name="search" size={18} color="#FFFFFF" />

                <Text style={styles.searchButtonText}>Buscar produto</Text>
              </>
            )}
          </TouchableOpacity>

          {/* NOTIFICAÇÃO */}

          {notificacaoSucesso && (
            <View style={styles.successNotice}>
              <Feather name="check-circle" size={18} color={C.green} />

              <Text style={styles.successNoticeText}>{notificacaoSucesso}</Text>
            </View>
          )}

          {/* ================================================== */}
          {/* PRODUTO ENCONTRADO */}
          {/* ================================================== */}

          {produtoDetectado && (
            <View style={styles.productSection}>
              <View style={styles.sectionDivider} />

              <View style={styles.productSectionHeader}>
                <Feather name="check-circle" size={17} color={C.green} />

                <Text style={styles.productSectionTitle}>
                  Produto identificado
                </Text>
              </View>

              <View style={styles.productRow}>
                {produtoDetectado.imagem ? (
                  <Image
                    source={{
                      uri: produtoDetectado.imagem,
                    }}
                    style={styles.productThumb}
                  />
                ) : (
                  <View style={[styles.productThumb, styles.imagePlaceholder]}>
                    <Feather name="package" size={27} color={C.muted} />
                  </View>
                )}

                <View style={styles.productDetails}>
                  <Text style={styles.productTitle}>
                    {produtoDetectado.nome ||
                      produtoDetectado.name ||
                      "Produto"}
                  </Text>

                  <Text style={styles.productCode}>
                    Código:{" "}
                    {produtoDetectado.codigo ||
                      produtoDetectado.sku ||
                      produtoDetectado.codigo_barras ||
                      "—"}
                  </Text>

                  <Text style={styles.stockText}>
                    Estoque:{" "}
                    <Text style={styles.stockHighlight}>
                      {produtoDetectado.estoque ?? 0} un.
                    </Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.detailsBtn}
                  onPress={handleVerDetalhes}
                >
                  <Feather name="chevron-right" size={21} color={C.accent} />
                </TouchableOpacity>
              </View>

              {/* GERAR QR CODE */}

              <TouchableOpacity
                style={styles.qrCodeButton}
                onPress={handleGenerateQR}
              >
                <MaterialIcons name="qr-code-2" size={21} color={C.accent} />

                <Text style={styles.qrCodeButtonText}>
                  Gerar QR Code do produto
                </Text>
              </TouchableOpacity>

              {/* AÇÕES DE ESTOQUE */}

              <View style={styles.actionsGrid}>
                <TouchableOpacity
                  style={[styles.actionCard, styles.actionCardIn]}
                  onPress={() => handleAcao("Entrada")}
                >
                  <Feather name="arrow-down" size={21} color={C.green} />

                  <Text style={[styles.actionTitle, { color: C.green }]}>
                    Entrada
                  </Text>

                  <Text style={styles.actionSubtitle}>Adicionar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionCard, styles.actionCardOut]}
                  onPress={() => handleAcao("Saída")}
                >
                  <Feather name="arrow-up" size={21} color={C.red} />

                  <Text style={[styles.actionTitle, { color: C.red }]}>
                    Saída
                  </Text>

                  <Text style={styles.actionSubtitle}>Remover</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionCard, styles.actionCardAdjust]}
                  onPress={() => handleAcao("Ajuste")}
                >
                  <Feather name="edit-2" size={19} color={C.accent} />

                  <Text style={[styles.actionTitle, { color: C.accent }]}>
                    Ajuste
                  </Text>

                  <Text style={styles.actionSubtitle}>Quantidade</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!produtoDetectado && !isSearching && (
            <View style={styles.emptyNotice}>
              <Feather name="info" size={17} color={C.muted} />

              <Text style={styles.emptyNoticeText}>
                Escaneie ou digite o código de um produto cadastrado no
                KeepStock.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },

  cameraArea: {
    flex: 1,
    minHeight: 260,
    overflow: "hidden",
    backgroundColor: "transparent",
  },

  cameraPreview: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },

  cameraUnavailable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 65,
  },

  cameraUnavailableTitle: {
    color: C.text,
    fontSize: 19,
    fontWeight: "800",
    marginTop: 12,
  },

  cameraUnavailableText: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 9,
    marginBottom: 17,
  },

  errorDetails: {
    color: C.red,
    fontSize: 11,
    textAlign: "center",
    marginBottom: 15,
  },

  permissionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // ==========================================================
  // CABEÇALHO
  // ==========================================================

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 14 : 55,
    paddingHorizontal: 18,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIconBtn: {
    width: 41,
    height: 41,
    borderRadius: 13,
    backgroundColor: "rgba(15,23,42,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // QUADRO DO SCANNER
  // ==========================================================

  scannerCenter: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 70,
  },

  reticleBox: {
    backgroundColor: "transparent",
    width: 210,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  corner: {
    position: "absolute",
    width: 33,
    height: 33,
    borderColor: C.accent,
  },

  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },

  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },

  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },

  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },

  scanInstruction: {
    marginTop: 17,
    backgroundColor: "rgba(6,13,30,0.78)",
    paddingVertical: 11,
    paddingHorizontal: 17,
    borderRadius: 14,
    alignItems: "center",
    maxWidth: "90%",
  },

  scanInstructionTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },

  scanInstructionSubtitle: {
    color: "#C3BAFF",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },

  scanStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.panel,
    borderRadius: 12,
    padding: 10,
    gap: 9,
    marginTop: 10,
  },

  scanStatusText: {
    color: C.text,
    fontSize: 12,
  },

  loadingStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(3,7,19,0.65)",
    borderRadius: 12,
    padding: 10,
    gap: 9,
    marginTop: 10,
  },

  // ==========================================================
  // PAINEL INFERIOR
  // ==========================================================

  bottomSheet: {
    backgroundColor: C.panel,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderTopWidth: 1,
    borderColor: C.border,
    maxHeight: "62%",
    minHeight: 220,
    paddingTop: 12,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },

  bottomContent: {
    paddingBottom: 14,
  },

  dragHandle: {
    width: 45,
    height: 4,
    backgroundColor: "#52617C",
    borderRadius: 5,
    alignSelf: "center",
    marginBottom: 16,
  },

  manualHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  manualIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(170,168,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  manualHeaderText: {
    flex: 1,
  },

  manualTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: "800",
  },

  manualSubtitle: {
    color: C.muted,
    fontSize: 11,
    marginTop: 3,
  },

  manualInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 11,
  },

  manualInputBox: {
    flex: 1,
    minHeight: 53,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    backgroundColor: C.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    gap: 9,
  },

  manualInput: {
    flex: 1,
    color: C.text,
    fontSize: 14,
    paddingVertical: 12,
    minWidth: 0,
  },

  manualSearchButton: {
    width: 53,
    height: 53,
    backgroundColor: C.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  searchButton: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },

  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  successNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "rgba(52,211,153,0.10)",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.24)",
    borderRadius: 13,
    padding: 12,
    marginTop: 10,
  },

  successNoticeText: {
    color: C.green,
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },

  emptyNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 11,
    paddingBottom: 4,
  },

  emptyNoticeText: {
    flex: 1,
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
  },

  // ==========================================================
  // PRODUTO
  // ==========================================================

  sectionDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 15,
  },

  productSection: {
    paddingBottom: 5,
  },

  productSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  productSectionTitle: {
    color: C.green,
    fontSize: 12,
    fontWeight: "800",
  },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 15,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
  },

  productThumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: C.background,
    marginRight: 11,
  },

  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },

  productDetails: {
    flex: 1,
  },

  productTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 5,
  },

  productCode: {
    color: C.muted,
    fontSize: 11,
    marginBottom: 4,
  },

  stockText: {
    color: C.muted,
    fontSize: 11,
  },

  stockHighlight: {
    color: C.text,
    fontWeight: "800",
  },

  detailsBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  qrCodeButton: {
    minHeight: 47,
    borderRadius: 12,
    backgroundColor: "rgba(170,168,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(170,168,255,0.27)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginBottom: 13,
  },

  qrCodeButtonText: {
    color: C.accent,
    fontSize: 13,
    fontWeight: "700",
  },

  // ==========================================================
  // MOVIMENTAÇÕES
  // ==========================================================

  actionsGrid: {
    flexDirection: "row",
    gap: 9,
  },

  actionCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },

  actionCardIn: {
    backgroundColor: "rgba(52,211,153,0.08)",
    borderColor: "rgba(52,211,153,0.24)",
  },

  actionCardOut: {
    backgroundColor: "rgba(251,113,133,0.08)",
    borderColor: "rgba(251,113,133,0.24)",
  },

  actionCardAdjust: {
    backgroundColor: "rgba(170,168,255,0.08)",
    borderColor: "rgba(170,168,255,0.24)",
  },

  actionTitle: {
    fontSize: 12,
    fontWeight: "800",
  },

  actionSubtitle: {
    color: C.muted,
    fontSize: 10,
  },
});
