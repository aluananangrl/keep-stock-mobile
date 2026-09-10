// ============================================================
// IMPORTAÇÕES
// ============================================================

// useEffect -> executa uma função automaticamente em determinados momentos
// useState  -> cria estados dentro do componente
import { useEffect, useState } from "react";

// Arquivo responsável pelas requisições para o backend
import api from "../services/api";


// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function HomeScreen() {


  // ==========================================================
  // ESTADO DO USUÁRIO
  // ==========================================================

  // Guarda os dados do usuário que está logado.
  //
  // Inicialmente recebe null porque ainda não buscamos
  // os dados no backend.
  const [usuario, setUsuario] = useState(null);


  // ==========================================================
  // USEEFFECT
  // ==========================================================

  // O useEffect é executado quando a tela é carregada.
  //
  // O [] significa que ele será executado apenas uma vez
  // quando o componente for montado.
  useEffect(() => {

    // Chama a função responsável por buscar
    // os dados do usuário.
    carregarUsuario();

  }, []);


  // ==========================================================
  // FUNÇÃO PARA CARREGAR O USUÁRIO
  // ==========================================================

  async function carregarUsuario() {

    try {

      // ======================================================
      // BUSCA O USUÁRIO NO BACKEND
      // ======================================================

      // Faz uma requisição para a rota "me" da API.
      //
      // Essa rota normalmente identifica o usuário através
      // do token JWT que foi salvo durante o login.
      const response = await api.me();


      // Mostra no console os dados retornados pelo servidor.
      console.log(
        "USUÁRIO LOGADO:",
        response.data
      );


      // ======================================================
      // SALVA OS DADOS NO ESTADO
      // ======================================================

      // Guarda os dados recebidos dentro do estado usuario.
      //
      // Depois disso, a interface pode utilizar:
      // usuario.nome
      // usuario.email
      // usuario.perfil
      // etc.
      setUsuario(response.data);


    } catch (error) {

      // ======================================================
      // TRATAMENTO DE ERRO
      // ======================================================

      // Caso aconteça algum erro na requisição,
      // mostra o erro no console.
      console.log(
        "ERRO AO BUSCAR USUÁRIO:",
        error?.response?.data ||
          error?.message
      );

    }
  }


  // ==========================================================
  // INTERFACE
  // ==========================================================

  // O restante da interface da Home ficaria aqui.
  // Por exemplo:
  //
  // return (
  //   <View>
  //     <Text>Olá, {usuario?.nome}</Text>
  //   </View>
  // );
}

