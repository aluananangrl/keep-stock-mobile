
import axios from "axios";
import * as SecureStore from "expo-secure-store";

// ============================================================
// CONFIGURAÇÃO DA API
// ============================================================

const API_URL_PADRAO =
  "https://kstock-api-1.onrender.com/api/v1";

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || API_URL_PADRAO
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/auth$/, "");

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

console.log("API CONFIGURADA:", API_BASE_URL);

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
  const path = String(url)
    .split("?")[0]
    .replace(/\/+$/, "");

  return PUBLIC_ROUTES.some(
    (route) =>
      path === route ||
      path.endsWith(route)
  );
};

// ============================================================
// GERENCIAMENTO DE SESSÃO
// ============================================================

let onSessaoExpirada = null;
let sessaoSendoLimpa = null;

export function setOnSessaoExpirada(handler) {
  onSessaoExpirada =
    typeof handler === "function" ? handler : null;
}

const limparSessao = async () => {
  const chaves = [
    "token",
    "user",
    "nome",
    "email",
  ];

  const resultados = await Promise.allSettled(
    chaves.map((chave) =>
      SecureStore.deleteItemAsync(chave)
    )
  );

  resultados.forEach((resultado, index) => {
    if (resultado.status === "rejected") {
      console.warn(
        `Erro ao limpar ${chaves[index]}:`,
        resultado.reason
      );
    }
  });
};

// ============================================================
// INTERCEPTOR DE REQUISIÇÃO
// ============================================================

http.interceptors.request.use(
  async (config) => {
    config.headers = config.headers || {};

    const urlCompleta = http.getUri(config);

    console.log("================================");
    console.log("REQUISIÇÃO API");
    console.log(
      "Método:",
      config.method?.toUpperCase()
    );
    console.log("URL:", urlCompleta);
    console.log("================================");

    // Rotas públicas não precisam de token.
    if (isPublicRoute(config.url)) {
      delete config.headers.Authorization;

      return config;
    }

    try {
      const token =
        await SecureStore.getItemAsync("token");

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
    } catch (error) {
      console.warn(
        "Erro ao buscar token:",
        error.message
      );

      delete config.headers.Authorization;
    }

    return config;
  },

  (error) => Promise.reject(error)
);

// ============================================================
// INTERCEPTOR DE RESPOSTA
// ============================================================

http.interceptors.response.use(
  (response) => {
    console.log(
      "API SUCESSO:",
      response.status,
      http.getUri(response.config)
    );

    return response;
  },

  async (error) => {
    const config = error?.config;
    const response = error?.response;
    const status = response?.status;

    const url = config
      ? http.getUri(config)
      : "URL desconhecida";

    const mensagem =
      response?.data?.message ||
      response?.data?.mensagem ||
      error?.message ||
      "Erro desconhecido";

    console.warn("================================");
    console.warn("ERRO NA API");
    console.warn("URL:", url);
    console.warn("Status:", status || "Sem resposta");
    console.warn("Mensagem:", mensagem);
    console.warn("Código:", error?.code);
    console.warn("Dados:", response?.data);
    console.warn("================================");

    // --------------------------------------------------------
    // ERRO DE REDE
    // --------------------------------------------------------

    if (!response) {
      if (error?.code === "ECONNABORTED") {
        console.warn(
          "A API demorou demais para responder."
        );
      } else {
        console.warn(
          "Não foi possível receber uma resposta da API."
        );

        console.warn(
          "Verifique a internet, o servidor Render, " +
          "a configuração HTTPS e a URL utilizada."
        );
      }
    }

    // --------------------------------------------------------
    // SESSÃO EXPIRADA
    // --------------------------------------------------------

    if (
      status === 401 &&
      config &&
      !isPublicRoute(config.url)
    ) {
      if (!sessaoSendoLimpa) {
        sessaoSendoLimpa = (async () => {
          try {
            const tokenAtual =
              await SecureStore.getItemAsync("token");

            const autorizacaoAtual = tokenAtual
              ? `Bearer ${tokenAtual}`
              : undefined;

            const tokenDaRequisicao =
              config.headers?.Authorization;

            // Evita encerrar uma sessão nova por causa
            // de uma requisição antiga.
            if (
              !tokenAtual ||
              !tokenDaRequisicao ||
              tokenDaRequisicao !== autorizacaoAtual
            ) {
              return;
            }

            await limparSessao();

            if (onSessaoExpirada) {
              onSessaoExpirada();
            }
          } catch (storageError) {
            console.warn(
              "Erro ao encerrar sessão:",
              storageError
            );
          }
        })().finally(() => {
          sessaoSendoLimpa = null;
        });
      }

      await sessaoSendoLimpa;
    }

    // --------------------------------------------------------
    // MANTER ERRO ORIGINAL PARA A TELA
    // --------------------------------------------------------

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

  solicitarRecuperacao: async (email) => {
    const emailFormatado = String(email || "")
      .trim()
      .toLowerCase();

    if (!emailFormatado) {
      throw new Error("Informe um e-mail válido.");
    }

    console.log(
      "Solicitando recuperação de senha..."
    );

    const response = await http.post(
      "/auth/forgot-password",
      {
        email: emailFormatado,
      }
    );

    return response.data;
  },

  verificarCodigo: async (email, codigo) => {
    const response = await http.post(
      "/auth/verify-reset-code",
      {
        email: String(email).trim().toLowerCase(),
        codigo: String(codigo).trim(),
      }
    );

    return response.data;
  },

  redefinirSenha: async (
    email,
    codigo,
    novaSenha
  ) => {
    const response = await http.post(
      "/auth/reset-password",
      {
        email: String(email).trim().toLowerCase(),
        codigo: String(codigo).trim(),
        novaSenha,
      }
    );

    return response.data;
  },

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
    http.patch(
      `/usuarios/${id}/perfil`,
      dados
    ),

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
    http.patch(
      `/assinaturas/${id}/status`,
      dados
    ),

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
    http.get(
      "/produtos/alerta-estoque",
      { params }
    ),

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
          "Content-Type": undefined,
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

// ============================================================
// EXPORTAÇÃO
// ============================================================

export default apiService;
