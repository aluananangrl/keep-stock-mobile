import api from "./api";
import { extractList, getProductCode } from "./responseUtils";

// src/services/produtosService.js

// Catálogo local com produtos do KeepStock e códigos de barras conhecidos
export const catalogoProdutos = [
  {
    codigo: "7891234560010",
    codigoAlternativo: "COD-544",
    nome: "Água Mineral 500ml",
    categoria: "Bebidas",
    estoque: 58,
    valor: "R$ 3,50",
    local: "Setor A - Corredor 1",
    imagem:
      "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80",
    descricao: "Água mineral natural sem gás, garrafa 500ml.",
  },
  {
    codigo: "COD-544",
    codigoAlternativo: "7891234560010",
    nome: "Água Mineral 500ml",
    categoria: "Bebidas",
    estoque: 38,
    valor: "R$ 3,50",
    local: "Setor A - Corredor 1",
    imagem:
      "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80",
    descricao: "Água mineral natural sem gás, garrafa 500ml.",
  },
  {
    codigo: "7891000219001",
    codigoAlternativo: "COD-219",
    nome: "Salgadinho Batata 100g",
    categoria: "Alimentos",
    estoque: 15,
    valor: "R$ 6,90",
    local: "Setor B - Corredor 2",
    imagem:
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80",
    descricao: "Batata frita ondulada salgada crocante pacote 100g.",
  },
  {
    codigo: "COD-219",
    codigoAlternativo: "7891000219001",
    nome: "Salgadinho Batata 100g",
    categoria: "Alimentos",
    estoque: 15,
    valor: "R$ 6,90",
    local: "Setor B - Corredor 2",
    imagem:
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80",
    descricao: "Batata frita ondulada salgada crocante pacote 100g.",
  },
  {
    codigo: "7894900010015",
    codigoAlternativo: "COD-801",
    nome: "Refrigerante Coca-Cola 350ml",
    categoria: "Bebidas",
    estoque: 120,
    valor: "R$ 5,00",
    local: "Setor A - Corredor 3",
    imagem:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80",
    descricao: "Refrigerante de cola em lata 350ml.",
  },
  {
    codigo: "COD-801",
    codigoAlternativo: "7894900010015",
    nome: "Refrigerante Coca-Cola 350ml",
    categoria: "Bebidas",
    estoque: 120,
    valor: "R$ 5,00",
    local: "Setor A - Corredor 3",
    imagem:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80",
    descricao: "Refrigerante de cola em lata 350ml.",
  },
  {
    codigo: "7896005800018",
    codigoAlternativo: "COD-320",
    nome: "Café Torrado e Moído 250g",
    categoria: "Alimentos",
    estoque: 60,
    valor: "R$ 14,90",
    local: "Setor C - Corredor 1",
    imagem:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80",
    descricao: "Café tradicional torrado e moído a vácuo 250g.",
  },
  {
    codigo: "COD-320",
    codigoAlternativo: "7896005800018",
    nome: "Café Torrado e Moído 250g",
    categoria: "Alimentos",
    estoque: 60,
    valor: "R$ 14,90",
    local: "Setor C - Corredor 1",
    imagem:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80",
    descricao: "Café tradicional torrado e moído a vácuo 250g.",
  },
  {
    codigo: "7891000100103",
    codigoAlternativo: "COD-103",
    nome: "Leite Condensado 395g",
    categoria: "Laticínios",
    estoque: 45,
    valor: "R$ 7,50",
    local: "Setor B - Corredor 1",
    imagem:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
    descricao: "Leite condensado semidesnatado lata/caixinha 395g.",
  },
  {
    codigo: "7622300990731",
    codigoAlternativo: "COD-073",
    nome: "Biscoito Recheado 140g",
    categoria: "Alimentos",
    estoque: 80,
    valor: "R$ 4,20",
    local: "Setor B - Corredor 3",
    imagem:
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80",
    descricao: "Biscoito de chocolate com recheio de baunilha.",
  },
  {
    codigo: "7891150027374",
    codigoAlternativo: "COD-737",
    nome: "Sabonete Hidratante 90g",
    categoria: "Higiene",
    estoque: 95,
    valor: "R$ 3,90",
    local: "Setor D - Corredor 2",
    imagem:
      "https://images.unsplash.com/photo-1607006314640-e177b61f93bf?auto=format&fit=crop&w=400&q=80",
    descricao: "Sabonete em barra com fórmula hidratante.",
  },
  {
    codigo: "WHS-01",
    codigoAlternativo: "COD-001",
    nome: "Caixa Organizadora Industrial",
    categoria: "Armazenamento",
    estoque: 22,
    valor: "R$ 45,00",
    local: "Almoxarifado Geral",
    imagem:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80",
    descricao: "Caixa organizadora plástica reforçada 50L.",
  },
];

/**
 * Tenta fazer o parse de dados codificados em QR Code (JSON ou formato texto estruturado)
 */
function tentarParseQrCode(texto) {
  if (!texto || typeof texto !== "string") return null;

  const raw = texto.trim();

  // 1. Tenta JSON
  if (raw.startsWith("{") && raw.endsWith("}")) {
    try {
      const obj = JSON.parse(raw);
      return {
        id: obj.id || obj._id || obj.produto_id,
        nome: obj.nome || obj.name || obj.title || `Produto (${obj.codigo || "QR"})`,
        codigo: String(obj.codigo || obj.code || obj.sku || "QR-01"),
        categoria: obj.categoria || obj.category || "Geral",
        estoque: Number(obj.estoque || obj.stock || obj.quantidade || 10),
        valor: obj.valor || obj.preco || obj.price || "R$ 0,00",
        local: obj.local || obj.setor || "Estoque Principal",
        imagem:
          obj.imagem ||
          obj.image ||
          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80",
        descricao: obj.descricao || obj.description || "Produto escaneado via QR Code.",
      };
    } catch (e) {
      // Ignora erro de JSON
    }
  }

  // 2. Tenta formato chave=valor ou chave: valor (ex: nome=Teclado; codigo=123)
  if (raw.includes(";") || raw.includes("|") || raw.includes("\n")) {
    const separador = raw.includes(";") ? ";" : raw.includes("|") ? "|" : "\n";
    const partes = raw.split(separador);
    const dados = {};

    for (const parte of partes) {
      const [chave, ...resto] = parte.split(/[:=]/);
      if (chave && resto.length > 0) {
        dados[chave.trim().toLowerCase()] = resto.join(":").trim();
      }
    }

    if (dados.nome || dados.codigo) {
      return {
        id: dados.id || dados._id || dados.produto_id,
        nome: dados.nome || `Produto (${dados.codigo || "QR"})`,
        codigo: dados.codigo || dados.sku || "QR-01",
        categoria: dados.categoria || "Geral",
        estoque: Number(dados.estoque || dados.qtd || 10),
        valor: dados.valor || dados.preco || "R$ 0,00",
        local: dados.local || dados.setor || "Estoque Principal",
        imagem:
          dados.imagem ||
          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80",
        descricao: "Produto escaneado via QR Code.",
      };
    }
  }

  return null;
}

/**
 * Consulta a API aberta Open Food Facts para produtos de código de barras reais (EAN/UPC)
 */
async function buscarNaApiPublica(codigo) {
  // Só pesquisa na API se for numérico e tiver entre 8 e 14 dígitos (EAN-8, EAN-13, UPC)
  const limpo = codigo.replace(/\D/g, "");
  if (limpo.length < 8 || limpo.length > 14) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5 segundos de timeout

    const url = `https://world.openfoodfacts.org/api/v2/product/${limpo}.json`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data?.status === 1 && data?.product) {
        const prod = data.product;
        const nome =
          prod.product_name_pt ||
          prod.product_name ||
          prod.generic_name_pt ||
          prod.generic_name ||
          prod.brands ||
          `Produto EAN ${limpo}`;

        const foto =
          prod.image_front_url ||
          prod.image_url ||
          prod.image_small_url ||
          "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=400&q=80";

        const categoria =
          prod.categories_tags?.[0]?.replace(/^..:/, "").replace(/-/g, " ") ||
          "Mercadorias";

        return {
          codigo: limpo,
          nome: nome.charAt(0).toUpperCase() + nome.slice(1),
          categoria: categoria.charAt(0).toUpperCase() + categoria.slice(1),
          estoque: 25, // Estoque inicial estimado
          valor: "R$ 9,90",
          local: "Setor A - Estoque",
          imagem: foto,
          descricao: prod.generic_name || `Marca: ${prod.brands || "Original"}`,
          origem: "API",
        };
      }
    }
  } catch (error) {
    // Timeout ou sem internet
    console.log("Busca online não disponível para código:", codigo);
  }

  return null;
}

/**
 * Busca o produto por código de barras ou payload de QR Code
 */
export async function buscarProdutoPorCodigo(codigoOuPayload) {
  if (!codigoOuPayload) return null;
  const texto = String(codigoOuPayload).trim();
  if (!texto) return null;

  // QR Codes estruturados só são válidos para estoque se apontarem para um ID real da API.
  const dadosQr = tentarParseQrCode(texto);
  const idQr = dadosQr?.id || dadosQr?._id || dadosQr?.produto_id;
  if (idQr) {
    try {
      const response = await api.obterProduto(idQr);
      return response?.data?.produto || response?.data?.data || response?.data || null;
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }

  const codigoBusca = texto.toLocaleUpperCase("pt-BR");
  let totalPaginas = 1;
  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
    const response = await api.listarProdutos({ search: texto, page: pagina, limit: 100 });
    const encontrado = extractList(response).find((produto) =>
      String(getProductCode(produto)).trim().toLocaleUpperCase("pt-BR") === codigoBusca ||
      String(produto.codigo_barras || produto.codigoBarras || "").trim() === texto
    );
    if (encontrado) return encontrado;
    totalPaginas = response.data?.pagination?.totalPages ?? 1;
  }
  return null;
}
