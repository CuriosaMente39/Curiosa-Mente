const phases = [
  { pairs: [1, 2], title: 'Fase 1 — Reconhecimento inicial' },
  { pairs: [3, 4, 5, 6], title: 'Fase 2 — Desafio intermediário' },
  { pairs: [7, 8, 9, 10, 11, 12], title: 'Fase 3 — Desafio avançado' }
];

const audio = {
  correct: new Audio('assets/audio/acerto.mp3'),
  error: new Audio('assets/audio/erro.mp3'),
  victory: new Audio('assets/audio/vitoria.mp3')
};
Object.values(audio).forEach(a => { a.preload = 'auto'; a.volume = 0.75; });

const board = document.querySelector('#gameBoard');
const phaseLabel = document.querySelector('#phaseLabel');
const pairsLabel = document.querySelector('#pairsLabel');
const attemptsLabel = document.querySelector('#attemptsLabel');
const timerLabel = document.querySelector('#timerLabel');
const progressBar = document.querySelector('#progressBar');
const liveMessage = document.querySelector('#liveMessage');
const phaseDialog = document.querySelector('#phaseDialog');
const victoryDialog = document.querySelector('#victoryDialog');

let currentPhase = 0;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let attempts = 0;
let soundEnabled = true;
let elapsedSeconds = 0;
let timer = null;

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createDeck(pairIds) {
  return shuffle(pairIds.flatMap(id => [
    { id, key: `${id}-a` },
    { id, key: `${id}-b` }
  ]));
}

function initPhase(index) {
  clearInterval(timer);
  currentPhase = index;
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  matchedPairs = 0;
  attempts = 0;
  elapsedSeconds = 0;
  board.innerHTML = '';

  const phase = phases[index];
  phaseLabel.textContent = `${index + 1} de ${phases.length}`;
  pairsLabel.textContent = `0 / ${phase.pairs.length}`;
  attemptsLabel.textContent = '0';
  timerLabel.textContent = '00:00';
  progressBar.style.width = '0%';
  liveMessage.textContent = `${phase.title}. Selecione duas cartas.`;

  createDeck(phase.pairs).forEach((item, cardIndex) => {
    const card = document.createElement('button');
    card.className = 'memory-card';
    card.dataset.pair = String(item.id);
    card.dataset.key = item.key;
    card.setAttribute('aria-label', `Carta ${cardIndex + 1}, virada para baixo`);
    card.innerHTML = `
      <span class="card-face card-front" aria-hidden="true"></span>
      <span class="card-face card-back">
        <img src="assets/img/${item.id}.png" alt="Imagem de neuroanatomia ${item.id}" onerror="this.alt='Adicione o arquivo ${item.id}.png na pasta assets/img'; this.parentElement.textContent='${item.id}.png';">
      </span>`;
    card.addEventListener('click', () => flipCard(card));
    board.appendChild(card);
  });

  startTimer();
  board.querySelector('button')?.focus();
}

function flipCard(card) {
  if (lockBoard || card === firstCard || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  card.setAttribute('aria-label', `Carta revelada: imagem ${card.dataset.pair}`);

  if (!firstCard) {
    firstCard = card;
    liveMessage.textContent = 'Primeira carta escolhida. Agora selecione outra.';
    return;
  }

  secondCard = card;
  attempts++;
  attemptsLabel.textContent = String(attempts);
  checkMatch();
}

function checkMatch() {
  const isMatch = firstCard.dataset.pair === secondCard.dataset.pair;
  if (isMatch) handleMatch();
  else handleMismatch();
}

function handleMatch() {
  firstCard.classList.add('matched');
  secondCard.classList.add('matched');
  firstCard.disabled = true;
  secondCard.disabled = true;
  matchedPairs++;
  pairsLabel.textContent = `${matchedPairs} / ${phases[currentPhase].pairs.length}`;
  progressBar.style.width = `${(matchedPairs / phases[currentPhase].pairs.length) * 100}%`;
  liveMessage.textContent = 'Muito bem! Você encontrou um par.';
  playSound('correct');
  resetTurn();

  if (matchedPairs === phases[currentPhase].pairs.length) {
    clearInterval(timer);
    setTimeout(finishPhase, 700);
  }
}

function handleMismatch() {
  lockBoard = true;
  firstCard.classList.add('wrong');
  secondCard.classList.add('wrong');
  liveMessage.textContent = 'As imagens são diferentes. Observe e tente novamente.';
  playSound('error');

  setTimeout(() => {
    [firstCard, secondCard].forEach(card => {
      card.classList.remove('flipped', 'wrong');
      card.setAttribute('aria-label', 'Carta virada para baixo');
    });
    resetTurn();
  }, 1150);
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function finishPhase() {
  playSound('victory');
  if (currentPhase < phases.length - 1) {
    document.querySelector('#phaseSummary').textContent = `Você encontrou todos os pares em ${attempts} tentativas e ${formatTime(elapsedSeconds)}.`;
    phaseDialog.showModal();
  } else {
    document.querySelector('#victorySummary').textContent = `Você concluiu as três fases! Na fase final foram ${attempts} tentativas em ${formatTime(elapsedSeconds)}.`;
    victoryDialog.showModal();
  }
}

function startTimer() {
  timer = setInterval(() => {
    elapsedSeconds++;
    timerLabel.textContent = formatTime(elapsedSeconds);
  }, 1000);
}

function formatTime(total) {
  const min = String(Math.floor(total / 60)).padStart(2, '0');
  const sec = String(total % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

function playSound(type) {
  if (!soundEnabled) return;
  const sound = audio[type];
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

document.querySelector('#restartBtn').addEventListener('click', () => initPhase(currentPhase));
document.querySelector('#nextPhaseBtn').addEventListener('click', () => {
  phaseDialog.close();
  initPhase(currentPhase + 1);
});
document.querySelector('#playAgainBtn').addEventListener('click', () => {
  victoryDialog.close();
  initPhase(0);
});

document.querySelector('#instructionsBtn').addEventListener('click', () => document.querySelector('#instructionsDialog').showModal());
document.querySelector('#closeInstructions').addEventListener('click', () => document.querySelector('#instructionsDialog').close());

document.querySelector('#soundBtn').addEventListener('click', event => {
  soundEnabled = !soundEnabled;
  event.currentTarget.setAttribute('aria-pressed', String(soundEnabled));
  event.currentTarget.textContent = soundEnabled ? '🔊 Som ligado' : '🔇 Som desligado';
});

document.querySelector('#contrastBtn').addEventListener('click', event => {
  document.body.classList.toggle('high-contrast');
  const active = document.body.classList.contains('high-contrast');
  event.currentTarget.setAttribute('aria-pressed', String(active));
});

let fontScale = 1;
document.querySelector('#increaseText').addEventListener('click', () => {
  fontScale = Math.min(1.35, fontScale + .1);
  document.documentElement.style.setProperty('--font-scale', fontScale);
});
document.querySelector('#decreaseText').addEventListener('click', () => {
  fontScale = Math.max(.9, fontScale - .1);
  document.documentElement.style.setProperty('--font-scale', fontScale);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.error));
}

initPhase(0);
