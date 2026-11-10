import { BRAND_COLORS } from "../context/colors";
import ScreenBackground from "../components/ScreenBackground";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from "../services/api";
import { getErrorMessage } from "../services/responseUtils";

const camposPorTipo = {
  categoria: [["nome", "Nome"], ["descricao", "Descrição"]],
  fornecedor: [["nome", "Nome"], ["cnpj", "CNPJ"], ["contato", "Contato"], ["endereco", "Endereço"]],
  perfil: [["nome", "Nome"], ["email", "E-mail"]],
};

export default function RegistroFormScreen({ navigation, route }) {
  const { tipo, registro } = route.params;
  const campos = camposPorTipo[tipo];
  const [valores, setValores] = useState(() =>
    Object.fromEntries(campos.map(([chave]) => [chave, String(registro?.[chave] ?? "")]))
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar() {
    const dados = Object.fromEntries(campos.map(([chave]) => [chave, valores[chave].trim()]));
    if (!dados.nome) {
      setErro("Informe o nome.");
      return;
    }
    if (tipo === "fornecedor" && !/^(\d{14}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/.test(dados.cnpj)) {
      setErro("Informe um CNPJ com 14 dígitos.");
      return;
    }
    if (tipo === "perfil" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      setErro("Informe um e-mail válido.");
      return;
    }

    setSalvando(true);
    setErro("");
    try {
      if (tipo === "perfil") {
        await api.atualizarUsuario(registro.id, { ...dados, email: dados.email.toLowerCase() });
      } else if (tipo === "categoria") {
        await (registro ? api.atualizarCategoria(registro.id, dados) : api.criarCategoria(dados));
      } else {
        await (registro ? api.atualizarFornecedor(registro.id, dados) : api.criarFornecedor(dados));
      }
      Alert.alert("Registro salvo", "As informações foram salvas.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      setErro(getErrorMessage(error, "Não foi possível salvar o registro."));
    } finally {
      setSalvando(false);
    }
  }

  const titulo = tipo === "perfil" ? "Editar perfil" :
    tipo === "categoria" ? (registro ? "Editar categoria" : "Nova categoria") :
      (registro ? "Editar fornecedor" : "Novo fornecedor");

  return (
    <ScreenBackground>
<ScrollView style={[s.screen, { backgroundColor: "transparent" }]} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>{titulo}</Text>
      {campos.map(([chave, label]) => (
        <View key={chave} style={s.field}>
          <Text style={s.label}>{label}</Text>
          <TextInput
            accessibilityLabel={label}
            style={s.input}
            value={valores[chave]}
            onChangeText={(texto) => setValores((atual) => ({ ...atual, [chave]: texto }))}
            keyboardType={chave === "email" ? "email-address" : chave === "cnpj" ? "number-pad" : "default"}
            autoCapitalize={chave === "email" ? "none" : "sentences"}
            editable={!salvando}
          />
        </View>
      ))}
      {!!erro && <Text accessibilityLiveRegion="polite" style={s.error}>{erro}</Text>}
      <TouchableOpacity style={s.save} onPress={salvar} disabled={salvando}>
        {salvando ? <ActivityIndicator color="#0b1220" /> : <Text style={s.saveText}>Salvar</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={s.cancel} onPress={() => navigation.goBack()} disabled={salvando}>
        <Text style={s.label}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0b1220" },
  content: { padding: 22, paddingTop: 64, gap: 16 },
  title: { color: "#f1f5f9", fontSize: 24, fontWeight: "800" },
  field: { gap: 6 },
  label: { color: "#f1f5f9", fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#243247", borderRadius: 12, color: "#f1f5f9", padding: 12 },
  error: { color: "#fb7185" },
  save: { backgroundColor: BRAND_COLORS.highlight, alignItems: "center", padding: 14, borderRadius: 12 },
  saveText: { color: "#0b1220", fontWeight: "800" },
  cancel: { alignItems: "center", padding: 12 },
});
