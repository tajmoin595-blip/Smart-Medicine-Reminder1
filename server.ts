import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_PROMPT = `You are MediCare AI Assistant.
Your role is to help users understand their medicines in simple, friendly language suitable for elderly patients and caregivers.

Rules:
1. Never diagnose diseases.
2. Never prescribe medicines.
3. Never change dosages.
4. Never tell users to stop medications.
5. If there may be interactions or schedule conflicts, clearly explain that only a doctor or pharmacist can provide medical advice.
6. Use very simple, warm English.
7. Be encouraging and supportive.
8. Explain medicines in 3–6 short sentences.
9. If information is uncertain, clearly say you are not sure.
10. Always prioritize user safety.`;

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Endpoint 1: Medicine Explanation
app.post('/api/ai/explain', async (req, res) => {
  try {
    const { medicineName, purpose, dosage, notes } = req.body;
    if (!medicineName) {
      return res.status(400).json({ error: 'Medicine name is required.' });
    }

    const ai = getGeminiClient();
    const prompt = `Explain the medicine "${medicineName}" in simple terms for an elderly user or patient.
Medicine details provided:
- Purpose: ${purpose || 'Not specified'}
- Dosage: ${dosage || 'Not specified'}
- Notes: ${notes || 'None'}

Provide:
1. What this medicine is commonly used for.
2. How it is typically taken (e.g., with water, with food).
3. A friendly safety tip (e.g. keep at room temp, take at same time daily).
Keep total response length within 3-6 short simple sentences.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    const text = response.text || 'Unable to generate explanation at this time. Please consult your pharmacist.';
    res.json({ result: text });
  } catch (err: any) {
    console.error('Error in /api/ai/explain:', err);
    res.status(500).json({ error: err.message || 'Failed to generate explanation' });
  }
});

// AI Endpoint 2: Schedule Conflict Checker
app.post('/api/ai/conflict-check', async (req, res) => {
  try {
    const { medicines } = req.body;
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ error: 'List of medicines is required.' });
    }

    const ai = getGeminiClient();
    const medListFormatted = medicines.map((m: any, index: number) => 
      `${index + 1}. Name: ${m.name}, Purpose: ${m.purpose || 'N/A'}, TimeOfDay: ${m.timesOfDay?.join(', ') || m.specificTime || 'N/A'}, FoodRequirement: ${m.foodRequirement || 'N/A'}, Type: ${m.type || 'Tablet'}`
    ).join('\n');

    const prompt = `Review the following active medicine schedule for possible timing conflicts, food requirement overlap, or duplicate medicines:

Medicines List:
${medListFormatted}

Evaluate:
1. Are any medicines scheduled too close together?
2. Are there conflicting food instructions (e.g., one requires empty stomach, another requires food at same time)?
3. Are there duplicate medicine types or closely related names?
4. Suggest safer, easier spacing or scheduling (e.g., take Medicine A with breakfast and Medicine B after lunch).

Include the statement: "Please consult your doctor or pharmacist before making any changes to your medication schedule."`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.6,
      },
    });

    res.json({ result: response.text });
  } catch (err: any) {
    console.error('Error in /api/ai/conflict-check:', err);
    res.status(500).json({ error: err.message || 'Failed to check conflicts' });
  }
});

// AI Endpoint 3: Daily Summary / Encouragement Report
app.post('/api/ai/daily-summary', async (req, res) => {
  try {
    const { takenCount, missedCount, totalCount, medicines } = req.body;

    const ai = getGeminiClient();
    const adherencePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

    const prompt = `Generate a warm, encouraging daily medication summary report for today:
- Taken Today: ${takenCount} of ${totalCount} doses
- Missed Doses: ${missedCount}
- Adherence Rate: ${adherencePercent}%
- Medicine List: ${medicines ? medicines.map((m: any) => m.name).join(', ') : 'None'}

Provide:
1. Today's Adherence Assessment in 1-2 friendly sentences.
2. A positive, supportive encouragement message.
3. A gentle tip for tomorrow's adherence if any dose was missed.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    res.json({
      adherencePercent,
      report: response.text,
    });
  } catch (err: any) {
    console.error('Error in /api/ai/daily-summary:', err);
    res.status(500).json({ error: err.message || 'Failed to generate daily summary' });
  }
});

// AI Endpoint 4: Label Scanner / OCR Parse (Bonus feature)
app.post('/api/ai/scan-label', async (req, res) => {
  try {
    const { imageBase64, sampleText } = req.body;
    const ai = getGeminiClient();

    let parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      });
      parts.push({
        text: 'Extract medicine information from this label image: Medicine Name, Purpose, Dosage, Frequency (Morning/Afternoon/Evening), Food instructions (Before/After Food). Return in JSON format with keys: name, purpose, dosage, morning, afternoon, evening, foodRequirement.',
      });
    } else {
      parts.push({
        text: `Extract medicine details from text label: "${sampleText}". Return JSON with keys: name, purpose, dosage, morning, afternoon, evening, foodRequirement.`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts },
      config: {
        systemInstruction: 'You extract medicine box label information accurately into simple JSON.',
        responseMimeType: 'application/json',
      },
    });

    res.json({ result: JSON.parse(response.text || '{}') });
  } catch (err: any) {
    console.error('Error in /api/ai/scan-label:', err);
    res.status(500).json({ error: err.message || 'Failed to scan label' });
  }
});

// Vite Middleware for Dev, Static serving for Production
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
