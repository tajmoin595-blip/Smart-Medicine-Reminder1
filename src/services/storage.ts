import {
  MedicineItem,
  DoseLog,
  FamilyMember,
  CaregiverAlert,
  AppSettings,
  UserProfile,
  DoseStatus,
} from '../types';

const MEDICINES_KEY = 'medicare_medicines_v2';
const DOSE_LOGS_KEY = 'medicare_dose_logs_v2';
const FAMILY_MEMBERS_KEY = 'medicare_family_members_v2';
const CAREGIVER_ALERTS_KEY = 'medicare_alerts_v2';
const SETTINGS_KEY = 'medicare_settings_v2';
const USER_KEY = 'medicare_user_v2';

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_MEDICINES: MedicineItem[] = [
  {
    id: 'med-1',
    name: 'Paracetamol',
    purpose: 'Pain & mild fever relief',
    dosage: '500 mg (1 tablet)',
    timesOfDay: ['Morning'],
    specificTime: '08:00',
    foodRequirement: 'After Food',
    startDate: '2026-07-01',
    color: '#3b82f6', // Blue
    type: 'Tablet',
    notes: 'Take with a glass of water after breakfast.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med-2',
    name: 'Metformin',
    purpose: 'Blood sugar control (Diabetes)',
    dosage: '500 mg (1 tablet)',
    timesOfDay: ['Morning', 'Evening'],
    specificTime: '13:00',
    foodRequirement: 'With Food',
    startDate: '2026-07-01',
    color: '#10b981', // Green
    type: 'Tablet',
    notes: 'Reduces liver sugar output. Take during meals.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med-3',
    name: 'BP Tablet (Amlodipine)',
    purpose: 'Blood pressure control',
    dosage: '5 mg (1 capsule)',
    timesOfDay: ['Night'],
    specificTime: '20:00',
    foodRequirement: 'After Food',
    startDate: '2026-07-01',
    color: '#ef4444', // Red
    type: 'Capsule',
    isEmergency: true,
    notes: 'Critical daily BP dose. Do not skip.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med-4',
    name: 'Vitamin D3 Drops',
    purpose: 'Bone strength & immunity booster',
    dosage: '1000 IU (2 drops)',
    timesOfDay: ['Afternoon'],
    specificTime: '13:00',
    foodRequirement: 'After Food',
    startDate: '2026-07-01',
    color: '#f59e0b', // Amber
    type: 'Drops',
    notes: 'Take after lunch.',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'fam-1',
    name: 'Sarah Jenkins',
    relationship: 'Daughter',
    phone: '+1 (555) 234-5678',
    email: 'sarah.jenkins@example.com',
    notifyOnMissed: true,
    notifyOnEmergencySkipped: true,
  },
  {
    id: 'fam-2',
    name: 'Dr. Robert Miller',
    relationship: 'Primary Care Doctor',
    phone: '+1 (555) 987-6543',
    email: 'dr.miller@clinic.org',
    notifyOnMissed: false,
    notifyOnEmergencySkipped: true,
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  fontSize: 'normal',
  language: 'English',
  notificationSound: true,
  soundVolume: 80,
  reminderInterval: 15,
  voiceReminders: true,
};

const DEFAULT_USER: UserProfile = {
  id: 'usr-demo',
  name: 'Eleanor Vance',
  email: 'eleanor.vance@medicare.ai',
  role: 'Patient',
  phone: '+1 (555) 123-4567',
  emergencyContactName: 'Sarah Jenkins (Daughter)',
  emergencyContactPhone: '+1 (555) 234-5678',
};

export class StorageService {
  // Medicines
  static getMedicines(): MedicineItem[] {
    const raw = localStorage.getItem(MEDICINES_KEY);
    if (!raw) {
      localStorage.setItem(MEDICINES_KEY, JSON.stringify(DEFAULT_MEDICINES));
      return DEFAULT_MEDICINES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_MEDICINES;
    }
  }

  static saveMedicines(items: MedicineItem[]) {
    localStorage.setItem(MEDICINES_KEY, JSON.stringify(items));
  }

  static addMedicine(med: Omit<MedicineItem, 'id' | 'createdAt'>): MedicineItem {
    const medicines = this.getMedicines();
    const newMed: MedicineItem = {
      ...med,
      id: 'med-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    medicines.push(newMed);
    this.saveMedicines(medicines);
    return newMed;
  }

  static updateMedicine(updated: MedicineItem) {
    const medicines = this.getMedicines().map((m) => (m.id === updated.id ? updated : m));
    this.saveMedicines(medicines);
  }

  static deleteMedicine(id: string) {
    const medicines = this.getMedicines().filter((m) => m.id !== id);
    this.saveMedicines(medicines);
  }

  // Dose Logs
  static getDoseLogs(): DoseLog[] {
    const raw = localStorage.getItem(DOSE_LOGS_KEY);
    if (!raw) {
      // Seed today's logs for instant demo completeness!
      const today = getTodayString();
      const initialLogs: DoseLog[] = [
        {
          id: 'log-1',
          medicineId: 'med-1',
          medicineName: 'Paracetamol',
          scheduledTime: '08:00 AM',
          date: today,
          time: '08:00',
          status: 'Taken',
          actionTime: `${today} 08:05`,
          type: 'Tablet',
          color: '#3b82f6',
        },
        {
          id: 'log-2',
          medicineId: 'med-4',
          medicineName: 'Vitamin D3 Drops',
          scheduledTime: '01:00 PM',
          date: today,
          time: '13:00',
          status: 'Taken',
          actionTime: `${today} 13:10`,
          type: 'Drops',
          color: '#f59e0b',
        },
        {
          id: 'log-3',
          medicineId: 'med-3',
          medicineName: 'BP Tablet (Amlodipine)',
          scheduledTime: '08:00 PM',
          date: today,
          time: '20:00',
          status: 'Pending',
          type: 'Capsule',
          color: '#ef4444',
        },
      ];
      localStorage.setItem(DOSE_LOGS_KEY, JSON.stringify(initialLogs));
      return initialLogs;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveDoseLogs(logs: DoseLog[]) {
    localStorage.setItem(DOSE_LOGS_KEY, JSON.stringify(logs));
  }

  static recordDoseStatus(
    medicineId: string,
    medicineName: string,
    status: DoseStatus,
    timeScheduled: string,
    type: any,
    color: string,
    notes?: string
  ): DoseLog {
    const logs = this.getDoseLogs();
    const today = getTodayString();

    // Check if log exists for this med today & time
    const existingIndex = logs.findIndex(
      (l) => l.medicineId === medicineId && l.date === today && l.time === timeScheduled
    );

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newLog: DoseLog = {
      id: existingIndex >= 0 ? logs[existingIndex].id : 'log-' + Date.now(),
      medicineId,
      medicineName,
      scheduledTime: timeScheduled,
      date: today,
      time: timeScheduled,
      status,
      actionTime: `${today} ${timeStr}`,
      type,
      color,
      notes,
    };

    if (existingIndex >= 0) {
      logs[existingIndex] = newLog;
    } else {
      logs.unshift(newLog);
    }

    this.saveDoseLogs(logs);

    // If missed or skipped emergency medicine, trigger Caregiver alert!
    if (status === 'Missed' || status === 'Skipped') {
      const med = this.getMedicines().find((m) => m.id === medicineId);
      if (med?.isEmergency || status === 'Missed') {
        this.triggerCaregiverAlert(medicineName, status === 'Missed' ? 'Missed Dose' : 'Emergency Medicine Skipped');
      }
    }

    return newLog;
  }

  // Family Members
  static getFamilyMembers(): FamilyMember[] {
    const raw = localStorage.getItem(FAMILY_MEMBERS_KEY);
    if (!raw) {
      localStorage.setItem(FAMILY_MEMBERS_KEY, JSON.stringify(DEFAULT_FAMILY_MEMBERS));
      return DEFAULT_FAMILY_MEMBERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_FAMILY_MEMBERS;
    }
  }

  static saveFamilyMembers(members: FamilyMember[]) {
    localStorage.setItem(FAMILY_MEMBERS_KEY, JSON.stringify(members));
  }

  static addFamilyMember(member: Omit<FamilyMember, 'id'>): FamilyMember {
    const members = this.getFamilyMembers();
    const newMember: FamilyMember = {
      ...member,
      id: 'fam-' + Date.now(),
    };
    members.push(newMember);
    this.saveFamilyMembers(members);
    return newMember;
  }

  static deleteFamilyMember(id: string) {
    const members = this.getFamilyMembers().filter((m) => m.id !== id);
    this.saveFamilyMembers(members);
  }

  // Caregiver Alerts
  static getCaregiverAlerts(): CaregiverAlert[] {
    const raw = localStorage.getItem(CAREGIVER_ALERTS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static triggerCaregiverAlert(
    medicineName: string,
    alertType: CaregiverAlert['alertType']
  ) {
    const family = this.getFamilyMembers();
    const alerts = this.getCaregiverAlerts();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    family.forEach((m) => {
      alerts.unshift({
        id: 'alt-' + Math.random().toString(36).substring(2, 9),
        memberId: m.id,
        memberName: `${m.name} (${m.relationship})`,
        medicineName,
        alertType,
        timestamp: `${getTodayString()} ${nowStr}`,
        status: 'Delivered',
      });
    });

    localStorage.setItem(CAREGIVER_ALERTS_KEY, JSON.stringify(alerts.slice(0, 50)));
  }

  // Settings
  static getSettings(): AppSettings {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: AppSettings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  // User Profile
  static getUser(): UserProfile {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      localStorage.setItem(USER_KEY, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_USER;
    }
  }

  static saveUser(user: UserProfile) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}
