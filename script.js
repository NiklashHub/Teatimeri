document.addEventListener('DOMContentLoaded', function () {
  const teaTypeSelect = document.getElementById('tea-type');
  const timerDisplay = document.getElementById('timer');
  const startBtn = document.getElementById('start-btn');
  const resetBtn = document.getElementById('reset-btn');
  const teaInfo = document.getElementById('tea-info');
  const timerSound = document.getElementById('timer-sound');
  const progressCircle = document.querySelector('.progress-circle');
  const languageSelect = document.getElementById('language-select');

  // Translations and tea data
  const translations = {
    en: {
      title: "Tea Timer",
      start: "Start",
      reset: "Reset",
      select_tea: "Select Tea Type:",
      black: "Black Tea",
      green: "Green Tea",
      white: "White Tea",
      oolong: "Oolong Tea",
      herbal: "Herbal Tea",
      rooibos: "Rooibos",
      water_temp: "Water temperature"
    },
    fi: {
      title: "Teekello",
      start: "Aloita",
      reset: "Nollaa",
      select_tea: "Valitse teelaatu:",
      black: "Musta tee",
      green: "Vihreä tee",
      white: "Valkoinen tee",
      oolong: "Oolong-tee",
      herbal: "Yrttitee",
      rooibos: "Rooibos",
      water_temp: "Veden lämpötila"
    }
  };

  const teaData = {
    black: { time: 180, temp: "95-100°C" },
    green: { time: 150, temp: "70-80°C" },
    white: { time: 210, temp: "80-85°C" },
    oolong: { time: 180, temp: "85-90°C" },
    herbal: { time: 300, temp: "95-100°C" },
    rooibos: { time: 300, temp: "95-100°C" },
    testi: { time: 5, temp: "95-100°C" }
  };

  // Timer variables
  let countdown;
  let timeLeft;
  let totalSeconds;
  let isRunning = false;

  // Timer functions
  function updateTeaInfo(tea) {
    const lang = languageSelect.value;
    const name = translations[lang][teaTypeSelect.value];
    const descMap = {
      en: {
        black: "Brewing time: 3-5 minutes",
        green: "Brewing time: 2-3 minutes",
        white: "Brewing time: 3.5-5 minutes",
        oolong: "Brewing time: 3-5 minutes",
        herbal: "Brewing time: 5-7 minutes",
        rooibos: "Brewing time: 5-7 minutes"
      },
      fi: {
        black: "Haudutusaika: 3-5 minuuttia",
        green: "Haudutusaika: 2-3 minuuttia",
        white: "Haudutusaika: 3.5-5 minuuttia",
        oolong: "Haudutusaika: 3-5 minuuttia",
        herbal: "Haudutusaika: 5-7 minuuttia",
        rooibos: "Haudutusaika: 5-7 minuuttia"
      }
    };

    teaInfo.innerHTML = `
      <h3><i class="fas fa-info-circle"></i> ${name} Info</h3>
      <p><i class="fas fa-clock"></i> ${descMap[lang][teaTypeSelect.value]}</p>
      <p><i class="fas fa-temperature-high"></i> ${translations[lang].water_temp}: ${tea.temp}</p>
    `;

    timeLeft = tea.time;
    totalSeconds = tea.time;
    displayTimeLeft();
    updateProgressCircle();
  }

  function displayTimeLeft() {
    const showTime = Math.max(0, timeLeft); // Never show negative values
    const minutes = Math.floor(showTime / 60);
    const seconds = showTime % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  function updateProgressCircle() {
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (timeLeft / totalSeconds) * circumference;
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = offset;
  }

  function startTimer() {
    // Don't start if already running or time is up
    if (isRunning || timeLeft <= 0) return;
    
    isRunning = true;
    const lang = languageSelect.value;
    startBtn.innerHTML = `<i class="fas fa-pause"></i> ${translations[lang].start}`;
    
    // Clear any existing timer first
    clearInterval(countdown);
    
    countdown = setInterval(() => {
      // Check if time is up before decrementing
      if (timeLeft <= 0) {
        timerComplete();
        return;
      }
      
      timeLeft--;
      displayTimeLeft();
      updateProgressCircle();
    }, 1000);
  }

  function timerComplete() {
    clearInterval(countdown);
    isRunning = false;
    timeLeft = 0; // Ensure timer shows exactly 00:00
    displayTimeLeft();
    
    const lang = languageSelect.value;
    startBtn.innerHTML = `<i class="fas fa-play"></i> ${translations[lang].start}`;
    
    try {
      timerSound.play();
    } catch (error) {
      console.warn("Audio playback error:", error);
    }
    
    timerDisplay.classList.add('pulse');
    setTimeout(() => timerDisplay.classList.remove('pulse'), 5000);
  }

  function pauseTimer() {
    clearInterval(countdown);
    isRunning = false;
    const lang = languageSelect.value;
    startBtn.innerHTML = `<i class="fas fa-play"></i> ${translations[lang].start}`;
  }

  function resetTimer() {
    pauseTimer();
    const selectedTea = teaData[teaTypeSelect.value];
    timeLeft = selectedTea.time;
    totalSeconds = selectedTea.time;
    displayTimeLeft();
    updateProgressCircle();
    timerSound.pause();
    timerSound.currentTime = 0;
    timerDisplay.classList.remove('pulse');
  }

  // Translation functions
  function applyTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang][key]) {
        if (el.querySelector('i')) {
          const icon = el.querySelector('i').outerHTML;
          el.innerHTML = `${icon} ${translations[lang][key]}`;
        } else {
          el.textContent = translations[lang][key];
        }
      }
    });

    document.querySelectorAll('[data-i18n-option]').forEach(option => {
      const key = option.getAttribute('data-i18n-option');
      if (translations[lang][key]) {
        option.textContent = translations[lang][key];
      }
    });

    updateTeaInfo(teaData[teaTypeSelect.value]);
  }

  // Event listeners
  teaTypeSelect.addEventListener('change', function() {
    const selectedTea = teaData[this.value];
    totalSeconds = selectedTea.time;
    updateTeaInfo(selectedTea);
    resetTimer();
  });

  startBtn.addEventListener('click', function() {
    if (isRunning) {
      pauseTimer();
    } else if (timeLeft > 0) { // Only start if time remains
      startTimer();
    }
  });

  resetBtn.addEventListener('click', resetTimer);

  languageSelect.addEventListener('change', function() {
    applyTranslations(this.value);
  });

  // Initialization
  languageSelect.value = 'en';
  applyTranslations('en');
  updateTeaInfo(teaData.black);
});