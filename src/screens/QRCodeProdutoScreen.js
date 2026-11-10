import ScreenBackground from "../components/ScreenBackground";

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function QRCodeProdutoScreen({ route }) {
  const produto = route?.params?.produto ?? {
    codigo: "7891234560010",
    nome: "Água Mineral 500ml",
    categoria: "Bebidas",
    local: "Setor A - Corredor 1",
  };

  return (
    <ScreenBackground>
<View style={[styles.container, { backgroundColor: "transparent" }]}>
      <Text style={styles.titulo}>QR Code do produto</Text>

      <Text style={styles.nome}>{produto.nome}</Text>
      <Text style={styles.info}>
        Categoria: {produto.categoria}
      </Text>
      <Text style={styles.info}>
        Local: {produto.local}
      </Text>

      <View style={styles.qrContainer}>
        <QRCode
          value={String(produto.codigo)}
          size={220}
          backgroundColor="white"
          color="black"
        />
      </View>

      <Text style={styles.codigo}>
        Código: {produto.codigo}
      </Text>

      <Text style={styles.instrucao}>
        Escaneie este QR Code para identificar
        o produto no estoque.
      </Text>
    </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#F1F5F9",
  },
  nome: {
    color: "#F1F5F9",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  info: {
    fontSize: 15,
    color: "#94A3B8",
    marginBottom: 5,
  },
  qrContainer: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    marginVertical: 24,
  },
  codigo: {
    color: "#F1F5F9",
    fontSize: 15,
    fontWeight: "600",
  },
  instrucao: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 12,
  },
});
