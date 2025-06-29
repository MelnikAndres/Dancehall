const API_URL = 'https://script.google.com/macros/s/AKfycbykojLh3xcGemrU3mafTxgJHrDjUnJDx-b9W-wgclFTCi6qL9MDsk8kuK2CZZ-pFVUfLg/exec';

const storageKey = 'danceStepsProgress';
let allSteps = [];
let filteredSteps = [];
let currentModalStepIndex = -1;

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
    html += `<span class="capitalize-me"><strong >${step.nombre}</strong></span>`;

    html += "<div>"
    if (step.video) {
        html += `<a class="video-link" href="${step.video}" target="_blank">Clase ▶︎</a>`;
    }
    if (step.grabado) {
        const indexInFiltered = filteredSteps.findIndex(s => s.nombre === step.nombre);
        html += ` <a href="#" class="video-link" class="video-button" onclick="event.preventDefault();showVideoVariations('${step.nombre}', ${indexInFiltered})">Nosotros 🎥</a>`;
    }
    html += `</div>`;
    // Mostrar etiqueta mini SOLO si es modo aleatorio y fue marcado como "no lo sé"
    if (status === 'dontknow') {
        html += `<span class="random-status-tag">❓ Antes no lo sabias!</span>`;
    }

    html += `<div>`;
    if (step.escuela) html += escuelaTag(step.escuela);
    if (step.creador) html += `<span class="tag">Creador: ${step.creador}</span>`;
    if (step.instructional) html += `<span class="tag">${step.instructional}</span>`;
    html += `</div>`;

    html += `</div>`; // .info
    return html;
}

function escuelaTag(escuela) {
    return `<span class="tag ${escuela.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        }">${escuela}</span>`;
}





function updateFilters(data) {
    const escuelas = new Set();
    const creadores = new Set();
    const instructional = new Set();

    data.forEach(step => {
        if (step.escuela) escuelas.add(step.escuela);
        if (step.creador) creadores.add(step.creador);
        if (step.instructional) instructional.add(step.instructional);
    });

    const escuelaSelect = document.getElementById('filter-escuela');
    const creadorSelect = document.getElementById('filter-creador');
    const instructionalSelect = document.getElementById('filter-instructional');

    escuelaSelect.innerHTML = '<option value="">Elegir</option>';
    creadorSelect.innerHTML = '<option value="">Elegir</option>';
    instructionalSelect.innerHTML = '<option value="">Elegir</option>';

    [...escuelas].sort().forEach(value => {
        escuelaSelect.innerHTML += `<option value="${value}">${value}</option>`;
    });

    [...creadores].sort().forEach(value => {
        creadorSelect.innerHTML += `<option value="${value}">${value}</option>`;
    });

    [...instructional].sort().forEach(value => {
        instructionalSelect.innerHTML += `<option value="${value}">${value}</option>`;
    });
}

function filterStep(step) {
    const escuela = document.getElementById('filter-escuela').value;
    const creador = document.getElementById('filter-creador').value;
    const instructional = document.getElementById('filter-instructional').value;
    const search = document.getElementById('search-step').value.trim().toLowerCase();


    if (escuela && step.escuela !== escuela) return false;
    if (creador && step.creador !== creador) return false;
    if (instructional && step.instructional !== instructional) return false;
    if (search && !step.nombre.toLowerCase().includes(search)) return false;

    return true;
}

function updateUI(data) {
    const progress = getProgress();
    const unseenContainer = document.getElementById('unseen-list');
    const knownContainer = document.getElementById('known-list');
    const dontknowContainer = document.getElementById('dontknow-list');

    if (isFilterActive()) {
        document.getElementById('filtros-danger').style.display = 'block';
    } else {
        document.getElementById('filtros-danger').style.display = 'none';
    }

    unseenContainer.innerHTML = '';
    knownContainer.innerHTML = '';
    dontknowContainer.innerHTML = '';
    let knownCount = 0;
    let dontknowCount = 0;
    let unseenCount = 0;
    filteredSteps = data.filter(filterStep);
    filteredSteps.forEach(step => {
        const key = step.nombre;
        const status = progress[key];
        const div = document.createElement('div');
        div.className = 'step';
        div.innerHTML = createStepHTML(step); // sin pasar el status

        if (!status) {
            const actions = document.createElement('div');
            actions.className = 'actions';

            const btnKnow = document.createElement('button');
            btnKnow.textContent = '✔︎';
            btnKnow.className = 'btn btn-green';
            btnKnow.onclick = () => {
                progress[key] = 'know';
                saveProgress(progress);
                updateUI(data);
                showReaction('happy');
            };

            const btnDontKnow = document.createElement('button');
            btnDontKnow.textContent = "✖︎";
            btnDontKnow.className = 'btn btn-red';
            btnDontKnow.onclick = () => {
                progress[key] = 'dontknow';
                saveProgress(progress);
                updateUI(data);
                showReaction('sad');
            };

            actions.appendChild(btnKnow);
            actions.appendChild(btnDontKnow);
            div.appendChild(actions);
            unseenContainer.appendChild(div);
            unseenCount++;
        } else if (status === 'know') {
            const actions = document.createElement('div');
            actions.className = 'actions';
            const resetBtn = document.createElement('button');
            resetBtn.textContent = '🔄';
            resetBtn.title = 'Reiniciar este paso';
            resetBtn.className = 'btn btn-secondary';

            resetBtn.onclick = () => {
                delete progress[key];
                saveProgress(progress);
                updateUI(data);
            };
            actions.appendChild(resetBtn);
            div.appendChild(actions);
            knownContainer.appendChild(div);
            knownCount++;
        } else if (status === 'dontknow') {
            const actions = document.createElement('div');
            actions.className = 'actions';
            const resetBtn = document.createElement('button');
            resetBtn.textContent = '🔄';
            resetBtn.title = 'Reiniciar este paso';
            resetBtn.className = 'btn btn-secondary';

            resetBtn.onclick = () => {
                delete progress[key];
                saveProgress(progress);
                updateUI(data);
            };
            actions.appendChild(resetBtn);
            div.appendChild(actions);
            dontknowContainer.appendChild(div);
            dontknowCount++;
        }
    });
    document.getElementById('known-count').textContent = knownCount;
    document.getElementById('dontKnown-count').textContent = dontknowCount;
    document.getElementById('unseen-count').textContent = unseenCount;
}


function getRandomStep() {
    const progress = getProgress();
    let available = allSteps.filter(step => {
        const status = progress[step.nombre];
        return (!status) && filterStep(step);
    });
    if (available.length === 0) {
        available = allSteps.filter(step => {
            const status = progress[step.nombre];
            return (status !== 'know') && filterStep(step);
        });
    }
    if (available.length === 0) {
        return null; // No hay pasos disponibles
    }
    return available[Math.floor(Math.random() * available.length)];
}


function showRandomStep(step) {
    const randomBox = document.getElementById('random-step');
    const progress = getProgress();

    if (!step) {
        randomBox.style.display = 'flex';
        randomBox.innerHTML = '🎉 ¡Ya sabes todos los pasos!';
        return;
    }

    const status = progress[step.nombre]; // puede ser "dontknow"
    randomBox.style.display = 'flex';
    randomBox.innerHTML = createStepHTML(step, status);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const btnKnow = document.createElement('button');
    btnKnow.textContent = '✔︎';
    btnKnow.className = 'btn btn-green';
    btnKnow.onclick = () => {
        progress[step.nombre] = 'know';
        saveProgress(progress);
        updateUI(allSteps);
        showRandomStep(getRandomStep());
        showReaction('happy');
    };

    const btnDontKnow = document.createElement('button');
    btnDontKnow.textContent = "✖︎";
    btnDontKnow.className = 'btn btn-red';
    btnDontKnow.onclick = () => {
        progress[step.nombre] = 'dontknow';
        saveProgress(progress);
        updateUI(allSteps);
        showRandomStep(getRandomStep());
        showReaction('sad')
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
        let data = await response.json();
        // Filtrar pasos de nueva escuela, no nos importan

        if (!Array.isArray(data)) {
            throw new Error('Datos no válidos recibidos del servidor');
        }
        // Filtrar pasos de nueva escuela, no nos importan
        data = data.filter(step => !step.escuela || (step.escuela && step.escuela.toLowerCase() !== 'nueva escuela'));


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

document.getElementById('search-step').addEventListener('input', () => updateUI(allSteps));


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


function toggleSection(id, titleEl) {
    const section = document.getElementById(id);
    const isVisible = section.style.display === 'block';
    section.style.display = isVisible ? 'none' : 'block';

    const icon = titleEl.querySelector('.toggle-icon');
    icon.textContent = isVisible ? '➕' : '➖';
}


function showReaction(reaction) {
    const container = document.getElementById("reaction-container");

    const emoji = document.createElement("div");
    emoji.classList.add("reaction");
    emoji.innerHTML = '<img class="meme" src="/dancehall/' + reaction + '.jpg" alt="' + reaction + '" />';
    emoji.style.right = Math.random() * 150 + "px";

    container.appendChild(emoji);

    setTimeout(() => {
        emoji.remove();
    }, 1000); // match animation duration
}
lucide.createIcons();


function isFilterActive() {
    const escuela = document.getElementById('filter-escuela').value;
    const creador = document.getElementById('filter-creador').value;
    const instructional = document.getElementById('filter-instructional').value;
    const search = document.getElementById('search-step').value.trim().toLowerCase();

    return escuela || creador || instructional || search;
}

function showVideoVariations(stepName, indexInFilteredSteps = null) {
    const base = stepName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '');
    const modal = document.createElement('div');
    modal.className = 'video-modal';

    modal.innerHTML = `
        <div class="video-backdrop" onclick="this.parentElement.remove()"></div>
        <div class="video-content">
            <select id="video-selector" class="btn btn-secondary"></select>
            <h2 id="video-step-title" class="step-title">${stepName}</h2>
            <div class="video-controls">
                <button id="previous-step" class="arrow-btn btn-secondary"><</button>
                <video id="video-player" controls autoplay loop></video>
                <button id="next-step" class="arrow-btn btn-secondary">></button>
            </div>
            <button class="btn btn-secondary close-btn" onclick="this.closest('.video-modal').remove()">Cerrar</button>
        </div>
    `;

    document.body.appendChild(modal);

    const selector = modal.querySelector('#video-selector');
    const player = modal.querySelector('#video-player');

    const sources = [
        { label: 'Original', url: `/dancehall/pasos/${base}.mp4` },
        ...Array.from({ length: 5 }, (_, i) => ({
            label: `Variante ${i + 1}`,
            url: `/dancehall/pasos/${base}-var-${i + 1}.mp4`
        }))
    ];

    let foundOne = false;

    sources.forEach(source => {
        const option = document.createElement('option');
        option.value = source.url;
        option.textContent = source.label;

        fetch(source.url, { method: 'HEAD' }).then(res => {
            if (res.ok) {
                selector.appendChild(option);
                if (!foundOne) {
                    player.src = source.url;
                    foundOne = true;
                }
            }
        }).catch(err => {
            console.error(`Error fetching ${source.url}:`, err);
        });
    });

    selector.addEventListener('change', () => {
        player.src = selector.value;
        player.play();
    });

    const nextButton = modal.querySelector('#next-step');
    if (indexInFilteredSteps === null || !filteredSteps.length || indexInFilteredSteps >= filteredSteps.length - 1) {
        nextButton.classList.add('disabled');
    } else {
        nextButton.onclick = () => {
            const nextStep = filteredSteps[indexInFilteredSteps + 1];
            modal.remove();
            showVideoVariations(nextStep.nombre, indexInFilteredSteps + 1);
        };
    }
    const previousButton = modal.querySelector('#previous-step');
    if (indexInFilteredSteps === null || indexInFilteredSteps <= 0) {
        previousButton.classList.add('disabled');
    } else {
        previousButton.onclick = () => {
            const previousStep = filteredSteps[indexInFilteredSteps - 1];
            modal.remove();
            showVideoVariations(previousStep.nombre, indexInFilteredSteps - 1);
        };
    }
}

