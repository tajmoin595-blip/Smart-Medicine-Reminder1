import { Medicine, MedicineHistoryItem, FamilyMember, UserProfile, AppSettings, AppNotification } from '../types';
import { INITIAL_MEDICINES, getInitialHistory, INITIAL_FAMILY_MEMBERS, INITIAL_PROFILE, INITIAL_SETTINGS } from '../data/initialData';

const KEYS = {
  MEDICINES: 'medicare_medicines',
  HISTORY: 'medicare_history',
  FAMILY: 'medicare_family',
  PROFILE: 'medicare_profile',
  SETTINGS: 'medicare_settings',
  NOTIFICATIONS: 'medicare_notifications',
  USER_AUTH: 'medicare_user_auth',
};

// Storage event listener helper for reactive state updates
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const subscribeStorage = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach(l => l());
};

// --- MEDICINES ---
export const getMedicines = (): Medicine[] => {
  try {
    const data = localStorage.getItem(KEYS.MEDICINES);
    if (!data) {
      localStorage.setItem(KEYS.MEDICINES, JSON.stringify(INITIAL_MEDICINES));
      return INITIAL_MEDICINES;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_MEDICINES;
  }
};

export const saveMedicine = (medicine: Omit<Medicine, 'id'> & { id?: string }): Medicine => {
  const medicines = getMedicines();
  let savedMed: Medicine;

  if (medicine.id) {
    const idx = medicines.findIndex(m => m.id === medicine.id);
    if (idx !== -1) {
      medicines[idx] = medicine as Medicine;
      savedMed = medicines[idx];
    } else {
      savedMed = { ...medicine, id: `med_${Date.now()}` } as Medicine;
      medicines.push(savedMed);
    }
  } else {
    savedMed = { ...medicine, id: `med_${Date.now()}` } as Medicine;
    medicines.push(savedMed);
  }

  localStorage.setItem(KEYS.MEDICINES, JSON.stringify(medicines));
  notifyListeners();
  return savedMed;
};

export const deleteMedicine = (id: string): void => {
  const medicines = getMedicines().filter(m => m.id !== id);
  localStorage.setItem(KEYS.MEDICINES, JSON.stringify(medicines));
  notifyListeners();
};

// --- HISTORY ---
export const getHistory = (): MedicineHistoryItem[] => {
  try {
    const data = localStorage.getItem(KEYS.HISTORY);
    if (!data) {
      const initial = getInitialHistory();
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  } catch {
    return getInitialHistory();
  }
};

export const recordDose = (
  medicineId: string,
  medicineName: string,
  dosage: string,
  type: Medicine['type'],
  scheduledTime: string,
  slot: MedicineHistoryItem['slot'],
  status: MedicineHistoryItem['status'],
  notes?: string
): MedicineHistoryItem => {
  const history = getHistory();
  const today = new Date().toISOString().split('T')[0];

  const newItem: MedicineHistoryItem = {
    id: `hist_${Date.now()}`,
    medicineId,
    medicineName,
    dosage,
    type,
    scheduledTime,
    actionTime: new Date().toISOString(),
    status,
    date: today,
    slot,
    notes
  };

  history.unshift(newItem);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));

  // If taken, decrement remaining pills if tracked
  if (status === 'Taken') {
    const medicines = getMedicines();
    const medIdx = medicines.findIndex(m => m.id === medicineId);
    if (medIdx !== -1 && medicines[medIdx].remainingPills !== undefined && medicines[medIdx].remainingPills! > 0) {
      medicines[medIdx].remainingPills = medicines[medIdx].remainingPills! - 1;
      localStorage.setItem(KEYS.MEDICINES, JSON.stringify(medicines));
    }
  }

  // Check missed threshold for family notification
  if (status === 'Missed') {
    checkMissedThresholdAndAlert(medicineName);
  }

  notifyListeners();
  return newItem;
};

// --- FAMILY MEMBERS ---
export const getFamilyMembers = (): FamilyMember[] => {
  try {
    const data = localStorage.getItem(KEYS.FAMILY);
    if (!data) {
      localStorage.setItem(KEYS.FAMILY, JSON.stringify(INITIAL_FAMILY_MEMBERS));
      return INITIAL_FAMILY_MEMBERS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_FAMILY_MEMBERS;
  }
};

export const saveFamilyMember = (member: Omit<FamilyMember, 'id'> & { id?: string }): FamilyMember => {
  const members = getFamilyMembers();
  let saved: FamilyMember;

  if (member.id) {
    const idx = members.findIndex(m => m.id === member.id);
    if (idx !== -1) {
      members[idx] = member as FamilyMember;
      saved = members[idx];
    } else {
      saved = { ...member, id: `fam_${Date.now()}` } as FamilyMember;
      members.push(saved);
    }
  } else {
    saved = { ...member, id: `fam_${Date.now()}` } as FamilyMember;
    members.push(saved);
  }

  localStorage.setItem(KEYS.FAMILY, JSON.stringify(members));
  notifyListeners();
  return saved;
};

export const deleteFamilyMember = (id: string): void => {
  const members = getFamilyMembers().filter(m => m.id !== id);
  localStorage.setItem(KEYS.FAMILY, JSON.stringify(members));
  notifyListeners();
};

// Check if user missed 3 times in a row
export const checkMissedThresholdAndAlert = (medName: string) => {
  const history = getHistory();
  const recentMissed = history.filter(h => h.status === 'Missed').slice(0, 3);
  if (recentMissed.length >= 3) {
    const members = getFamilyMembers().filter(f => f.notifyOnMissed);
    const memberNames = members.map(m => m.name).join(', ') || 'Emergency contacts';

    addNotification(
      "Family Alert Triggered",
      `Multiple missed doses detected for ${medName}. Alert message queued for ${memberNames}: "Your family member has missed today's medicine."`,
      "family_alert"
    );
  }
};

// --- PROFILE ---
export const getProfile = (): UserProfile => {
  try {
    const data = localStorage.getItem(KEYS.PROFILE);
    if (!data) {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
      return INITIAL_PROFILE;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_PROFILE;
  }
};

export const saveProfile = (profile: UserProfile): void => {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  notifyListeners();
};

// --- SETTINGS ---
export const getSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  notifyListeners();
};

// --- NOTIFICATIONS ---
export const getNotifications = (): AppNotification[] => {
  try {
    const data = localStorage.getItem(KEYS.NOTIFICATIONS);
    if (!data) {
      const initial: AppNotification[] = [
        {
          id: 'notif_1',
          title: 'Welcome to MediCare AI',
          message: 'Your smart medication schedule is set up and active.',
          type: 'system',
          timestamp: new Date().toISOString(),
          read: false
        }
      ];
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const addNotification = (title: string, message: string, type: AppNotification['type'] = 'reminder', medicineId?: string): void => {
  const list = getNotifications();
  const newNotif: AppNotification = {
    id: `notif_${Date.now()}`,
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false,
    medicineId
  };
  list.unshift(newNotif);
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
  notifyListeners();
};

export const markNotificationRead = (id: string): void => {
  const list = getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
  notifyListeners();
};

export const clearAllNotifications = (): void => {
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([]));
  notifyListeners();
};

// --- AUTH STATE SIMULATOR ---
export const getUserAuth = () => {
  try {
    const data = localStorage.getItem(KEYS.USER_AUTH);
    if (!data) {
      const defaultUser = { isLoggedIn: true, email: INITIAL_PROFILE.email, name: INITIAL_PROFILE.fullName };
      localStorage.setItem(KEYS.USER_AUTH, JSON.stringify(defaultUser));
      return defaultUser;
    }
    return JSON.parse(data);
  } catch {
    return { isLoggedIn: true, email: INITIAL_PROFILE.email, name: INITIAL_PROFILE.fullName };
  }
};

export const setUserAuth = (authData: { isLoggedIn: boolean; email?: string; name?: string }) => {
  localStorage.setItem(KEYS.USER_AUTH, JSON.stringify(authData));
  notifyListeners();
};
