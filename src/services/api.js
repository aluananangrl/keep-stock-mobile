
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://10.89.240.67:3000/api/v1";

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

const PUBLIC_ROUTES = ["/auth/login", "/auth/register"];

const isPublicRoute = (url = "") => {
  const path = url.split("?")[0].replace(/\/+$/, "");
  return PUBLIC_ROUTES.some((route) => path.endsWith(route));
};

const limparSessao = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync("token"),
    SecureStore.deleteItemAsync("user"),
    SecureStore.deleteItemAsync("nome"),
    SecureStore.deleteItemAsync("email"),
  ]);
};

// Adiciona o token JWT às requisições protegidas.
http.interceptors.request.use(
  async (config) => {
    if (!isPublicRoute(config.url)) {
      const token = await SecureStore.getItemAsync("token");

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Limpa a sessão quando a API retorna 401 em uma rota protegida.
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;

    if (
      error?.response?.status === 401 &&
      config &&
      !isPublicRoute(config.url)
    ) {
      try {
        await limparSessao();
      } catch (storageError) {
        console.warn("Não foi possível limpar a sessão:", storageError);
      }
    }

    return Promise.reject(error);
  }
);

const apiService = {
  // AUTENTICAÇÃO
  cadastrar: (dados) => http.post("/auth/register", dados),

  login: (dados) => http.post("/auth/login", dados),

  me: () => http.get("/auth/me"),

  logout: async () => {
    await limparSessao();
  },

  // USUÁRIOS
  listarUsuarios: (params = {}) =>
    http.get("/usuarios", { params }),

  obterUsuario: (id) =>
    http.get(`/usuarios/${id}`),

  criarUsuario: (dados) =>
    http.post("/usuarios", dados),

  atualizarUsuario: (id, dados) =>
    http.put(`/usuarios/${id}`, dados),

  atualizarPerfilUsuario: (id, dados) =>
    http.patch(`/usuarios/${id}/perfil`, dados),

  excluirUsuario: (id) =>
    http.delete(`/usuarios/${id}`),

  // ASSINATURAS
  minhaAssinatura: () =>
    http.get("/assinaturas/minha"),

  listarAssinaturas: (params = {}) =>
    http.get("/assinaturas", { params }),

  obterAssinatura: (id) =>
    http.get(`/assinaturas/${id}`),

  criarAssinatura: (dados) =>
    http.post("/assinaturas", dados),

  atualizarStatusAssinatura: (id, dados) =>
    http.patch(`/assinaturas/${id}/status`, dados),

  // CATEGORIAS
  listarCategorias: (params = {}) =>
    http.get("/categorias", { params }),

  obterCategoria: (id) =>
    http.get(`/categorias/${id}`),

  criarCategoria: (dados) =>
    http.post("/categorias", dados),

  atualizarCategoria: (id, dados) =>
    http.put(`/categorias/${id}`, dados),

  excluirCategoria: (id) =>
    http.delete(`/categorias/${id}`),

  // FORNECEDORES
  listarFornecedores: (params = {}) =>
    http.get("/fornecedores", { params }),

  obterFornecedor: (id) =>
    http.get(`/fornecedores/${id}`),

  criarFornecedor: (dados) =>
    http.post("/fornecedores", dados),

  atualizarFornecedor: (id, dados) =>
    http.put(`/fornecedores/${id}`, dados),

  excluirFornecedor: (id) =>
    http.delete(`/fornecedores/${id}`),

  // PRODUTOS
  listarProdutos: (params = {}) =>
    http.get("/produtos", { params }),

  obterProduto: (id) =>
    http.get(`/produtos/${id}`),

  criarProduto: (dados) =>
    http.post("/produtos", dados),

  atualizarProduto: (id, dados) =>
    http.put(`/produtos/${id}`, dados),

  excluirProduto: (id) =>
    http.delete(`/produtos/${id}`),

  listarAlertasEstoque: (params = {}) =>
    http.get("/produtos/alerta-estoque", { params }),

  enviarFotoProduto: (id, arquivo) => {
    const formData = new FormData();

    formData.append("foto", {
      uri: arquivo.uri,
      name: arquivo.name || "foto.jpg",
      type: arquivo.type || "image/jpeg",
    });

    return http.post(`/produtos/${id}/foto`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // MOVIMENTAÇÕES DE ESTOQUE
  listarMovimentacoes: (params = {}) =>
    http.get("/movimentacoes", { params }),

  obterMovimentacao: (id) =>
    http.get(`/movimentacoes/${id}`),

  criarMovimentacao: (dados) =>
    http.post("/movimentacoes", dados),

  // HISTÓRICO
  listarHistorico: (params = {}) =>
    http.get("/historico", { params }),

  obterRegistroHistorico: (id) =>
    http.get(`/historico/${id}`),
};

export default apiService;
