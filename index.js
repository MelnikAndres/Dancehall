const API_URL = 'https://script.google.com/macros/s/AKfycbykojLh3xcGemrU3mafTxgJHrDjUnJDx-b9W-wgclFTCi6qL9MDsk8kuK2CZZ-pFVUfLg/exec';

const storageKey = 'danceStepsProgress';

function getProgress() {
  return JSON.parse(localStorage.getItem(storageKey)) || {};
}

function saveProgress(progress) {
  localStorage.setItem(storageKey, JSON.stringify(progress));
}

function updateUI(data) {
  const progress = getProgress();
  const unseenContainer = document.getElementById('unseen-list');
  const knownContainer = document.getElementById('known-list');
  const dontknowContainer = document.getElementById('dontknow-list');

  unseenContainer.innerHTML = '';
  knownContainer.innerHTML = '';
  dontknowContainer.innerHTML = '';

  data.forEach(step => {
    const key = step.nombre;
    const status = progress[key];

    const div = document.createElement('div');
    div.className = 'step';
    div.innerHTML = `
      <strong>${step.nombre}</strong><br>
      <em>${step.escuela} — ${step.creador}</em><br>
      <a href="${step.video}" target="_blank">Ver video</a><br><br>
    `;

    if (!status) {
      const btnKnow = document.createElement('button');
      btnKnow.textContent = 'I know it';
      btnKnow.onclick = () => {
        progress[key] = 'know';
        saveProgress(progress);
        updateUI(data);
      };

      const btnDontKnow = document.createElement('button');
      btnDontKnow.textContent = "I don't know it";
      btnDontKnow.onclick = () => {
        progress[key] = 'dontknow';
        saveProgress(progress);
        updateUI(data);
      };

      div.appendChild(btnKnow);
      div.appendChild(btnDontKnow);
      unseenContainer.appendChild(div);
    } else if (status === 'know') {
      knownContainer.appendChild(div);
    } else if (status === 'dontknow') {
      dontknowContainer.appendChild(div);
    }
  });
}

async function loadSteps() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    updateUI(data);
  } catch (err) {
    console.error('Failed to fetch steps', err);
  }
}

loadSteps();
