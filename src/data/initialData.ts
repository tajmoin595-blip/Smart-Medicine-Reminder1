import { Medicine, MedicineHistoryItem, FamilyMember, UserProfile, AppSettings } from '../types';

export const INITIAL_PROFILE: UserProfile = {
  id: 'usr_1',
  fullName: 'Eleanor Vance',
  email: 'eleanor.vance@example.com',
  age: 68,
  gender: 'Female',
  phoneNumber: '+1 (555) 234-5678',
  emergencyContact: '+1 (555) 987-6543',
  bloodGroup: 'O+',
  weight: '65 kg',
  height: '162 cm',
  medicalConditions: ['Type 2 Diabetes', 'Hypertension', 'Vitamin D Deficiency'],
  allergies: ['Penicillin', 'Sulfa Drugs'],
  photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
};

export const INITIAL_SETTINGS: AppSettings = {
  darkMode: false,
  language: 'English',
  reminderSound: 'gentle_chime',
  reminderVolume: 80,
  browserNotificationsEnabled: true,
  familyAlertThreshold: 3,
  snoozeDurationMinutes: 10
};

export const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'fam_1',
    name: 'Robert Vance',
    phone: '+1 (555) 987-6543',
    email: 'robert.vance@example.com',
    relationship: 'Son',
    notifyOnMissed: true,
    notifyOnEmergency: true
  },
  {
    id: 'fam_2',
    name: 'Dr. Sarah Jenkins',
    phone: '+1 (555) 456-7890',
    email: 'dr.jenkins@cityhealth.org',
    relationship: 'Doctor',
    notifyOnMissed: true,
    notifyOnEmergency: true
  },
  {
    id: 'fam_3',
    name: 'Clara Vance',
    phone: '+1 (555) 321-7654',
    email: 'clara.v@example.com',
    relationship: 'Daughter',
    notifyOnMissed: true,
    notifyOnEmergency: false
  }
];

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med_1',
    name: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    brandName: 'Glucophage',
    disease: 'Type 2 Diabetes',
    dosage: '500 mg',
    type: 'Tablet',
    color: '#2563eb', // blue
    description: 'Oral diabetes medicine that helps control blood sugar levels.',
    purpose: 'Lowers glucose production in the liver and improves insulin sensitivity.',
    times: [
      { slot: 'Morning', time: '08:00', enabled: true },
      { slot: 'Afternoon', time: '13:00', enabled: false },
      { slot: 'Evening', time: '20:00', enabled: true },
      { slot: 'Night', time: '22:00', enabled: false }
    ],
    foodTiming: 'With Food',
    startDate: '2025-01-01',
    frequency: 'Every Day',
    doctorName: 'Dr. Sarah Jenkins',
    hospital: 'City Medical Center',
    prescriptionNumber: 'RX-99812',
    notes: 'Take with morning and evening meals to lessen stomach upset.',
    remainingPills: 42,
    totalPills: 60,
    refillReminder: true
  },
  {
    id: 'med_2',
    name: 'Lisinopril',
    genericName: 'Lisinopril Dihydrate',
    brandName: 'Zestril',
    disease: 'Hypertension',
    dosage: '10 mg',
    type: 'Tablet',
    color: '#059669', // green
    description: 'ACE inhibitor used to treat high blood pressure.',
    purpose: 'Relaxes blood vessels so blood flows more smoothly.',
    times: [
      { slot: 'Morning', time: '08:30', enabled: true },
      { slot: 'Afternoon', time: '13:00', enabled: false },
      { slot: 'Evening', time: '19:00', enabled: false },
      { slot: 'Night', time: '22:00', enabled: false }
    ],
    foodTiming: 'Before Food',
    startDate: '2025-02-15',
    frequency: 'Every Day',
    doctorName: 'Dr. Sarah Jenkins',
    hospital: 'City Medical Center',
    prescriptionNumber: 'RX-88123',
    notes: 'Drink plenty of water. Monitor blood pressure weekly.',
    remainingPills: 18,
    totalPills: 30,
    refillReminder: true
  },
  {
    id: 'med_3',
    name: 'Amlodipine',
    genericName: 'Amlodipine Besylate',
    brandName: 'Norvasc',
    disease: 'High Blood Pressure',
    dosage: '5 mg',
    type: 'Tablet',
    color: '#7c3aed', // purple
    description: 'Calcium channel blocker for blood pressure and chest pain.',
    purpose: 'Helps relax blood vessels and increase blood and oxygen flow to the heart.',
    times: [
      { slot: 'Morning', time: '09:00', enabled: false },
      { slot: 'Afternoon', time: '13:00', enabled: false },
      { slot: 'Evening', time: '19:30', enabled: true },
      { slot: 'Night', time: '22:00', enabled: false }
    ],
    foodTiming: 'After Food',
    startDate: '2025-03-01',
    frequency: 'Every Day',
    doctorName: 'Dr. Marcus Vance',
    hospital: 'St. Jude Heart Clinic',
    prescriptionNumber: 'RX-77102',
    notes: 'Avoid consuming grapefruit or grapefruit juice.',
    remainingPills: 25,
    totalPills: 30,
    refillReminder: false
  },
  {
    id: 'med_4',
    name: 'Vitamin D3',
    genericName: 'Cholecalciferol',
    brandName: 'Calcirol',
    disease: 'Vitamin D Deficiency',
    dosage: '1000 IU',
    type: 'Capsule',
    color: '#d97706', // amber
    description: 'Dietary supplement to improve bone density and immune strength.',
    purpose: 'Helps absorption of calcium in bones and improves immune immunity.',
    times: [
      { slot: 'Morning', time: '08:00', enabled: true },
      { slot: 'Afternoon', time: '13:00', enabled: false },
      { slot: 'Evening', time: '19:00', enabled: false },
      { slot: 'Night', time: '22:00', enabled: false }
    ],
    foodTiming: 'After Food',
    startDate: '2025-01-10',
    frequency: 'Every Day',
    doctorName: 'Dr. Sarah Jenkins',
    hospital: 'City Medical Center',
    notes: 'Best taken after breakfast containing healthy fats.',
    remainingPills: 50,
    totalPills: 90,
    refillReminder: true
  }
];

export const getInitialHistory = (): MedicineHistoryItem[] => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const dayBefore = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];

  return [
    {
      id: 'hist_1',
      medicineId: 'med_1',
      medicineName: 'Metformin',
      dosage: '500 mg',
      type: 'Tablet',
      scheduledTime: '08:00 AM',
      actionTime: `${today}T08:05:00Z`,
      status: 'Taken',
      date: today,
      slot: 'Morning'
    },
    {
      id: 'hist_2',
      medicineId: 'med_2',
      medicineName: 'Lisinopril',
      dosage: '10 mg',
      type: 'Tablet',
      scheduledTime: '08:30 AM',
      actionTime: `${today}T08:28:00Z`,
      status: 'Taken',
      date: today,
      slot: 'Morning'
    },
    {
      id: 'hist_3',
      medicineId: 'med_4',
      medicineName: 'Vitamin D3',
      dosage: '1000 IU',
      type: 'Capsule',
      scheduledTime: '08:00 AM',
      actionTime: `${today}T08:12:00Z`,
      status: 'Taken',
      date: today,
      slot: 'Morning'
    },
    {
      id: 'hist_4',
      medicineId: 'med_1',
      medicineName: 'Metformin',
      dosage: '500 mg',
      type: 'Tablet',
      scheduledTime: '08:00 AM',
      actionTime: `${yesterday}T08:10:00Z`,
      status: 'Taken',
      date: yesterday,
      slot: 'Morning'
    },
    {
      id: 'hist_5',
      medicineId: 'med_2',
      medicineName: 'Lisinopril',
      dosage: '10 mg',
      type: 'Tablet',
      scheduledTime: '08:30 AM',
      actionTime: `${yesterday}T08:35:00Z`,
      status: 'Taken',
      date: yesterday,
      slot: 'Morning'
    },
    {
      id: 'hist_6',
      medicineId: 'med_3',
      medicineName: 'Amlodipine',
      dosage: '5 mg',
      type: 'Tablet',
      scheduledTime: '07:30 PM',
      actionTime: undefined,
      status: 'Missed',
      date: yesterday,
      slot: 'Evening',
      notes: 'User fell asleep early.'
    },
    {
      id: 'hist_7',
      medicineId: 'med_1',
      medicineName: 'Metformin',
      dosage: '500 mg',
      type: 'Tablet',
      scheduledTime: '08:00 AM',
      actionTime: `${dayBefore}T08:00:00Z`,
      status: 'Taken',
      date: dayBefore,
      slot: 'Morning'
    },
    {
      id: 'hist_8',
      medicineId: 'med_3',
      medicineName: 'Amlodipine',
      dosage: '5 mg',
      type: 'Tablet',
      scheduledTime: '07:30 PM',
      actionTime: undefined,
      status: 'Missed',
      date: dayBefore,
      slot: 'Evening'
    }
  ];
};
