import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

export function usePermissoesEstoque() {
  const [perfil, setPerfil] = useState(null);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    SecureStore.getItemAsync("user")
      .then((usuario) => {
        if (ativo) setPerfil(JSON.parse(usuario ?? "null")?.perfil?.toUpperCase());
      })
      .catch(() => {
        if (ativo) setPerfil(null);
      });
    return () => { ativo = false; };
  }, []));

  return {
    podeEditar: perfil === "ADMIN" || perfil === "GERENTE",
    podeExcluir: perfil === "ADMIN",
  };
}
