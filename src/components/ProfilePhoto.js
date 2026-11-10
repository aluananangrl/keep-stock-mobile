import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { Directory, File, Paths } from "expo-file-system";

export default function ProfilePhoto({ userId, initials, palette, disabled }) {
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const key = userId == null ? null : `foto_perfil_${userId}`;

  useEffect(() => {
    let active = true;
    setPhoto(null);
    if (key) SecureStore.getItemAsync(key).then((name) => {
      if (!active || !name) return;
      const file = new File(Paths.document, "profile-photos", name);
      if (file.exists) setPhoto(file.uri);
    }).catch(() => console.warn("Não foi possível carregar a foto do perfil."));
    return () => { active = false; };
  }, [key]);

  async function choosePhoto() {
    if (!key || disabled || busy.current) return;
    busy.current = true;
    setSaving(true);
    let pending;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const source = new File(result.assets[0].uri);
      const directory = new Directory(Paths.document, "profile-photos");
      directory.create({ idempotent: true, intermediates: true });
      const name = `profile-${userId}-${Date.now()}${source.extension || ".jpg"}`;
      pending = new File(directory, name);
      source.copy(pending);
      await SecureStore.setItemAsync(key, name);
      const previous = photo;
      setPhoto(pending.uri);
      pending = null;
      if (previous) {
        try {
          const old = new File(previous);
          if (old.exists) old.delete();
        } catch { /* A foto nova já está salva. */ }
      }
    } catch {
      try { if (pending?.exists) pending.delete(); } catch { /* Limpeza opcional. */ }
      Alert.alert("Foto de perfil", "Não foi possível salvar a foto. Tente novamente e verifique o acesso às fotos nas configurações do aparelho.");
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  return (
    <TouchableOpacity onPress={choosePhoto} disabled={!key || disabled || saving}
      accessibilityRole="button" accessibilityLabel={photo ? "Alterar foto de perfil" : "Adicionar foto de perfil"}
      style={styles.button}>
      <View style={[styles.circle, { backgroundColor: palette.cardSoft, borderColor: palette.accent }]}>
        {photo ? <Image source={{ uri: photo }} style={styles.image} /> :
          <Text style={[styles.initials, { color: palette.text }]}>{initials}</Text>}
        <View style={[styles.badge, { backgroundColor: palette.accent, borderColor: palette.card }]}>
          {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Feather name="camera" size={16} color="#FFFFFF" />}
        </View>
      </View>
      <Text style={[styles.label, { color: palette.accent }]}>{saving ? "Salvando foto..." : photo ? "Alterar foto" : "Adicionar foto"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", padding: 4 },
  circle: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%", borderRadius: 48 },
  initials: { fontSize: 28, fontWeight: "700" },
  badge: { position: "absolute", right: -2, bottom: -2, width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  label: { marginTop: 12, fontSize: 13, fontWeight: "600" },
});
