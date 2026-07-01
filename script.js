// ===================================
// SISTEMA DE TEMA (CLARO/ESCURO)
// ===================================
var body = document.body;
var themeToggle = document.getElementById('theme-toggle') || document.getElementById('botao-tema');

function applyTheme(isDark) {
  // Suporta ambas as classes usadas no projeto (dark e modo-escuro)
  body.classList.toggle('dark', isDark);
  body.classList.toggle('modo-escuro', isDark);
  if (themeToggle && themeToggle.type === 'checkbox') {
    themeToggle.checked = isDark;
  }
  var moonIcon = document.querySelector('.toggle-theme .fa-moon, .toggle-theme .fa-sun');
  if (moonIcon) {
    moonIcon.classList.toggle('fa-moon', !isDark);
    moonIcon.classList.toggle('fa-sun', isDark);
  }
}

// Carrega tema salvo — aceita as duas chaves usadas no projeto
(function initTheme() {
  var saved = localStorage.getItem('nexa_theme') || localStorage.getItem('tema');
  applyTheme(saved === 'dark' || saved === 'escuro');
})();

if (themeToggle) {
  themeToggle.addEventListener('change', function () {
    var isDark = themeToggle.checked;
    applyTheme(isDark);
    // Salva nas duas chaves para compatibilidade com login/cadastro
    localStorage.setItem('nexa_theme', isDark ? 'dark' : 'light');
    localStorage.setItem('tema', isDark ? 'escuro' : 'claro');
  });
}

// ===================================
// SIDEBAR — COLAPSAR / EXPANDIR
// ===================================
(function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.querySelector('.toggle-sidebar');
  const collapseIcon = document.getElementById('collapse-icon');
  if (!sidebar || !toggleBtn) return;

  const isCollapsed = localStorage.getItem('nexa_sidebar') === 'collapsed';
  if (isCollapsed) {
    sidebar.classList.add('collapsed');
    if (collapseIcon) {
      collapseIcon.classList.remove('fa-angle-double-left');
      collapseIcon.classList.add('fa-angle-double-right');
    }
  }

  toggleBtn.addEventListener('click', function () {
    const collapsed = sidebar.classList.toggle('collapsed');
    if (collapseIcon) {
      collapseIcon.classList.toggle('fa-angle-double-left', !collapsed);
      collapseIcon.classList.toggle('fa-angle-double-right', collapsed);
    }
    localStorage.setItem('nexa_sidebar', collapsed ? 'collapsed' : 'expanded');
  });
})();

// ===================================
// SIDEBAR — INFO DO USUÁRIO / LOGIN / ADMIN
// ===================================
function applySidebarUserInfo() {
  var user    = null;
  var profile = null;
  try { user    = JSON.parse(localStorage.getItem('nexa_logged_in')); } catch (e) {}

  // CORREÇÃO: perfil separado por email (chave nexa_profile_<email>)
  var profileKey = user ? 'nexa_profile_' + (user.email || 'guest') : 'nexa_profile_guest';
  try { profile = JSON.parse(localStorage.getItem(profileKey)); } catch (e) {}

  var imgEl  = document.querySelector('.sidebar .header img');
  var infoEl = document.querySelector('.sidebar .header .info');
  var menuEl = document.querySelector('.sidebar .menu');

  if (!infoEl) return;

  if (!user) {
    // ── Deslogado: exibe botão de login estilizado ──
    if (imgEl) imgEl.src = 'https://i.pravatar.cc/100?img=0';
    infoEl.classList.add('logged-out');
    infoEl.innerHTML =
      '<a class="sidebar-login-button" href="./Login/login.html">' +
        '<i class="fas fa-sign-in-alt" style="margin-right:6px;"></i>Fazer login' +
      '</a>';

    // Esconde itens restritos no menu principal
    if (menuEl) {
      menuEl.querySelectorAll('.menu-item').forEach(function (item) {
        var a = item.querySelector('a');
        var href = a ? a.getAttribute('href') : '';
        var isPublic = !href || href === '#' ||
          href.includes('pagina_inicial') || href.includes('materias');
        if (!isPublic) item.style.display = 'none';
      });
    }

    // Esconde encerrar sessão e perfil do bottom
    document.querySelectorAll('.sidebar .bottom .menu-item').forEach(function (item) {
      var span = item.querySelector('span');
      var txt  = span ? span.textContent.trim() : '';
      if (txt === 'Encerrar sessão' || txt === 'Perfil') {
        item.style.display = 'none';
      }
    });
    return;
  }

  // ── Logado ──
  var displayName = user.username || user.name || 'Usuário';
  var isAdmin     = user.role === 'admin' || user.isAdmin === true;

  if (imgEl && profile && profile.photo) imgEl.src = profile.photo;

  infoEl.classList.remove('logged-out');
  infoEl.innerHTML =
    '<strong>' + displayName + '</strong>' +
    (isAdmin
      ? '<br><span class="sidebar-role-badge"><i class="fas fa-shield-alt"></i> Admin</span>'
      : '<br><span class="sidebar-role-estudante">Estudante</span>');

  // ── Admin: adiciona item "Área do Admin" no menu ──
  if (isAdmin && menuEl && !menuEl.querySelector('.menu-item-admin')) {
    var adminItem = document.createElement('div');
    adminItem.className = 'menu-item menu-item-admin';
    adminItem.innerHTML =
      '<i class="fas fa-shield-alt"></i>' +
      '<a href="./admin.html"><span>Área do Admin</span></a>';
    var items = menuEl.querySelectorAll('.menu-item');
    var last  = items[items.length - 1];
    menuEl.insertBefore(adminItem, last);
  }
}

// ===================================
// SIDEBAR — AÇÃO DE ENCERRAR SESSÃO
// ===================================
function wireSidebarActions() {
  document.querySelectorAll('.sidebar .bottom .menu-item').forEach(function (item) {
    var span = item.querySelector('span');
    var txt  = span ? span.textContent.trim() : '';
    if (txt === 'Encerrar sessão') {
      item.style.cursor = 'pointer';
      item.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('nexa_logged_in');
        window.location.href = './Login/login.html';
      });
    }
  });
}


// ===================================
// CARROSSEL — PÁGINA INICIAL
// ===================================
function initHomeCarousel() {
  var slides = document.querySelectorAll('.carousel-slide');
  var thumbs = document.querySelectorAll('.carousel-thumb');
  var prevBtn = document.querySelector('.carousel-arrow.prev');
  var nextBtn = document.querySelector('.carousel-arrow.next');
  if (!slides.length) return;

  var current = 0;
  var autoTimer = null;

  function goTo(index) {
    slides[current].classList.remove('active');
    thumbs[current] && thumbs[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    thumbs[current] && thumbs[current].classList.add('active');
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(function () { goTo(current + 1); }, 5000);
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); startAuto(); });

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      goTo(parseInt(thumb.getAttribute('data-index'), 10));
      startAuto();
    });
  });

  startAuto();
}

// ===================================
// CALCULADORA ENEM
// ===================================
(function initCalculadora() {
  var btn = document.getElementById('calcular-enem');
  if (!btn) return;

  btn.addEventListener('click', function () {
    var ch   = parseFloat(document.getElementById('nota-ch').value);
    var cn   = parseFloat(document.getElementById('nota-cn').value);
    var ling = parseFloat(document.getElementById('nota-ling').value);
    var mat  = parseFloat(document.getElementById('nota-mat').value);
    var red  = parseFloat(document.getElementById('nota-red').value);

    var resultado = document.getElementById('resultado-enem');

    var notas = [ch, cn, ling, mat, red];
    var invalidas = notas.some(function (n) { return isNaN(n) || n < 0 || n > 1000; });

    if (invalidas) {
      resultado.style.display = 'block';
      resultado.innerHTML = '<p class="error">Por favor, preencha todas as notas corretamente (0 a 1000).</p>';
      return;
    }

    var media = (ch + cn + ling + mat + red) / 5;

    var faculdades = [
      {
        nome: 'ProUni',
        calculo: 'Média simples das 5 provas',
        media: media,
        descricao: media >= 450 ? 'Você pode concorrer a bolsas ProUni.' : 'Nota mínima: 450 pontos (+ redação ≠ zero).'
      },
      {
        nome: 'FIES',
        calculo: 'Média simples ≥ 450',
        media: media,
        descricao: media >= 450 ? 'Você atinge o mínimo para o FIES.' : 'Nota mínima: 450 pontos.'
      },
      {
        nome: 'SISU',
        calculo: 'Média ponderada conforme curso',
        media: media,
        descricao: 'A nota de corte varia por curso e universidade.'
      }
    ];

    var cardsHTML = faculdades.map(function (f) {
      return '<div class="faculdade-card">' +
        '<h4>' + f.nome + '</h4>' +
        '<p><strong>Cálculo:</strong> ' + f.calculo + '</p>' +
        '<p>' + f.descricao + '</p>' +
      '</div>';
    }).join('');

    resultado.style.display = 'block';
    resultado.innerHTML =
      '<div class="resultado-header">' +
        '<h3>Sua média ENEM</h3>' +
        '<div class="media-final">' + media.toFixed(2) + ' pts</div>' +
      '</div>' +
      '<div class="faculdades-container">' + cardsHTML + '</div>' +
      '<p class="disclaimer">* Os critérios de aprovação variam por instituição e edição do ENEM. Consulte sempre o edital oficial.</p>';
  });
})();

// ===================================
// EXERCÍCIOS
// ===================================
function initExercisesPage() {
  var list = document.getElementById('exercise-list');
  if (!list) return;

  var selector = document.getElementById('exercise-filters');
  var prompt   = document.getElementById('exercise-prompt');

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  var exerciseBank = {
    'Matemática': [
      { id: 'mat-1', question: 'Se 3x + 5 = 20, qual é o valor de x?', options: ['3', '5', '6', '7'], answer: 1, explanation: 'Subtraindo 5 dos dois lados, temos 3x = 15. Então x = 5.', topic: 'Equações', difficulty: 'Fácil', answerLabel: '5' },
      { id: 'mat-2', question: 'Quanto é 1/2 + 1/4?', options: ['2/6', '3/4', '1/3', '2/4'], answer: 1, explanation: 'Somando as frações, obtemos 2/4 + 1/4 = 3/4.', topic: 'Frações', difficulty: 'Fácil', answerLabel: '3/4' },
      { id: 'mat-3', question: 'Quanto é 2³?', options: ['6', '8', '9', '12'], answer: 1, explanation: '2 elevado a 3 é 2 × 2 × 2 = 8.', topic: 'Potências', difficulty: 'Fácil', answerLabel: '8' },
      { id: 'mat-4', question: 'Quantos lados tem um triângulo?', options: ['2', '3', '4', '5'], answer: 1, explanation: 'Um triângulo sempre tem 3 lados.', topic: 'Geometria', difficulty: 'Fácil', answerLabel: '3' },
      { id: 'mat-5', question: '10% de 100 é igual a:', options: ['5', '8', '10', '12'], answer: 2, explanation: '10% de 100 corresponde a 10.', topic: 'Porcentagem', difficulty: 'Fácil', answerLabel: '10' }
    ],
    'Português': [
      { id: 'por-1', question: 'Em um texto argumentativo, a tese representa:', options: ['Um exemplo do autor', 'A ideia principal defendida', 'A conclusão final', 'Um dado estatístico'], answer: 1, explanation: 'A tese é a posição central defendida pelo autor ao longo do texto.', topic: 'Interpretação', difficulty: 'Fácil', answerLabel: 'A ideia principal defendida' },
      { id: 'por-2', question: 'Qual palavra está escrita corretamente?', options: ['excessão', 'exceção', 'exessão', 'ecessão'], answer: 1, explanation: 'A forma correta é exceção.', topic: 'Gramática', difficulty: 'Fácil', answerLabel: 'exceção' },
      { id: 'por-3', question: 'Qual é um sinônimo de feliz?', options: ['Triste', 'Nervoso', 'Alegre', 'Cansado'], answer: 2, explanation: 'Alegre é sinônimo de feliz.', topic: 'Sinônimos', difficulty: 'Fácil', answerLabel: 'Alegre' },
      { id: 'por-4', question: 'Na frase "Eles estudam todos os dias", o verbo está em:', options: ['Passado', 'Presente', 'Futuro', 'Subjuntivo'], answer: 1, explanation: 'Estudam indica uma ação no presente.', topic: 'Verbo', difficulty: 'Fácil', answerLabel: 'Presente' },
      { id: 'por-5', question: 'Qual sinal encerra uma pergunta?', options: ['Ponto final', 'Vírgula', 'Ponto e vírgula', 'Ponto de interrogação'], answer: 3, explanation: 'O ponto de interrogação é usado no final de perguntas.', topic: 'Pontuação', difficulty: 'Fácil', answerLabel: 'Ponto de interrogação' }
    ],
    'História': [
      { id: 'hist-1', question: 'A Proclamação da República no Brasil ocorreu em:', options: ['1822', '1889', '1930', '1964'], answer: 1, explanation: 'A República foi proclamada em 15 de novembro de 1889.', topic: 'Brasil', difficulty: 'Fácil', answerLabel: '1889' },
      { id: 'hist-2', question: 'O Brasil foi colonizado principalmente por qual país?', options: ['França', 'Portugal', 'Espanha', 'Inglaterra'], answer: 1, explanation: 'Portugal foi o principal colonizador do Brasil.', topic: 'Brasil Colônia', difficulty: 'Fácil', answerLabel: 'Portugal' },
      { id: 'hist-3', question: 'A independência do Brasil foi declarada em:', options: ['1500', '1822', '1888', '1891'], answer: 1, explanation: 'A independência foi declarada em 1822.', topic: 'Independência', difficulty: 'Fácil', answerLabel: '1822' },
      { id: 'hist-4', question: 'Quem proclamou a República no Brasil?', options: ['Dom Pedro I', 'Tiradentes', 'Marechal Deodoro da Fonseca', 'Getúlio Vargas'], answer: 2, explanation: 'Marechal Deodoro da Fonseca liderou a Proclamação da República.', topic: 'República', difficulty: 'Fácil', answerLabel: 'Marechal Deodoro da Fonseca' },
      { id: 'hist-5', question: 'O Egito Antigo se desenvolveu às margens de qual rio?', options: ['Nilo', 'Tigre', 'Eufrates', 'Amazonas'], answer: 0, explanation: 'A civilização egípcia floresceu às margens do rio Nilo.', topic: 'Povos Antigos', difficulty: 'Fácil', answerLabel: 'Nilo' }
    ],
    'Geografia': [
      { id: 'geo-1', question: 'A principal característica do clima equatorial é:', options: ['Inverno seco e verão rigoroso', 'Baixa umidade o ano todo', 'Temperaturas altas e muita chuva', 'Amplitude térmica extrema'], answer: 2, explanation: 'O clima equatorial tem alta temperatura média e grande volume de chuvas.', topic: 'Clima', difficulty: 'Fácil', answerLabel: 'Temperaturas altas e muita chuva' },
      { id: 'geo-2', question: 'Qual letra indica o norte no mapa?', options: ['S', 'L', 'N', 'O'], answer: 2, explanation: 'N é a abreviação de norte.', topic: 'Mapa', difficulty: 'Fácil', answerLabel: 'N' },
      { id: 'geo-3', question: 'Qual é o maior continente do mundo?', options: ['África', 'Europa', 'Ásia', 'América do Sul'], answer: 2, explanation: 'A Ásia é o maior continente em extensão territorial.', topic: 'Território', difficulty: 'Fácil', answerLabel: 'Ásia' },
      { id: 'geo-4', question: 'A floresta Amazônica está localizada principalmente em qual região?', options: ['Europa', 'América do Sul', 'África', 'Oceania'], answer: 1, explanation: 'A floresta Amazônica fica na América do Sul.', topic: 'Vegetação', difficulty: 'Fácil', answerLabel: 'América do Sul' },
      { id: 'geo-5', question: 'Urbanização é o processo de:', options: ['Aumentar a área rural', 'Concentrar população nas cidades', 'Diminuir estradas', 'Criar mais rios'], answer: 1, explanation: 'Urbanização é o crescimento das cidades e da população urbana.', topic: 'Urbanização', difficulty: 'Fácil', answerLabel: 'Concentrar população nas cidades' }
    ],
    'Biologia': [
      { id: 'bio-1', question: 'Qual nível trófico produz seu próprio alimento?', options: ['Consumidores', 'Decompositores', 'Produtores', 'Detritívoros'], answer: 2, explanation: 'Produtores, como plantas e algas, realizam fotossíntese.', topic: 'Ecologia', difficulty: 'Fácil', answerLabel: 'Produtores' },
      { id: 'bio-2', question: 'Qual organela é conhecida como a usina de energia da célula?', options: ['Núcleo', 'Mitocôndria', 'Ribossomo', 'Membrana'], answer: 1, explanation: 'A mitocôndria produz energia para a célula.', topic: 'Célula', difficulty: 'Fácil', answerLabel: 'Mitocôndria' },
      { id: 'bio-3', question: 'A fotossíntese acontece principalmente em qual parte da planta?', options: ['Raiz', 'Caule', 'Folhas', 'Flor'], answer: 2, explanation: 'As folhas concentram a maior parte da fotossíntese.', topic: 'Plantas', difficulty: 'Fácil', answerLabel: 'Folhas' },
      { id: 'bio-4', question: 'Qual órgão bombeia o sangue no corpo?', options: ['Pulmão', 'Fígado', 'Coração', 'Estômago'], answer: 2, explanation: 'O coração é responsável por bombear o sangue.', topic: 'Corpo humano', difficulty: 'Fácil', answerLabel: 'Coração' },
      { id: 'bio-5', question: 'O que é um ecossistema?', options: ['Apenas animais', 'Apenas plantas', 'Conjunto de seres vivos e ambiente', 'Somente o clima'], answer: 2, explanation: 'Ecossistema é o conjunto dos seres vivos com o ambiente em que vivem.', topic: 'Ecossistemas', difficulty: 'Fácil', answerLabel: 'Conjunto de seres vivos e ambiente' }
    ],
    'Inglês': [
      { id: 'ing-1', question: 'Qual a tradução correta de "book"?', options: ['Mesa', 'Livro', 'Caderno', 'Caneta'], answer: 1, explanation: 'Book significa livro.', topic: 'Vocabulário', difficulty: 'Fácil', answerLabel: 'Livro' },
      { id: 'ing-2', question: 'Qual é a tradução de "apple"?', options: ['Banana', 'Uva', 'Maçã', 'Laranja'], answer: 2, explanation: 'Apple significa maçã.', topic: 'Vocabulário', difficulty: 'Fácil', answerLabel: 'Maçã' },
      { id: 'ing-3', question: 'Como se diz "bom dia" em inglês?', options: ['Good night', 'Good morning', 'Hello teacher', 'See you'], answer: 1, explanation: 'Good morning é usado para dizer bom dia.', topic: 'Frases', difficulty: 'Fácil', answerLabel: 'Good morning' },
      { id: 'ing-4', question: 'Qual verbo significa "ler"?', options: ['write', 'read', 'watch', 'speak'], answer: 1, explanation: 'Read significa ler.', topic: 'Verbos', difficulty: 'Fácil', answerLabel: 'read' },
      { id: 'ing-5', question: 'Qual a tradução de "blue"?', options: ['Verde', 'Branco', 'Azul', 'Preto'], answer: 2, explanation: 'Blue significa azul.', topic: 'Cores', difficulty: 'Fácil', answerLabel: 'Azul' }
    ]
  };

  var state = readJSON('nexa_exercises_state', { subject: 'Matemática', positionBySubject: {}, orderBySubject: {} });
  if (!state || typeof state !== 'object') {
    state = { subject: 'Matemática', positionBySubject: {}, orderBySubject: {} };
  }

  function saveState() { writeJSON('nexa_exercises_state', state); }

  function getSubjectBank(subject) { return exerciseBank[subject] || []; }

  function shuffleOrder(subject) {
    var bank = getSubjectBank(subject);
    var order = bank.map(function (_, i) { return i; });
    for (var j = order.length - 1; j > 0; j--) {
      var swap = Math.floor(Math.random() * (j + 1));
      var temp = order[j]; order[j] = order[swap]; order[swap] = temp;
    }
    state.orderBySubject[subject] = order;
    return order;
  }

  function getActiveExercise() {
    var bank = getSubjectBank(state.subject);
    if (!bank.length) return null;
    var order = state.orderBySubject[state.subject];
    if (!Array.isArray(order) || order.length !== bank.length) order = shuffleOrder(state.subject);
    var position = state.positionBySubject[state.subject] || 0;
    if (position >= order.length) {
      order = shuffleOrder(state.subject);
      position = 0;
      state.positionBySubject[state.subject] = 0;
      saveState();
    }
    return { item: bank[order[position]], position: position, total: bank.length };
  }

  function syncSelector() {
    if (!selector) return;
    Array.prototype.slice.call(selector.querySelectorAll('.subject-card')).forEach(function (card) {
      var active = card.getAttribute('data-subject') === state.subject;
      card.classList.toggle('is-active', active);
      card.setAttribute('aria-pressed', String(active));
    });
  }

  function updatePrompt() {
    if (!prompt) return;
    var bank = getSubjectBank(state.subject);
    var position = (state.positionBySubject[state.subject] || 0) + 1;
    prompt.textContent = bank.length
      ? ('Exercícios de ' + state.subject + ' — questão ' + position + ' de ' + bank.length + '.')
      : 'Selecione uma matéria para ver os exercícios.';
  }

  function renderExercise() {
    list.innerHTML = '';
    var active = getActiveExercise();
    if (!active || !active.item) {
      list.innerHTML = '<div class="exercise-item"><strong>Nenhum exercício encontrado para esta matéria.</strong></div>';
      updatePrompt();
      return;
    }

    var exercise = active.item;
    var recordKey = 'nexa_exercise_' + state.subject + '_' + exercise.id;
    var record = readJSON(recordKey, null);

    var card = document.createElement('article');
    card.className = 'exercise-item';
    card.innerHTML =
      '<div class="exercise-meta"><span class="pill admin">' + state.subject + '</span><span class="pill user">' + exercise.topic + '</span><span class="pill online">' + exercise.difficulty + '</span><span class="pill">' + (active.position + 1) + '/' + active.total + '</span></div>' +
      '<h3>' + exercise.question + '</h3>' +
      '<p class="exercise-statement">Escolha uma alternativa e confira o resultado logo abaixo.</p>' +
      '<div class="exercise-options">' + exercise.options.map(function (option, index) {
        var checked = record && record.answerIndex === index ? ' checked' : '';
        return '<label class="exercise-option"><input type="radio" name="' + exercise.id + '" value="' + index + '"' + checked + '><span>' + option + '</span></label>';
      }).join('') + '</div>' +
      '<div class="exercise-actions"><button class="small-btn primary" type="button" data-action="check">Corrigir</button><button class="small-btn" type="button" data-action="show-answer">Ver gabarito</button></div>' +
      '<div class="exercise-feedback" aria-live="polite"></div>';

    list.appendChild(card);

    var feedback = card.querySelector('.exercise-feedback');

    if (record) {
      feedback.className = 'exercise-feedback ' + (record.isCorrect ? 'correct' : 'incorrect');
      feedback.style.display = 'block';
      feedback.textContent = record.isCorrect
        ? ('Correto. ' + exercise.explanation)
        : ('Resposta anterior registrada. Gabarito: ' + exercise.answerLabel + '. ' + exercise.explanation);
    }

    card.querySelector('[data-action="check"]').addEventListener('click', function () {
      var selected = card.querySelector('input[type="radio"]:checked');
      if (!selected) {
        feedback.className = 'exercise-feedback incorrect';
        feedback.style.display = 'block';
        feedback.textContent = 'Selecione uma alternativa antes de corrigir.';
        return;
      }
      var answerIndex = parseInt(selected.value, 10);
      var isCorrect = answerIndex === exercise.answer;
      writeJSON(recordKey, { answerIndex: answerIndex, isCorrect: isCorrect, answeredAt: new Date().toISOString() });
      feedback.className = 'exercise-feedback ' + (isCorrect ? 'correct' : 'incorrect');
      feedback.style.display = 'block';
      feedback.textContent = isCorrect
        ? ('Correto. ' + exercise.explanation)
        : ('Quase. A resposta correta é ' + exercise.answerLabel + '. ' + exercise.explanation);

      if (isCorrect) {
        state.positionBySubject[state.subject] = active.position + 1;
        if (state.positionBySubject[state.subject] >= active.total) {
          state.orderBySubject[state.subject] = shuffleOrder(state.subject);
          state.positionBySubject[state.subject] = 0;
        }
        saveState();
        window.setTimeout(function () { renderExercise(); updatePrompt(); }, 650);
      }
    });

    card.querySelector('[data-action="show-answer"]').addEventListener('click', function () {
      feedback.className = 'exercise-feedback correct';
      feedback.style.display = 'block';
      feedback.textContent = 'Gabarito: ' + exercise.answerLabel + '. ' + exercise.explanation;
    });

    updatePrompt();
  }

  function selectSubject(subject) {
    if (!exerciseBank[subject]) return;
    state.subject = subject;
    if (!state.orderBySubject[subject] || state.orderBySubject[subject].length !== exerciseBank[subject].length) {
      state.orderBySubject[subject] = shuffleOrder(subject);
    }
    if (typeof state.positionBySubject[subject] !== 'number') state.positionBySubject[subject] = 0;
    saveState();
    syncSelector();
    renderExercise();
  }

  if (selector && !selector.dataset.bound) {
    selector.dataset.bound = 'true';
    selector.addEventListener('click', function (ev) {
      var card = ev.target.closest('.subject-card');
      if (!card) return;
      selectSubject(card.getAttribute('data-subject'));
    });
    selector.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      var card = ev.target.closest('.subject-card');
      if (!card) return;
      ev.preventDefault();
      selectSubject(card.getAttribute('data-subject'));
    });
  }

  if (!exerciseBank[state.subject]) state.subject = 'Matemática';
  if (!state.orderBySubject[state.subject]) state.orderBySubject[state.subject] = shuffleOrder(state.subject);
  if (typeof state.positionBySubject[state.subject] !== 'number') state.positionBySubject[state.subject] = 0;
  saveState();
  syncSelector();
  renderExercise();
}

// ===================================
// INICIALIZAÇÃO
// ===================================
document.addEventListener('DOMContentLoaded', function () {
  applySidebarUserInfo();
  wireSidebarActions();
  initExercisesPage();
  initHomeCarousel();
});
