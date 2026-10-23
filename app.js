let kasusData = [];
let currentKasusIndex = 0;
let userAnswers = {};

let latinTimer = null;
let latinCountdownVal = 30;

function stopLatinTimer() {
  if (latinTimer) {
    clearInterval(latinTimer);
    latinTimer = null;
  }
  const latinContent = document.getElementById('story-latin-content');
  const latinBtn = document.getElementById('btn-toggle-latin');
  const timerInfo = document.getElementById('latin-timer-info');

  if (latinContent) latinContent.style.display = 'none';
  if (latinBtn) latinBtn.classList.remove('active');
  if (timerInfo) timerInfo.style.display = 'none';
}

function startLatinTimer() {
  if (latinTimer) clearInterval(latinTimer);
  latinCountdownVal = 30;

  const latinContent = document.getElementById('story-latin-content');
  const latinBtn = document.getElementById('btn-toggle-latin');
  const timerInfo = document.getElementById('latin-timer-info');
  const countdownEl = document.getElementById('latin-countdown');

  if (latinContent) latinContent.style.display = 'block';
  if (latinBtn) latinBtn.classList.add('active');
  if (timerInfo) timerInfo.style.display = 'inline-block';
  if (countdownEl) countdownEl.textContent = latinCountdownVal;

  latinTimer = setInterval(() => {
    latinCountdownVal--;
    if (countdownEl) countdownEl.textContent = latinCountdownVal;

    if (latinCountdownVal <= 0) {
      stopLatinTimer();
    }
  }, 1000);
}

function formatLatinText(text) {
  if (!text) return '';
  const cleanText = text.replace(/-/g, '');
  return cleanText.replace(/(^\s*|[.!?]\s+|\n+\s*)([a-zà-ÿ])/g, (match, prefix, char) => {
    return prefix + char.toUpperCase();
  });
}

function convertToAksara(text) {
  if (!text) return '';
  const lowerText = text.toLowerCase();
  
  if (typeof window.transliterateKawi === 'function') {
    const result = window.transliterateKawi(lowerText);
    return result.replace(/\s*\([^)]*\)/g, '');
  }
  
  return lowerText;
}

function populateStorySelect() {
  const triggerText = document.getElementById('selectedStoryText');
  const optionsContainer = document.getElementById('customSelectOptions');
  if (!optionsContainer || !kasusData || kasusData.length === 0) return;

  optionsContainer.innerHTML = '';
  
  if (triggerText) {
    triggerText.textContent = convertToAksara(kasusData[currentKasusIndex].judul);
  }

  kasusData.forEach((kasus, index) => {
    const optDiv = document.createElement('div');
    optDiv.className = 'custom-option aksara-kawi' + (index === currentKasusIndex ? ' selected' : '');
    optDiv.textContent = convertToAksara(kasus.judul);
    
    optDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      currentKasusIndex = index;
      userAnswers = {};
      hideScoreModal();
      closeCustomSelect();
      renderAll();
    });
    
    optionsContainer.appendChild(optDiv);
  });
}

function toggleCustomSelect() {
  const wrapper = document.querySelector('.custom-select-wrapper');
  if (wrapper) wrapper.classList.toggle('open');
}

function closeCustomSelect() {
  const wrapper = document.querySelector('.custom-select-wrapper');
  if (wrapper) wrapper.classList.remove('open');
}

function hideScoreModal() {
  const modal = document.getElementById('score-modal');
  if (modal) modal.style.display = 'none';
}

function showScoreModal(soalList) {
  if (!soalList || soalList.length === 0) return;

  let correctCount = 0;
  soalList.forEach((q, qIndex) => {
    if (userAnswers[qIndex] === q.kunci) {
      correctCount++;
    }
  });

  const wrongCount = soalList.length - correctCount;

  const scoreTextLatin = `panjeneng-an leres ${correctCount} wangsul-an lan kléntu ${wrongCount} wangsul-an.`;
  const fractionTextLatin = `${correctCount}/${soalList.length}`;

  const scoreTextEl = document.getElementById('modal-score-text');
  const fractionEl = document.getElementById('modal-score-fraction');
  const nextBtnEl = document.getElementById('modal-next-btn');
  const modal = document.getElementById('score-modal');

  if (scoreTextEl) scoreTextEl.textContent = convertToAksara(scoreTextLatin);
  if (fractionEl) fractionEl.textContent = convertToAksara(fractionTextLatin);
  if (nextBtnEl) nextBtnEl.textContent = convertToAksara('sabanjur-é');

  if (modal) modal.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', async () => {
  const trigger = document.getElementById('customSelectTrigger');
  if (trigger) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCustomSelect();
    });
  }

  document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.custom-select-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
      closeCustomSelect();
    }
  });

  const nextBtn = document.getElementById('next-story-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentKasusIndex < kasusData.length - 1) {
        currentKasusIndex++;
        userAnswers = {};
        hideScoreModal();
        renderAll();
      }
    });
  }

  const modalNextBtn = document.getElementById('modal-next-btn');
  if (modalNextBtn) {
    modalNextBtn.addEventListener('click', () => {
      hideScoreModal();
      if (currentKasusIndex < kasusData.length - 1) {
        currentKasusIndex++;
        userAnswers = {};
        renderAll();
      }
    });
  }

  const latinBtn = document.getElementById('btn-toggle-latin');
  if (latinBtn) {
    latinBtn.addEventListener('click', () => {
      const latinContent = document.getElementById('story-latin-content');
      if (latinContent) {
        const isHidden = latinContent.style.display === 'none' || !latinContent.style.display;
        if (isHidden) {
          startLatinTimer();
        } else {
          stopLatinTimer();
        }
      }
    });
  }

  await fetchKasusData();
});

async function fetchKasusData() {
  try {
    const response = await fetch('kasus.json');
    kasusData = await response.json();
    renderAll();
  } catch (error) {
    console.error('Gagal memuat kasus.json:', error);
  }
}

function renderAll() {
  if (!kasusData || kasusData.length === 0) return;

  stopLatinTimer();

  const uiTitle = document.getElementById('ui-title');
  if (uiTitle) uiTitle.textContent = convertToAksara("Crita lan Pitakon-an Aksara Kawi");

  const uiLabelStory = document.getElementById('ui-label-story');
  if (uiLabelStory) uiLabelStory.textContent = convertToAksara("Pilih Crita:");

  const uiQuestionsTitle = document.getElementById('ui-questions-title');
  if (uiQuestionsTitle) uiQuestionsTitle.textContent = convertToAksara("Wangsul-ana Pitakon-Pitakon Ing Ngisor Iki:");

  const nextStoryBtn = document.getElementById('next-story-btn');
  if (nextStoryBtn) nextStoryBtn.textContent = convertToAksara("Crita Sabanjur-é");

  populateStorySelect();

  const activeKasus = kasusData[currentKasusIndex];

  document.getElementById('story-title').textContent = convertToAksara(activeKasus.judul);

  const storyContentEl = document.getElementById('story-content');
  if (storyContentEl) {
    storyContentEl.innerHTML = '';

    if (activeKasus.gambar) {
      const imgEl = document.createElement('img');
      imgEl.src = activeKasus.gambar;
      imgEl.alt = activeKasus.judul || 'Gambar Crita';
      imgEl.className = 'story-img';
      storyContentEl.appendChild(imgEl);
    }

    const textNode = document.createTextNode(convertToAksara(activeKasus.cerita));
    storyContentEl.appendChild(textNode);
  }

  const latinContent = document.getElementById('story-latin-content');
  if (latinContent) {
    latinContent.textContent = formatLatinText(activeKasus.cerita);
  }

  renderSoal(activeKasus.soal);

  if (nextStoryBtn) {
    if (currentKasusIndex < kasusData.length - 1) {
      nextStoryBtn.style.display = 'block';
    } else {
      nextStoryBtn.style.display = 'none';
    }
  }

  const modal = document.getElementById('score-modal');
  if (modal && modal.style.display !== 'none') {
    showScoreModal(activeKasus.soal);
  }
}

function renderSoal(soalList) {
  const container = document.getElementById('questions-container');
  container.innerHTML = '';

  if (!soalList || !Array.isArray(soalList)) return;

  const prefixes = ['ha. ', 'na. ', 'ca. ', 'ra. '];

  soalList.forEach((q, qIndex) => {
    const qBlock = document.createElement('div');
    qBlock.className = 'question-block';

    const qTitle = document.createElement('div');
    qTitle.className = 'aksara-kawi';
    qTitle.style.fontWeight = 'bold';
    qTitle.textContent = convertToAksara(`${qIndex + 1}. ${q.pertanyaan}`);
    qBlock.appendChild(qTitle);

    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'options-grid';

    q.pilihan.forEach((opt, optIndex) => {
      const optBtn = document.createElement('button');
      optBtn.className = 'option-btn aksara-kawi';
      optBtn.textContent = convertToAksara(`${prefixes[optIndex]}${opt}`);

      const hasAnswered = userAnswers[qIndex] !== undefined;

      if (hasAnswered) {
        optBtn.disabled = true;
        const selectedOpt = userAnswers[qIndex];
        const correctOpt = q.kunci;

        if (optIndex === correctOpt) {
          optBtn.classList.add('correct');
        } else if (optIndex === selectedOpt) {
          optBtn.classList.add('incorrect');
        }
      } else {
        optBtn.addEventListener('click', () => {
          userAnswers[qIndex] = optIndex;
          renderAll();

          if (Object.keys(userAnswers).length === soalList.length) {
            showScoreModal(soalList);
          }
        });
      }

      optionsGrid.appendChild(optBtn);
    });

    qBlock.appendChild(optionsGrid);
    container.appendChild(qBlock);
  });
}
