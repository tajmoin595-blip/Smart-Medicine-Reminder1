export type MedicineType = 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Drops' | 'Cream';

export type FoodTiming = 'Before Food' | 'After Food' | 'With Food' | 'Any Time';

export type TimeSlot = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export type FrequencyType = 'Every Day' | 'Alternate Days' | 'Weekly' | 'Monthly';

export interface TimeSchedule {
  slot: TimeSlot;
  time: string; // e.g. "08:00"
  enabled: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  brandName?: string;
  disease?: string;
  dosage: string; // e.g., "500 mg" or "10 ml"
  type: MedicineType;
  color?: string; // e.g. "#3b82f6" or "blue"
  description?: string;
  purpose: string;
  times: TimeSchedule[]; // Morning, Afternoon, Evening, Night
  customTime?: string;
  foodTiming: FoodTiming;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  frequency: FrequencyType;
  photoUrl?: string;
  doctorName?: string;
  hospital?: string;
  prescriptionNumber?: string;
  notes?: string;
  remainingPills?: number;
  totalPills?: number;
  refillReminder?: boolean;
}

export type DoseStatus = 'Taken' | 'Missed' | 'Skipped' | 'Snoozed';

export interface MedicineHistoryItem {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  type: MedicineType;
  scheduledTime: string; // e.g., "08:00 AM"
  actionTime?: string; // ISO string when action taken
  status: DoseStatus;
  date: string; // YYYY-MM-DD
  slot: TimeSlot;
  notes?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: 'Father' | 'Mother' | 'Son' | 'Daughter' | 'Brother' | 'Sister' | 'Friend' | 'Doctor' | 'Other';
  notifyOnMissed: boolean;
  notifyOnEmergency: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'missed' | 'family_alert' | 'ai' | 'system';
  timestamp: string;
  read: boolean;
  medicineId?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  phoneNumber: string;
  emergencyContact: string;
  bloodGroup: string;
  weight: string; // e.g. "68 kg"
  height: string; // e.g. "172 cm"
  medicalConditions: string[];
  allergies: string[];
  photoUrl?: string;
}

export interface AppSettings {
  darkMode: boolean;
  language: string;
  reminderSound: string;
  reminderVolume: number; // 0 to 100
  browserNotificationsEnabled: boolean;
  familyAlertThreshold: number; // e.g. 3 missed doses
  snoozeDurationMinutes: number; // e.g. 10
}

export interface AIExplanationResult {
  medicineName: string;
  summary: string;
  howItWorks: string;
  foodInstructions: string;
  commonSideEffects: string[];
  safetyDisclaimer: string;
}

export interface AIConflictReport {
  hasConflict: boolean;
  severity: 'low' | 'medium' | 'high' | 'none';
  findings: string[];
  recommendations: string[];
  disclaimer: string;
}

export interface AIDailySummary {
  completionRate: number;
  takenCount: number;
  missedCount: number;
  skippedCount: number;
  summaryTitle: string;
  insights: string[];
  motivationalMessage: string;
}

export interface AIMissedDoseAdvice {
  medicineName: string;
  importanceExplanation: string;
  recommendedActions: string[];
  disclaimer: string;
}
