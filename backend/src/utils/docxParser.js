const mammoth = require('mammoth');

async function parseWordDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  const rawText = result.value;

  const parsedQuestions = [];

  // Dividi in blocchi separati per ogni domanda
  const rawBlocks = rawText.split(/(?=Domanda\s+\d+|^\d+\.\s+Chi\s+dice)/mi);

  for (let block of rawBlocks) {
    block = block.trim();
    if (!block) continue;

    // 1. Tipo Domanda
    const typeMatch = block.match(/(?:Domanda\s+\d+\s*—\s*)([^\r\n]+)/i);
    let typeRaw = typeMatch ? typeMatch[1].trim() : '';
    if (block.toLowerCase().includes('chi l\'ha detto') || block.toLowerCase().includes('chi dice')) {
      typeRaw = 'WHO_SAID';
    }
    const type = mapQuestionType(typeRaw);

    // 2. Livello di difficoltà
    const levelMatch = block.match(/Livello:\s*([^\r\n]+)/i);
    const levelRaw = levelMatch ? levelMatch[1].trim().toUpperCase() : 'MEDIO';
    const level = ['FACILE', 'MEDIO', 'DIFFICILE'].includes(levelRaw) ? levelRaw : 'MEDIO';

    // 3. Testo della Domanda
    const questionTextMatch = block.match(/(?:Domanda|Chi dice questa frase\?):\s*([\s\S]+?)(?=\r?\n\s*Opzioni:|\r?\n\s*Risposta|\r?\n\s*A[\)\.]|$)/i) 
      || block.match(/^\d+\.\s*(.+)/i);

    // 4. Risposta Corretta
    const answerMatch = block.match(/Risposta\s*corretta:\s*(.+)/i);

    if (questionTextMatch && answerMatch) {
      const questionText = questionTextMatch[1].replace(/\s+/g, ' ').trim();
      let correctAnswer = answerMatch[1].trim().replace(/^[A-D][\.\)]\s*/, '').trim();

      // 5. Estrazione pulita delle opzioni (senza duplicati o intestazioni)
      let options = [];
      const optionsSectionMatch = block.match(/Opzioni:\s*([\s\S]+?)(?=Risposta\s*corretta:|$)/i);

      if (optionsSectionMatch) {
        const rawOptionsText = optionsSectionMatch[1].trim();
        
        options = rawOptionsText
          .split(/(?=[A-D][\.\)])/g)
          .map(opt => opt.replace(/^[A-D][\.\)]\s*/, '').trim())
          .filter(opt => opt.length > 0 && !opt.toLowerCase().startsWith('opzioni'));
      }

      parsedQuestions.push({
        type,
        level,
        questionText,
        options,
        correctAnswer
      });
    }
  }

  return parsedQuestions;
}

function mapQuestionType(raw) {
  const str = raw.toLowerCase();
  if (str.includes('multipla')) return 'MULTIPLE_CHOICE';
  if (str.includes('aperta')) return 'SHORT_ANSWER';
  if (str.includes('vero o falso') || str.includes('boolean')) return 'BOOLEAN';
  if (str.includes('who_said') || str.includes('chi l\'ha detto') || str.includes('chi dice')) return 'WHO_SAID';
  return 'MULTIPLE_CHOICE';
}

module.exports = parseWordDocx;