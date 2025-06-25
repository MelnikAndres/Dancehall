const API_URL = 'https://script.google.com/macros/s/AKfycbykojLh3xcGemrU3mafTxgJHrDjUnJDx-b9W-wgclFTCi6qL9MDsk8kuK2CZZ-pFVUfLg/exec';

const storageKey = 'danceStepsProgress';
let allSteps = [];

function getProgress() {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
}

function saveProgress(progress) {
    localStorage.setItem(storageKey, JSON.stringify(progress));
}

function resetProgress() {
    localStorage.removeItem(storageKey);
    loadSteps();
}

function createStepHTML(step, status = null) {
    let html = `<div class="info">`;
    html += `<span class="capitalize-me"><strong >${step.nombre}</strong>`;
    if (step.video) {
        html += `<a class="video-link" href="${step.video}" target="_blank">🎥 Ver video</a>`;
    }
    html += `</span>`;
    // Mostrar etiqueta mini SOLO si es modo aleatorio y fue marcado como "no lo sé"
    if (status === 'dontknow') {
        html += `<span class="random-status-tag">❓ Antes no lo sabias!</span>`;
    }

    html += `<div>`;
    if (step.escuela) html += `<span class="tag">Escuela: ${step.escuela}</span>`;
    if (step.creador) html += `<span class="tag">Creador: ${step.creador}</span>`;
    if (step.instructional) html += `<span class="tag">Instructional: ${step.instructional}</span>`;
    html += `</div>`;



    html += `</div>`; // .info
    return html;
}





function updateFilters(data) {
    const escuelas = new Set();
    const creadores = new Set();

    data.forEach(step => {
        if (step.escuela) escuelas.add(step.escuela);
        if (step.creador) creadores.add(step.creador);
    });

    const escuelaSelect = document.getElementById('filter-escuela');
    const creadorSelect = document.getElementById('filter-creador');

    escuelaSelect.innerHTML = '<option value="">Filter by Escuela</option>';
    creadorSelect.innerHTML = '<option value="">Filter by Creador</option>';

    [...escuelas].sort().forEach(value => {
        escuelaSelect.innerHTML += `<option value="${value}">${value}</option>`;
    });

    [...creadores].sort().forEach(value => {
        creadorSelect.innerHTML += `<option value="${value}">${value}</option>`;
    });
}

function filterStep(step) {
    const escuela = document.getElementById('filter-escuela').value;
    const creador = document.getElementById('filter-creador').value;
    const instructional = document.getElementById('filter-instructional').value;

    if (escuela && step.escuela !== escuela) return false;
    if (creador && step.creador !== creador) return false;
    if (instructional) {
        const hasInstructional = !!step.instructional;
        if (instructional === 'yes' && !hasInstructional) return false;
        if (instructional === 'no' && hasInstructional) return false;
    }
    return true;
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
        if (!filterStep(step)) return;

        const key = step.nombre;
        const status = progress[key];
        const div = document.createElement('div');
        div.className = 'step';
        div.innerHTML = createStepHTML(step); // sin pasar el status

        if (!status) {
            const actions = document.createElement('div');
            actions.className = 'actions';

            const btnKnow = document.createElement('button');
            btnKnow.textContent = '✅ Lo sé';
            btnKnow.className = 'btn btn-primary';
            btnKnow.onclick = () => {
                progress[key] = 'know';
                saveProgress(progress);
                updateUI(data);
            };

            const btnDontKnow = document.createElement('button');
            btnDontKnow.textContent = "❌ No lo sé";
            btnDontKnow.className = 'btn btn-secondary';
            btnDontKnow.onclick = () => {
                progress[key] = 'dontknow';
                saveProgress(progress);
                updateUI(data);
            };

            actions.appendChild(btnKnow);
            actions.appendChild(btnDontKnow);
            div.appendChild(actions);
            unseenContainer.appendChild(div);
        } else if (status === 'know') {
            knownContainer.appendChild(div);
        } else if (status === 'dontknow') {
            dontknowContainer.appendChild(div);
        }
    });
}


function getRandomStep() {
    const progress = getProgress();
    const available = allSteps.filter(step => {
        const status = progress[step.nombre];
        return (status !== 'know') && filterStep(step);
    });
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}


function showRandomStep(step) {
    const randomBox = document.getElementById('random-step');
    const progress = getProgress();

    if (!step) {
        randomBox.style.display = 'block';
        randomBox.innerHTML = '🎉 ¡Ya revisaste todos los pasos disponibles!';
        return;
    }

    const status = progress[step.nombre]; // puede ser "dontknow"
    randomBox.style.display = 'block';
    randomBox.innerHTML = createStepHTML(step, status);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const btnKnow = document.createElement('button');
    btnKnow.textContent = '✅ Ya lo sé';
    btnKnow.className = 'btn btn-primary';
    btnKnow.onclick = () => {
        progress[step.nombre] = 'know';
        saveProgress(progress);
        updateUI(allSteps);
        showRandomStep(getRandomStep());
    };

    const btnDontKnow = document.createElement('button');
    btnDontKnow.textContent = "❌ No lo sé";
    btnDontKnow.className = 'btn btn-secondary';
    btnDontKnow.onclick = () => {
        progress[step.nombre] = 'dontknow';
        saveProgress(progress);
        updateUI(allSteps);
        showRandomStep(getRandomStep());
    };

    actions.appendChild(btnKnow);
    actions.appendChild(btnDontKnow);
    randomBox.appendChild(actions);
}


async function loadSteps() {
    const loader = document.getElementById('loader');
    loader.style.display = 'block';
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        allSteps = data;
        updateFilters(data);
        updateUI(data);
    } catch (err) {
        console.error('Failed to fetch steps', err);
    } finally {
        loader.style.display = 'none';
    }
}

// Event listeners
document.getElementById('get-random').addEventListener('click', () => {
    showRandomStep(getRandomStep());
});


document.getElementById('reset-progress').addEventListener('click', () => {
    if (confirm('Reiniciar todo el progreso?')) {
        resetProgress();
        const randomBox = document.getElementById('random-step');
        randomBox.style.display = 'none';
        randomBox.innerHTML = '';
    }
});

['filter-escuela', 'filter-creador', 'filter-instructional'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => updateUI(allSteps));
});

loadSteps();


const themeKey = 'danceStepsTheme';

function applyTheme() {
    const isDark = localStorage.getItem(themeKey) === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
}

function toggleTheme() {
    const current = localStorage.getItem(themeKey);
    const newTheme = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(themeKey, newTheme);
    applyTheme();
}

document.getElementById('toggle-theme').addEventListener('click', toggleTheme);

// Apply on load
applyTheme();
