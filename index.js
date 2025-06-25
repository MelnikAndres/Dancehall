const API_URL = 'https://script.google.com/macros/s/AKfycbykojLh3xcGemrU3mafTxgJHrDjUnJDx-b9W-wgclFTCi6qL9MDsk8kuK2CZZ-pFVUfLg/exec';

document.getElementById('get-random').addEventListener('click', async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (!data || !data.length) {
      document.getElementById('result').innerText = 'No data found.';
      return;
    }

    const randomItem = data[Math.floor(Math.random() * data.length)];

    document.getElementById('result').innerHTML = `
      <strong>Nombre:</strong> ${randomItem.nombre}<br>
      <strong>Escuela:</strong> ${randomItem.escuela}<br>
      <strong>Creador:</strong> ${randomItem.creador}<br>
      <strong>Instructional:</strong> ${randomItem.instructional}<br>
      <strong>Video:</strong> <a href="${randomItem.video}" target="_blank">Ver video</a>
    `;
  } catch (err) {
    document.getElementById('result').innerText = 'Error fetching data.';
    console.error(err);
  }
});
