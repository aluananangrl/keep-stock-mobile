import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function CameraScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastCode, setLastCode] = useState("");

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;

    const codigo = (data || "").trim();

    setScanned(true);
    setLastCode(codigo);

    if (!codigo || !codigo.toUpperCase().includes("WHS") ) {
      navigation.navigate("ErroScanner", { codigo: codigo || "Código inválido" });
      return;
    }

    navigation.navigate("ResultadoLeitura", {
      codigo,
      produto: {
        nome: "Água Mineral 500ml",
        codigo,
        local: "Setor A",
        estoque: 38,
        valor: "R$ 4,90",
      },
    });
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Inicializando câmera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Permissão da câmera</Text>
        <Text style={styles.permissionText}>
          Para escanear QR Codes, precisamos da sua permissão para usar a câmera.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Permitir câmera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View style={styles.headerOverlay}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.headerText}>Posicione o QR Code na área</Text>
      </View>

      <View style={styles.scanFrame} />

      {lastCode ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Último QR Code</Text>
          <Text style={styles.resultValue}>{lastCode}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#101828",
  },

  loadingText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "600",
  },

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 24,
  },

  permissionTitle: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 12,
  },

  permissionText: {
    color: "#cbd5e1",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },

  primaryButton: {
    backgroundColor: "#7775ff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },

  secondaryButton: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: "100%",
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "600",
  },

  headerOverlay: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  closeButtonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },

  headerText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 12,
    textAlign: "center",
    flex: 1,
  },

  scanFrame: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 250,
    height: 250,
    marginLeft: -125,
    marginTop: -125,
    borderWidth: 2,
    borderColor: "#8b5cf6",
    borderRadius: 18,
    backgroundColor: "transparent",
    zIndex: 2,
  },

  resultBox: {
    position: "absolute",
    bottom: 32,
    left: 20,
    right: 20,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderRadius: 12,
    padding: 14,
    zIndex: 2,
  },

  resultLabel: {
    color: "#a5b4fc",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 0.5,
  },

  resultValue: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "600",
  },
});
