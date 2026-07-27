import { AIExplanationResult, AIConflictReport, AIDailySummary, AIMissedDoseAdvice, Medicine } from '../types';

export async function explainMedicineAI(medicine: Partial<Medicine>): Promise<AIExplanationResult> {
  try {
    const res = await fetch('/api/ai/explain-medicine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: medicine.name,
        genericName: medicine.genericName,
        brandName: medicine.brandName,
        disease: medicine.disease,
        dosage: medicine.dosage
      })
    });
    if (!res.ok) throw new Error('Network response failed');
    return await res.json();
  } catch (err) {
    console.warn('Falling back to local explanation logic:', err);
    return {
      medicineName: medicine.name || 'Medication',
      summary: `${medicine.name || 'This medication'} is used for ${medicine.disease || 'managing health symptoms'} and promoting patient wellness.`,
      howItWorks: `It helps regulate target physiological pathways to assist in ${medicine.purpose || 'symptom management'}.`,
      foodInstructions: medicine.foodTiming ? `Best taken ${medicine.foodTiming.toLowerCase()} with a full glass of water.` : 'Take with water as directed.',
      commonSideEffects: ['Mild stomach upset', 'Mild fatigue or dizziness', 'Dry mouth'],
      safetyDisclaimer: 'For personal medical advice, please consult your doctor or pharmacist.'
    };
  }
}

export async function checkScheduleConflictsAI(medicines: Medicine[]): Promise<AIConflictReport> {
  try {
    const res = await fetch('/api/ai/check-conflicts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicines })
    });
    if (!res.ok) throw new Error('Network response failed');
    return await res.json();
  } catch (err) {
    console.warn('Falling back to local schedule conflict checker:', err);
    // Simple local overlap detection
    const morningMeds = medicines.filter(m => m.times.some(t => t.slot === 'Morning' && t.enabled));
    const isClose = morningMeds.length >= 3;

    return {
      hasConflict: isClose,
      severity: isClose ? 'medium' : 'none',
      findings: isClose
        ? [`You have ${morningMeds.length} medicines scheduled around morning time.`]
        : ['No major schedule timing overlaps detected.'],
      recommendations: isClose
        ? ['Space medications 15-30 minutes apart if stomach discomfort occurs.', 'Discuss medication spacing with your pharmacist.']
        : ['Maintain taking your medicines with food or water as instructed.'],
      disclaimer: 'For personal medical advice, please consult your doctor or pharmacist.'
    };
  }
}

export async function getDailyHealthSummaryAI(takenCount: number, missedCount: number, skippedCount: number, medicines: Medicine[]): Promise<AIDailySummary> {
  try {
    const res = await fetch('/api/ai/daily-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ takenCount, missedCount, skippedCount, medicines })
    });
    if (!res.ok) throw new Error('Network response failed');
    return await res.json();
  } catch (err) {
    const total = takenCount + missedCount + skippedCount;
    const completionRate = total > 0 ? Math.round((takenCount / total) * 100) : 100;
    return {
      completionRate,
      takenCount,
      missedCount,
      skippedCount,
      summaryTitle: completionRate === 100 ? "Excellent Work Today!" : "Steady Progress on Medication Schedule",
      insights: [
        `You completed ${takenCount} of ${total} scheduled doses today.`,
        completionRate === 100
          ? "Maintaining 100% adherence helps prevent health complications."
          : "Try setting a backup sound alarm for times when you are away from home."
      ],
      motivationalMessage: "Keep maintaining your healthy routine. Your consistency makes a big difference!"
    };
  }
}

export async function getMissedDoseAdviceAI(medicineName: string, dosage?: string, scheduledTime?: string): Promise<AIMissedDoseAdvice> {
  try {
    const res = await fetch('/api/ai/missed-dose-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicineName, dosage, scheduledTime })
    });
    if (!res.ok) throw new Error('Network response failed');
    return await res.json();
  } catch (err) {
    return {
      medicineName: medicineName || 'Medication',
      importanceExplanation: `Taking ${medicineName || 'your medication'} consistently helps keep steady therapeutic medicine levels in your body.`,
      recommendedActions: [
        'If remembered shortly after scheduled time, take it as soon as possible.',
        'If close to next scheduled dose, skip missed dose and resume normal schedule.',
        'Never take a double dose to make up for a missed dose.'
      ],
      disclaimer: 'Contact your doctor before making changes to your medication schedule.'
    };
  }
}

export async function fetchDailyHealthTipAI(): Promise<{ tip: string; category: string; author: string }> {
  try {
    const res = await fetch('/api/ai/health-tip');
    if (!res.ok) throw new Error('Network response failed');
    return await res.json();
  } catch (err) {
    return {
      tip: 'Taking morning medications with a full glass of water aids swallowability and protects stomach lining.',
      category: 'Hydration & Routine',
      author: 'MediCare AI Team'
    };
  }
}
