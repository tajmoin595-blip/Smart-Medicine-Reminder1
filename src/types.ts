export type MedicineType = 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Drops';

export type FoodRequirement = 'Before Food' | 'After Food' | 'With Food' | 'No Preference';

export type DoseStatus = 'Taken' | 'Skipped' | 'Missed' | 'Pending';

export interface MedicineItem {
  id: string;
  name: string;
  purpose: string;
  dosage: string; // e.g. "500 mg", "1 tablet", "5 ml"
  timesOfDay: ('Morning' | 'Afternoon' | 'Evening' | 'Night')[];
  specificTime: string; // e.g. "08:00"
  foodRequirement: FoodRequirement;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  color: string; // Tailwind hex or class name
  type: MedicineType;
  notes?: string;
  photoUrl?: string;
  isEmergency?: boolean; // Critical medicine flag
  createdAt: string;
}

export interface DoseLog {
  id: string;
  medicineId: string;
  medicineName: string;
  scheduledTime: string; // e.g. "2026-07-26 08:00"
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: DoseStatus;
  actionTime?: string; // actual timestamp when marked
  type: MedicineType;
  color: string;
  notes?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string; // e.g. "Daughter", "Son", "Doctor", "Caregiver"
  phone: string;
  email: string;
  notifyOnMissed: boolean;
  notifyOnEmergencySkipped: boolean;
  lastNotifiedAt?: string;
}

export interface CaregiverAlert {
  id: string;
  memberId: string;
  memberName: string;
  medicineName: string;
  alertType: 'Missed Dose' | '3 Reminders Ignored' | 'Emergency Medicine Skipped' | 'SOS Alert';
  timestamp: string;
  status: 'Sent' | 'Delivered' | 'Read';
}

export interface AppSettings {
  darkMode: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  language: string;
  notificationSound: boolean;
  soundVolume: number; // 0 to 100
  reminderInterval: number; // minutes (e.g., 15 or 30)
  voiceReminders: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'Patient' | 'Caregiver' | 'Family Member';
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}
