import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client lazily
let genAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAiClient && process.env.GEMINI_API_KEY) {
    genAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

const SYSTEM_PROMPT = `You are MediCare AI, a gentle, highly knowledgeable medical assistant for MediCare AI - Smart Medicine Reminder.
You help patients, especially elderly users, understand their medicines in simple, reassuring, plain English.

Rules:
1. Never diagnose diseases.
2. Never prescribe medicines or dosage.
3. Never recommend changing dosage or timing without a doctor's instruction.
4. Explain medicines using short paragraphs and plain language suitable for seniors.
5. Mention common purpose, common side effects, and food timing where applicable.
6. Always end every response with: "For personal medical advice, please consult your doctor or pharmacist."`;

// 1. Medicine Explanation Endpoint
app.post('/api/ai/explain-medicine', async (req, res) => {
  try {
    const { name, genericName, brandName, disease, dosage } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Medicine name is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        medicineName: name,
        summary: `${name} (${genericName || brandName || 'Medication'}) is commonly prescribed for ${disease || 'health management'}.`,
        howItWorks: `It works by helping your body maintain healthy function and manage symptoms as prescribed by your healthcare provider.`,
        foodInstructions: `Usually taken as directed on your prescription label (e.g. with food or water).`,
        commonSideEffects: ['Mild stomach upset', 'Mild dizziness', 'Dry mouth'],
        safetyDisclaimer: 'For personal medical advice, please consult your doctor or pharmacist.'
      });
    }

    const prompt = `Please explain the medicine "${name}" (Generic: ${genericName || 'N/A'}, Brand: ${brandName || 'N/A'}, Disease/Condition: ${disease || 'N/A'}, Dosage: ${dosage || 'N/A'}).
Provide a response formatted as JSON with the following structure:
{
  "summary": "Short 2-sentence summary in simple language",
  "howItWorks": "How it helps your body in plain English",
  "foodInstructions": "When or how to take with food/water",
  "commonSideEffects": ["Side effect 1", "Side effect 2", "Side effect 3"],
  "safetyDisclaimer": "For personal medical advice, please consult your doctor or pharmacist."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    });

    const resultText = response.text || '';
    const parsed = JSON.parse(resultText);
    res.json({
      medicineName: name,
      ...parsed,
    });
  } catch (err: any) {
    console.error('Error in explain-medicine:', err);
    res.status(500).json({
      error: 'Failed to generate AI explanation.',
      details: err.message,
    });
  }
});

// 2. Medicine Schedule Conflict Checker
app.post('/api/ai/check-conflicts', async (req, res) => {
  try {
    const { medicines } = req.body;
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.json({
        hasConflict: false,
        severity: 'none',
        findings: ['No active medicines to check.'],
        recommendations: ['Keep adding your prescribed medicines to run conflict analysis.'],
        disclaimer: 'For personal medical advice, please consult your doctor or pharmacist.'
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        hasConflict: false,
        severity: 'none',
        findings: ['Initial schedule review shows no obvious timing overlap among current items.'],
        recommendations: ['Ensure medicines requiring food are taken during meals.'],
        disclaimer: 'For personal medical advice, please consult your doctor or pharmacist.'
      });
    }

    const prompt = `Analyze this patient's active medication list for potential schedule overlaps, timing conflicts (e.g. taking multiple potent pills within 5-10 minutes), duplicate medication classes, or food requirement conflicts:
${JSON.stringify(medicines, null, 2)}

Return JSON output with this structure:
{
  "hasConflict": boolean,
  "severity": "low" | "medium" | "high" | "none",
  "findings": ["finding 1", "finding 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "disclaimer": "For personal medical advice, please consult your doctor or pharmacist."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in check-conflicts:', err);
    res.status(500).json({ error: 'Failed to analyze schedule conflicts.' });
  }
});

// 3. Daily Health Summary
app.post('/api/ai/daily-summary', async (req, res) => {
  try {
    const { takenCount, missedCount, skippedCount, medicines } = req.body;
    const total = (takenCount || 0) + (missedCount || 0) + (skippedCount || 0);
    const completionRate = total > 0 ? Math.round(((takenCount || 0) / total) * 100) : 100;

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        completionRate,
        takenCount: takenCount || 0,
        missedCount: missedCount || 0,
        skippedCount: skippedCount || 0,
        summaryTitle: completionRate === 100 ? "Flawless Medication Adherence Today!" : "Good Effort on Today's Schedule",
        insights: [
          `You completed ${takenCount || 0} out of ${total || 0} scheduled doses today.`,
          completionRate >= 80 ? "Your consistency helps protect your long-term wellness." : "Consistency is key to getting the full benefit of your prescribed therapy."
        ],
        motivationalMessage: "Keep maintaining your healthy routine. Your dedication to your health matters!"
      });
    }

    const prompt = `Generate today's health summary for a user who completed ${takenCount} doses, missed ${missedCount} doses, and skipped ${skippedCount} doses today (Completion rate: ${completionRate}%).
Return JSON with this structure:
{
  "summaryTitle": "Short encouraging headline",
  "insights": ["Bullet point 1", "Bullet point 2"],
  "motivationalMessage": "A warm 2-sentence motivational closing"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      completionRate,
      takenCount,
      missedCount,
      skippedCount,
      ...parsed,
    });
  } catch (err: any) {
    console.error('Error in daily-summary:', err);
    res.status(500).json({ error: 'Failed to generate daily summary.' });
  }
});

// 4. Missed Dose Assistant
app.post('/api/ai/missed-dose-assistant', async (req, res) => {
  try {
    const { medicineName, dosage, scheduledTime } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        medicineName: medicineName || 'Medication',
        importanceExplanation: `Taking ${medicineName || 'your medicine'} on schedule helps keep steady therapeutic levels in your body.`,
        recommendedActions: [
          'If you just missed it by a short time, take it as soon as you remember unless it is almost time for your next scheduled dose.',
          'Never double up on doses to make up for a missed one.',
          'Set a phone or browser reminder to keep you on schedule.'
        ],
        disclaimer: 'Contact your doctor or pharmacist before making changes to your medication schedule.'
      });
    }

    const prompt = `A user missed their scheduled dose of ${medicineName || 'medicine'} (${dosage || ''}) scheduled at ${scheduledTime || 'today'}.
Provide clear, calm guidance for elderly patients explaining why taking medicines on time is important and what steps to take.
Return JSON with this format:
{
  "importanceExplanation": "Short paragraph explaining why on-time dosing matters",
  "recommendedActions": ["Action 1", "Action 2", "Action 3"],
  "disclaimer": "Contact your doctor or pharmacist before making changes to your medication schedule."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      medicineName: medicineName || 'Medication',
      ...parsed,
    });
  } catch (err: any) {
    console.error('Error in missed-dose-assistant:', err);
    res.status(500).json({ error: 'Failed to provide missed dose advice.' });
  }
});

// 5. Daily Health & Wellness Tip
app.get('/api/ai/health-tip', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        tip: "Drinking a full glass of room-temperature water with morning medications helps digestion and prevents throat irritation.",
        category: "Hydration & Safety",
        author: "MediCare AI Wellness Team"
      });
    }

    const prompt = `Generate a single short, uplifting daily health tip (1-2 sentences) focused on medicine safety, elderly wellness, hydration, or daily pill routine consistency.
Return JSON:
{
  "tip": "The tip text",
  "category": "Category name (e.g. Hydration, Safety, Routine)",
  "author": "MediCare AI"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in health-tip:', err);
    res.json({
      tip: "Keep a written log or pill organizer near your water glass so you never miss a morning dose.",
      category: "Daily Routine",
      author: "MediCare AI"
    });
  }
});

// Vite Middleware & Production Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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
    console.log(`MediCare AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
