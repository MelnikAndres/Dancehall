function doGet(e) {
  const ss = SpreadsheetApp.openById('1sZJghVdmnqXN9wll7VEIoQpiVqNiSo-pGzvwZMj9SVA');
  let sheet = ss.getSheetByName('Pasos');
  const dataRange= sheet.getDataRange();
  const values = dataRange.getValues(); // still use for other columns
  const richTextValues = dataRange.getRichTextValues(); // for hyperlink extraction

  // Remove header row
  values.shift();
  richTextValues.shift();

  const result = values.map((row, i) => {
    const richRow = richTextValues[i];
    // assuming 'Video' is in column 4 (index 4)
    const videoCell = richRow[4]; // Adjust index if needed
    const videoUrl = videoCell.getLinkUrl();
    
    return {
      nombre: row[0],
      escuela: row[1],
      creador: row[2],
      instructional: row[3],
      video: videoUrl, // the actual hyperlink instead of just text
      grabado: row[5] ? row[5].toLowerCase() === 'si' : false, // Assuming 'Grabado' is in column 6 (index 5)
    };
  });

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

