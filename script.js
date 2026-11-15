/* ==========================================================================
   CYCLOSPOT DOCS - MOTOR DE BUSCA INTELIGENTE DE DÚVIDAS E INTERATIVIDADE UX
   ========================================================================== */

// Base de conhecimento para identificar a dúvida do usuário e responder na hora
const knowledgeBase = [
  {
    keywords: ["qual codigo", "cada placa", "o que vai no esp", "o que vai no arduino", "juntos", "duas placas", "logica", "funciona"],
    title: "O que vai no Arduino e o que vai no ESP8266?",
    answer: "No <strong>Arduino</strong> fica o seu código atual dos sensores, LEDs e LCD, com 4 linhas extras que enviam <code>ocupadas,livres</code> pelo pino <strong>A1</strong>. No <strong>ESP8266</strong> vai o código do Wi-Fi que o professor mandou, que recebe esses dados pelo pino <strong>RX</strong> e cria o site.",
    target: "#secao-1"
  },
  {
    keywords: ["solda", "soldar", "fio", "fios", "pino", "pinos", "ligar", "conexao", "conectar", "protoboard", "esquema"],
    title: "Quais fios eu preciso soldar entre o Arduino e o ESP8266?",
    answer: "Você não precisa soldar todos os pinos! Basta ligar: <strong>1) Pino A1 do Arduino → Pino RX do ESP8266</strong> (dados); <strong>2) GND do Arduino → GND do ESP8266</strong> (terra comum obrigatório); e <strong>3) Alimentação 3.3V</strong> no VCC/CH_PD do ESP8266 (ou 5V no VIN se for NodeMCU).",
    target: "#secao-4"
  },
  {
    keywords: ["5v", "3.3v", "3,3v", "resistor", "divisor", "tensao", "queimar", "1k", "2k", "boylestad"],
    title: "Por que usar resistores de 1kΩ e 2kΩ entre o A1 e o RX?",
    answer: "O Arduino manda sinal em <strong>5V</strong>, mas o pino RX do ESP8266 trabalha em <strong>3,3V</strong>. Colocando um resistor de <strong>1 kΩ</strong> entre A1 e RX e um de <strong>2 kΩ</strong> entre RX e GND (Divisor de Tensão de Boylestad), a tensão cai para exatos <strong>3,33V</strong>, protegendo o ESP8266.",
    target: "#secao-4"
  },
  {
    keywords: ["ip", "descobrir", "navegador", "abrir site", "celular", "wifi", "monitor serial", "conectar", "endereco"],
    title: "Como descobrir o endereço IP do ESP8266 para abrir o site?",
    answer: "Depois de gravar o código no ESP8266, abra o <strong>Monitor Serial</strong> da Arduino IDE na velocidade <strong>9600 baud</strong>. Quando ele conectar no Wi-Fi, escreverá: <code>Acesse no navegador: http://192.168.x.x</code>. Digite esse IP no navegador do celular ou computador!",
    target: "#secao-3"
  },
  {
    keywords: ["erro", "gravar", "upload", "ordem", "antes de soldar", "rx", "falha"],
    title: "Cuidado: Grave o código no ESP8266 ANTES de soldar o fio no pino RX!",
    answer: "O pino <strong>RX</strong> do ESP8266 também é usado para receber o código pelo computador. Se o pino A1 do Arduino já estiver soldado no RX mandando dados, a gravação dará erro. Sempre grave o ESP8266 primeiro e solde o fio do pino RX por último!",
    target: "#secao-4"
  },
  {
    keywords: ["a0", "a1", "softwareserial", "espserial", "adicionar", "mudar", "codigo arduino", "portc"],
    title: "Por que usamos os pinos A0 e A1 com SoftwareSerial no Arduino?",
    answer: "Como os pinos digitais 2 a 13 já estão ocupados pelos 3 sensores e 6 LEDs, usamos a biblioteca <code>SoftwareSerial espSerial(A0, A1)</code>. Os pinos A0 e A1 funcionam normalmente como portas digitais no Arduino Uno (ALBUQUERQUE; ALEXANDRIA, 2015, p. 62).",
    target: "#secao-2"
  },
  {
    keywords: ["abnt", "referencia", "referencias", "livro", "livros", "academico", "autor", "citar", "sebesta", "tanenbaum", "albuquerque", "pinheiro", "hewitt"],
    title: "Onde estão as Referências Acadêmicas (Padrão ABNT) de cada passo?",
    answer: "Cada seção possui uma caixa azul <strong>'🎓 Fundamentação Acadêmica'</strong> com os autores, páginas e cálculos. Além disso, no <strong>Passo 5</strong> está a lista completa formatada na norma <strong>ABNT NBR 6023</strong> pronta para o seu trabalho.",
    target: "#secao-5"
  }
];

// Normaliza texto removendo acentos e deixando em minúsculas
function normalizeText(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Função acionada pelos botões de pílula rápida
function quickSearch(queryText) {
  const input = document.getElementById("searchInput");
  input.value = queryText;
  handleSearch(queryText);
}

// Limpa a busca e restaura todas as seções
function clearSearch() {
  const input = document.getElementById("searchInput");
  input.value = "";
  handleSearch("");
  input.focus();
}

// Motor principal de busca
function handleSearch(rawQuery) {
  const query = normalizeText(rawQuery);
  const btnClear = document.getElementById("btnClearSearch");
  const instantContainer = document.getElementById("instantAnswerContainer");
  const sections = document.querySelectorAll(".doc-section");

  btnClear.style.display = query.length > 0 ? "flex" : "none";

  if (!query) {
    instantContainer.style.display = "none";
    sections.forEach(sec => {
      sec.style.display = "block";
    });
    return;
  }

  // 1. Verifica na base de conhecimento qual dúvida mais combina
  const words = query.split(/\s+/).filter(w => w.length >= 2);
  let bestMatch = null;
  let bestScore = 0;

  knowledgeBase.forEach(item => {
    let score = 0;
    item.keywords.forEach(kw => {
      const normKw = normalizeText(kw);
      if (query.includes(normKw)) score += 3;
      words.forEach(w => {
        if (normKw.includes(w)) score += 1;
      });
    });
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  });

  // 2. Filtra as seções do documento que contêm os termos buscados
  let visibleCount = 0;
  sections.forEach(sec => {
    const contentText = normalizeText(sec.innerText + " " + (sec.dataset.keywords || ""));
    const matchesAllWords = words.every(w => contentText.includes(w));
    const matchesAnyWord = words.some(w => contentText.includes(w));

    if (matchesAllWords || (bestMatch && "#" + sec.id === bestMatch.target) || matchesAnyWord) {
      sec.style.display = "block";
      visibleCount++;
      // Abre automaticamente os detalhes acadêmicos se a busca tiver termos acadêmicos
      const details = sec.querySelector("details.academic-details");
      if (details && words.some(w => normalizeText(details.innerText).includes(w))) {
        details.open = true;
      }
    } else {
      sec.style.display = "none";
    }
  });

  // 3. Exibe o Card de Resposta Instantânea
  if (bestMatch && bestScore > 0) {
    document.getElementById("instantTitle").innerHTML = bestMatch.title;
    document.getElementById("instantBody").innerHTML = bestMatch.answer;
    document.getElementById("instantLink").href = bestMatch.target;
    document.getElementById("searchCountBadge").innerText = `${visibleCount} seção(ões) relacionada(s)`;
    instantContainer.style.display = "block";
  } else if (visibleCount > 0) {
    document.getElementById("instantTitle").innerHTML = `Resultados encontrados para "${rawQuery}"`;
    document.getElementById("instantBody").innerHTML = `Encontramos <strong>${visibleCount} seção(ões)</strong> no documento que tratam desse assunto. Veja abaixo!`;
    document.getElementById("instantLink").href = "#docContent";
    document.getElementById("searchCountBadge").innerText = `${visibleCount} resultado(s)`;
    instantContainer.style.display = "block";
  } else {
    document.getElementById("instantTitle").innerHTML = `Nenhum resultado exato para "${rawQuery}"`;
    document.getElementById("instantBody").innerHTML = `Tente buscar por termos como: <strong>soldar fios</strong>, <strong>pino A1</strong>, <strong>resistor 5V 3.3V</strong>, <strong>descobrir IP</strong> ou <strong>ABNT</strong>.`;
    document.getElementById("instantLink").href = "#secao-1";
    document.getElementById("searchCountBadge").innerText = "Mostrando tudo";
    instantContainer.style.display = "block";
    sections.forEach(sec => (sec.style.display = "block"));
  }
}

// Copiar código em 1 clique
function copyCode(elementId, btnElement) {
  const codeText = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(codeText).then(() => {
    const originalText = btnElement.innerText;
    btnElement.innerText = "✅ Código Copiado!";
    btnElement.style.background = "#4cd964";
    btnElement.style.color = "#092c1b";
    setTimeout(() => {
      btnElement.innerText = originalText;
      btnElement.style.background = "";
      btnElement.style.color = "";
    }, 2200);
  });
}

// Expandir / Recolher todas as caixas de Fundamentação Acadêmica
let allAcademicOpen = false;
function toggleAllAcademic() {
  allAcademicOpen = !allAcademicOpen;
  const allDetails = document.querySelectorAll("details.academic-details");
  allDetails.forEach(d => (d.open = allAcademicOpen));

  const btn = document.getElementById("btnToggleAcademic");
  if (allAcademicOpen) {
    btn.classList.add("active-mode");
    btn.innerText = "🎓 Ocultar Fundamentação Acadêmica";
  } else {
    btn.classList.remove("active-mode");
    btn.innerText = "🎓 Expandir Fundamentação Acadêmica";
  }
}

// Alternar Modo Escuro / Claro
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  const btn = document.getElementById("btnDarkMode");
  btn.innerText = isDark ? "☀️ Modo Claro" : "🌙 Modo Escuro";
  localStorage.setItem("cyclospot_dark_mode", isDark ? "1" : "0");
}

// Atualizar Barra de Progresso do Checklist
function updateProgress() {
  const checks = document.querySelectorAll(".step-check");
  let checkedCount = 0;
  const states = [];
  checks.forEach(c => {
    if (c.checked) checkedCount++;
    states.push(c.checked);
  });
  const pct = Math.round((checkedCount / checks.length) * 100);
  document.getElementById("progressBarFill").style.width = pct + "%";
  localStorage.setItem("cyclospot_checklist", JSON.stringify(states));
}

// Restaurar estado salvo ao carregar a página
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("cyclospot_dark_mode") === "1") {
    document.body.classList.add("dark-mode");
    document.getElementById("btnDarkMode").innerText = "☀️ Modo Claro";
  }

  const savedChecklist = localStorage.getItem("cyclospot_checklist");
  if (savedChecklist) {
    try {
      const states = JSON.parse(savedChecklist);
      const checks = document.querySelectorAll(".step-check");
      checks.forEach((c, idx) => {
        if (states[idx]) c.checked = true;
      });
      updateProgress();
    } catch (e) {}
  }
});
