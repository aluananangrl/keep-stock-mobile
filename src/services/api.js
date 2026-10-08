import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: "http://10.89.240.62:3000/api/v1/auth",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ==========================================
// INTERCEPTOR DE REQUISIÇÃO
// ==========================================
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("token");

      console.log("================================");
      console.log("REQUISIÇÃO PARA:", `${config.baseURL}${config.url}`);
      console.log("MÉTODO:", config.method?.toUpperCase());
      console.log("BODY:", config.data);
      console.log("TOKEN:", token ? "EXISTE" : "NÃO EXISTE");

      // Login e cadastro são rotas públicas.
      // Não precisam enviar Authorization.
      const rotasPublicas = ["/login", "/register"];

      const rotaPublica = rotasPublicas.includes(config.url);

      if (token && !rotaPublica) {
        config.headers.Authorization = `Bearer ${token}`;

        console.log("Authorization: Bearer TOKEN ENVIADO");
      } else {
        console.log("Authorization: NÃO ENVIADO");
      }

      console.log("================================");

      return config;
    } catch (error) {
      console.log("ERRO AO PEGAR TOKEN:", error);
      return config;
    }
  },
  (error) => {
    console.log("ERRO NO INTERCEPTOR:", error);
    return Promise.reject(error);
  }
);

// ==========================================
// INTERCEPTOR DE RESPOSTA
// ==========================================
api.interceptors.response.use(
  (response) => {
    console.log("================================");
    console.log("RESPOSTA DA API");
    console.log("STATUS:", response.status);
    console.log("URL:", response.config?.url);
    console.log("DATA:", response.data);
    console.log("================================");

    return response;
  },

  async (error) => {
    console.log("================================");
    console.log("ERRO NA API");
    console.log("URL:", error?.config?.url);
    console.log("STATUS:", error?.response?.status);
    console.log("DATA:", error?.response?.data);
    console.log("MESSAGE:", error?.message);
    console.log("================================");

    // Se o token expirou ou ficou inválido
    if (
      error?.response?.status === 401 &&
      error?.config?.url !== "/login" &&
      error?.config?.url !== "/register"
    ) {
      console.log("TOKEN INVÁLIDO OU EXPIRADO");

      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user");
      await SecureStore.deleteItemAsync("nome");
      await SecureStore.deleteItemAsync("email");
    }

    return Promise.reject(error);
  }
);

// ==========================================
// SERVIÇOS DA API
// ==========================================
const apiService = {

  // ----------------------------------------
  // CADASTRO
  // POST /api/v1/auth/register
  // ----------------------------------------
  cadastrar: async (dados) => {
    console.log("================================");
    console.log("CADASTRANDO USUÁRIO");
    console.log("DADOS:", dados);
    console.log("================================");

    return api.post("/register", dados);
  },

  // ----------------------------------------
  // LOGIN
  // POST /api/v1/auth/login
  // ----------------------------------------
  login: async (dados) => {
    console.log("================================");
    console.log("FAZENDO LOGIN");
    console.log("EMAIL:", dados.email);
    console.log("================================");

    return api.post("/login", dados);
  },

  // ----------------------------------------
  // USUÁRIO LOGADO
  // GET /api/v1/auth/me
  // ----------------------------------------
  me: async () => {
    console.log("================================");
    console.log("BUSCANDO USUÁRIO LOGADO");
    console.log("================================");

    return api.get("/me");
  },

  // ----------------------------------------
  // LOGOUT
  // ----------------------------------------
  logout: async () => {
    try {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user");
      await SecureStore.deleteItemAsync("nome");
      await SecureStore.deleteItemAsync("email");

      console.log("LOGOUT REALIZADO");
    } catch (error) {
      console.log("ERRO NO LOGOUT:", error);
    }
  },
};

export default apiService;