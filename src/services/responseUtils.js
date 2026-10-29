/** Normaliza respostas comuns de APIs Express sem presumir um único envelope. */
export function extractList(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data?.rows)) return data.data.rows;
  if (Array.isArray(data?.data?.results)) return data.data.results;
  if (Array.isArray(data?.data?.produtos)) return data.data.produtos;
  if (Array.isArray(data?.data?.movimentacoes)) return data.data.movimentacoes;
  if (Array.isArray(data?.data?.fornecedores)) return data.data.fornecedores;
  if (Array.isArray(data?.data?.historico)) return data.data.historico;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.produtos)) return data.produtos;
  if (Array.isArray(data?.movimentacoes)) return data.movimentacoes;
  if (Array.isArray(data?.fornecedores)) return data.fornecedores;
  if (Array.isArray(data?.historico)) return data.historico;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
}

export function getProductName(product) {
  return product?.nome ?? product?.name ?? product?.descricao ?? "Produto sem nome";
}

export function getProductCode(product) {
  return product?.sku ?? product?.codigo ?? product?.codigo_barras ?? product?.id ?? "—";
}

export function getStock(product) {
  const value = product?.quantidade_atual ?? product?.quantidade ?? product?.estoque ?? product?.stock ?? 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function getMinimumStock(product) {
  const value = product?.quantidade_minima ?? product?.estoque_minimo ?? product?.minimo ?? 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}


export function getErrorMessage(error, fallback = "Ocorreu um erro inesperado.") {
  const data = error?.response?.data;

  // Mensagens retornadas pela API
  const mensagem =
    data?.message ??
    data?.mensagem ??
    data?.error ??
    data?.erro ??
    error?.message;

  if (typeof mensagem === "string" && mensagem.trim()) {
    return mensagem;
  }

  // Alguns backends retornam os detalhes como objeto ou lista
  if (mensagem && typeof mensagem === "object") {
    if (Array.isArray(mensagem)) {
      return mensagem
        .map((item) =>
          typeof item === "string"
            ? item
            : item?.message ?? item?.mensagem ?? JSON.stringify(item)
        )
        .join("\n");
    }

    return (
      mensagem.message ??
      mensagem.mensagem ??
      JSON.stringify(mensagem)
    );
  }

  if (data && typeof data === "object") {
    return JSON.stringify(data);
  }

  if (error?.code === "ECONNABORTED") {
    return "A conexão com a API demorou demais. Tente novamente.";
  }

  if (!error?.response) {
    return "Não foi possível conectar à API. Confira o endereço do servidor e a conexão.";
  }

  return fallback;
}

