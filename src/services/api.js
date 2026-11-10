
import axios from "axios";
import * as SecureStore from "expo-secure-store";

// ============================================================
// CONFIGURAÇÃO DA API
// ============================================================

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://10.89.240.51:3000/api/v1/auth";

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ============================================================
// ROTAS PÚBLICAS
// ============================================================

const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/verify-reset-code",
  "/auth/reset-password",
  "/auth/esqueci-senha",
];

const isPublicRoute = (url = "") => {
  const path = url.split("?")[0].replace(/\/+$/, "");

  return PUBLIC_ROUTES.some(
    (route) => path === route || path.endsWith(route)
  );
};

// ============================================================
// LIMPAR SESSÃO
// ============================================================

let onSessaoExpirada;
let sessaoSendoLimpa;

export function setOnSessaoExpirada(handler) {
  onSessaoExpirada = handler;
}

const limparSessao = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync("token"),
    SecureStore.deleteItemAsync("user"),
    SecureStore.deleteItemAsync("nome"),
    SecureStore.deleteItemAsync("email"),
  ]);
};

// ============================================================
// INTERCEPTOR DE REQUISIÇÃO
// ============================================================

http.interceptors.request.use(
  async (config) => {
    config.headers = config.headers || {};

    if (isPublicRoute(config.url)) {
      delete config.headers.Authorization;
    } else {
      const token = await SecureStore.getItemAsync("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// INTERCEPTOR DE RESPOSTA
// ============================================================

http.interceptors.response.use(
  (response) => response,

  async (error) => {
    const config = error?.config;

    if (
      error?.response?.status === 401 &&
      config &&
      !isPublicRoute(config.url)
    ) {
      if (!sessaoSendoLimpa) {
        sessaoSendoLimpa = (async () => {
          try {
            const tokenAtual = await SecureStore.getItemAsync("token");
            const autorizacaoAtual = tokenAtual ? `Bearer ${tokenAtual}` : undefined;
            if (config.headers?.Authorization !== autorizacaoAtual) return;
            await limparSessao();
          } catch (storageError) {
            console.warn("Não foi possível limpar a sessão:", storageError);
          }
          onSessaoExpirada?.();
        })().finally(() => { sessaoSendoLimpa = undefined; });
      }
      await sessaoSendoLimpa;
    }

    return Promise.reject(error);
  }
);

// ============================================================
// SERVIÇOS DA API
// ============================================================

const apiService = {
  // ==========================================================
  // AUTENTICAÇÃO
  // ==========================================================

  cadastrar: (dados) =>
    http.post("/auth/register", dados),

  login: (dados) =>
    http.post("/auth/login", dados),

  me: () =>
    http.get("/auth/me"),

  logout: async () => {
    await limparSessao();
  },

  // ==========================================================
  // RECUPERAÇÃO DE SENHA
  // ==========================================================

  solicitarRecuperacao: (email) =>
    http.post("/auth/forgot-password", {
      email,
    }),

  verificarCodigo: (email, codigo) =>
    http.post("/auth/verify-reset-code", {
      email,
      codigo,
    }),

  redefinirSenha: (email, codigo, novaSenha) =>
    http.post("/auth/reset-password", {
      email,
      codigo,
      novaSenha,
    }),

  // ==========================================================
  // USUÁRIOS
  // ==========================================================

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

  // ==========================================================
  // ASSINATURAS
  // ==========================================================

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

  // ==========================================================
  // CATEGORIAS
  // ==========================================================

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

  // ==========================================================
  // FORNECEDORES
  // ==========================================================

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

  // ==========================================================
  // PRODUTOS
  // ==========================================================

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

    return http.post(
      `/produtos/${id}/foto`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  // ==========================================================
  // MOVIMENTAÇÕES DE ESTOQUE
  // ==========================================================

  listarMovimentacoes: (params = {}) =>
    http.get("/movimentacoes", { params }),

  obterMovimentacao: (id) =>
    http.get(`/movimentacoes/${id}`),

  criarMovimentacao: (dados) =>
    http.post("/movimentacoes", dados),

  // ==========================================================
  // HISTÓRICO
  // ==========================================================

  listarHistorico: (params = {}) =>
    http.get("/historico", { params }),

  obterRegistroHistorico: (id) =>
    http.get(`/historico/${id}`),
};

export default apiService;
