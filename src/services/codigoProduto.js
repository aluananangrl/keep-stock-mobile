// Identificador interno do produto: três letras, hífen, quatro números.
export const CODIGO_PRODUTO_REGEX = /^[A-Z]{3}-\d{4}$/;
export const normalizarCodigoProduto = (valor = "") =>
  String(valor).trim().toUpperCase();
export function gerarCodigoProduto() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = () => Math.floor(Math.random() * 256);
  const randomByte = () => {
    if (globalThis.crypto?.getRandomValues) {
      const array = new Uint8Array(1);
      globalThis.crypto.getRandomValues(array);
      return array[0];
    }
    return numeros();
  };
  const prefixo = Array.from(
    { length: 3 },
    () => letras[randomByte() % letras.length],
  ).join("");
  const sufixo = String((randomByte() * 256 + randomByte()) % 10000).padStart(
    4,
    "0",
  );
  return `${prefixo}-${sufixo}`;
}
// Códigos aleatórios podem repetir: a API deve garantir unicidade ao salvar.
