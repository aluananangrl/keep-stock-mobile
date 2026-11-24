import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import ScreenBackground from "../components/ScreenBackground";
import Barcode128 from "../components/Barcode128";

export default function QRCodeProdutoScreen({ navigation, route }) {
  const produto = route?.params?.produto ?? null;
  const codigo = String(
    produto?.codigo ?? produto?.codigo_barras ?? produto?.sku ?? "",
  ).trim();
  const nome = produto?.nome ?? produto?.nome_produto ?? "Produto";
  const categoria =
    typeof produto?.categoria === "object"
      ? produto?.categoria?.nome
      : produto?.categoria;
  const qrRef = useRef(null);
  const barraRef = useRef(null);
  const [salvando, setSalvando] = useState("");

  async function salvarImagem(ref, tipo) {
    if (!codigo || !ref.current || salvando) return;

    setSalvando(tipo);

    try {
      // Solicita apenas permissão para fotos
      const permissao = await MediaLibrary.requestPermissionsAsync(true, [
        "photo",
      ]);

      if (!permissao.granted) {
        Alert.alert(
          "Permissão necessária",
          "Permita salvar imagens na galeria do celular.",
        );
        return;
      }

      // Captura o QR Code ou código de barras
      const uri = await captureRef(ref.current, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      // Salva a imagem na galeria
      await MediaLibrary.saveToLibraryAsync(uri);

      Alert.alert("Imagem salva!", `${tipo} salvo na galeria do celular.`);
    } catch (error) {
      console.warn("Erro ao salvar identificação:", error);

      Alert.alert(
        "Não foi possível salvar",
        error?.message || "Tente novamente.",
      );
    } finally {
      setSalvando("");
    }
  }

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={s.container}>
        <TouchableOpacity style={s.voltar} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={s.titulo}>Identificação do produto</Text>
        <Text style={s.nome}>{nome}</Text>
        {!!categoria && <Text style={s.info}>Categoria: {categoria}</Text>}
        {!codigo ? (
          <Text style={s.aviso}>
            Este produto ainda não possui código cadastrado.
          </Text>
        ) : (
          <>
            <Text style={s.codigo}>Código único: {codigo}</Text>
            <Text style={s.info}>
              O mesmo valor identifica os dois formatos.
            </Text>
            <Text style={s.rotulo}>QR Code</Text>
            <View collapsable={false} ref={qrRef} style={s.qrContainer}>
              <QRCode
                value={codigo}
                size={205}
                backgroundColor="white"
                color="black"
              />
              <Text style={s.identificador}>{codigo}</Text>
            </View>
            <TouchableOpacity
              style={s.botao}
              onPress={() => salvarImagem(qrRef, "QR Code")}
              disabled={!!salvando}
            >
              {salvando === "QR Code" ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Feather name="download" color="#fff" size={18} />
              )}
              <Text style={s.botaoTexto}>Salvar QR Code na galeria</Text>
            </TouchableOpacity>
            <Text style={s.rotulo}>Código de barras — Code 128</Text>
            <View collapsable={false} ref={barraRef} style={s.barrasContainer}>
              <Barcode128 value={codigo} width={265} height={80} />
            </View>
            <TouchableOpacity
              style={s.botao}
              onPress={() => salvarImagem(barraRef, "Código de barras")}
              disabled={!!salvando}
            >
              {salvando === "Código de barras" ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Feather name="download" color="#fff" size={18} />
              )}
              <Text style={s.botaoTexto}>
                Salvar código de barras na galeria
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
    alignItems: "center",
  },
  voltar: { alignSelf: "flex-start", marginBottom: 20 },
  titulo: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  nome: { color: "#fff", fontSize: 19, fontWeight: "700", textAlign: "center" },
  info: { color: "#a5b4d4", fontSize: 13, marginTop: 8, textAlign: "center" },
  codigo: { color: "#a8a1ff", fontSize: 17, fontWeight: "700", marginTop: 20 },
  rotulo: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 28,
    marginBottom: 12,
  },
  qrContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  barrasContainer: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    width: "100%",
  },
  identificador: { color: "#111827", fontWeight: "700", marginTop: 12 },
  botao: {
    marginTop: 13,
    backgroundColor: "#6754F5",
    borderRadius: 14,
    width: "100%",
    paddingVertical: 15,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  botaoTexto: { color: "#fff", fontWeight: "700", fontSize: 14 },
  aviso: { color: "#fda4af", marginTop: 32, textAlign: "center" },
});
