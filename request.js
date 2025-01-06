const puppeteer = require('puppeteer');
const axios = require('axios'); // Apenas uma importação de axios

// Navegar usando Puppeteer
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navega até a página protegida pelo Cloudflare
  await page.goto('https://hml-api-multi.siteteste.inf.br/service-gateway/api/merchant');

  // Extraia cookies ou tokens se necessário
  const cookies = await page.cookies();
  console.log(cookies);

  await browser.close();
})();

// Função para gerar um CNPJ válido
function gerarCNPJ() {
  function gerarDigito(base) {
    let fator = base.length === 12 ? 5 : 6;
    let total = 0;

    for (let i = 0; i < base.length; i++) {
      total += parseInt(base[i]) * fator--;
      if (fator < 2) fator = 9;
    }

    const resto = total % 11;
    return resto < 2 ? 0 : 11 - resto;
  }

  const base = Array.from({ length: 8 }, () => Math.floor(Math.random() * 9)).join('') + "0001";
  const digito1 = gerarDigito(base);
  const digito2 = gerarDigito(base + digito1);

  return base + digito1 + digito2;
}

// Função para gerar um nome aleatório
function gerarNome() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nome = Array.from({ length: 5 }, () => letras.charAt(Math.floor(Math.random() * letras.length))).join('');
  const sobrenome = Array.from({ length: 7 }, () => letras.charAt(Math.floor(Math.random() * letras.length))).join('');
  return `${nome} ${sobrenome}`;
}

// Fazer a requisição para a API
async function fazerRequisicao() {
  const cnpj = gerarCNPJ();
  const nome = gerarNome();

  const url = "https://hml-api-multi.siteteste.inf.br/service-gateway/api/merchant";
  const token = process.env.API_TOKEN; // Use uma variável de ambiente para o token

  const payload = {
    name: nome,
    globalUniqueIdentifier: cnpj,
    pat: false,
    embossingName: "AAA BBB CCCC SSSS",
    addresses: [
      {
        street: "Avenida B",
        portNumber: "1234",
        location: "Brasil",
        complement: "",
        zipCode: "75690971",
        city: "Caldas Novas",
        state: "GO",
        country: "Brazil",
        type: "MAIN"
      }
    ]
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Requisição bem-sucedida:", response.data);
  } catch (error) {
    console.error("Erro ao fazer a requisição:", error.response?.data || error.message);
    process.exit(1); // Finaliza o processo com erro para sinalizar falha no pipeline
  }
}

// Executar a função
fazerRequisicao();
