import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Defina EXPO_PUBLIC_API_URL no ambiente do Expo para apontar para sua API.
// Exemplo: http://192.168.0.10:3000/api/v1
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.89.240.86:3000/api/v1";

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  timeout: 15000,
});

const PUBLIC_ROUTES = ["/auth/login", "/auth/register"];

http.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  const path = config.url || "";
  if (token && !PUBLIC_ROUTES.some((route) => path.endsWith(route))) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const path = error?.config?.url || "";
    if (error?.response?.status === 401 && !PUBLIC_ROUTES.some((route) => path.endsWith(route))) {
      await Promise.all([
        SecureStore.deleteItemAsync("token"),
        SecureStore.deleteItemAsync("user"),
        SecureStore.deleteItemAsync("nome"),
        SecureStore.deleteItemAsync("email"),
      ]);
    }
    return Promise.reject(error);
  }
);

const apiService = {
  cadastrar: (dados) => http.post("/auth/register", dados),
  login: (dados) => http.post("/auth/login", dados),
  me: () => http.get("/auth/me"),
  listarProdutos: (params = {}) => http.get("/produtos", { params }),
  obterProduto: (id) => http.get(`/produtos/${id}`),
  criarProduto: (dados) => http.post("/produtos", dados),
  atualizarProduto: (id, dados) => http.put(`/produtos/${id}`, dados),
  excluirProduto: (id) => http.delete(`/produtos/${id}`),
  listarAlertasEstoque: (params = {}) => http.get("/produtos/alerta-estoque", { params }),
  listarCategorias: (params = {}) => http.get("/categorias", { params }),
  criarCategoria: (dados) => http.post("/categorias", dados),
  listarFornecedores: (params = {}) => http.get("/fornecedores", { params }),
  criarFornecedor: (dados) => http.post("/fornecedores", dados),
  listarMovimentacoes: (params = {}) => http.get("/movimentacoes", { params }),
  criarMovimentacao: (dados) => http.post("/movimentacoes", dados),
  listarHistorico: (params = {}) => http.get("/historico", { params }),
  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync("token"),
      SecureStore.deleteItemAsync("user"),
      SecureStore.deleteItemAsync("nome"),
      SecureStore.deleteItemAsync("email"),
    ]);
  },
};

export default apiService;
