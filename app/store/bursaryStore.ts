import { create } from 'zustand';
import { secureStorage } from '../utils/secureStorage';

export const EDUCATION_LEVELS = [
  { value: 'primary', label: 'Primary School' },
  { value: 'high_school', label: 'High School' },
  { value: 'college', label: 'College' },
  { value: 'university', label: 'University' },
  { value: 'other', label: 'Other' },
];

export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
  { value: 'PreferNotToSay', label: 'Prefer not to say' },
];

export const RESIDENCY_OPTIONS = [
  { value: 'Kenyan', label: 'Kenyan Citizen' },
  { value: 'PermanentResident', label: 'Permanent Resident' },
  { value: 'Refugee', label: 'Refugee' },
  { value: 'Other', label: 'Other' },
];

export const ID_DOCUMENT_TYPES = [
  { value: 'ID', label: 'National ID' },
  { value: 'Passport', label: 'Passport' },
  { value: 'BirthCertificate', label: 'Birth Certificate' },
  { value: 'KRA', label: 'KRA PIN' },
  { value: 'Other', label: 'Other' },
];

export const DISABILITY_TYPES = [
  { value: 'No', label: 'None' },
  { value: 'Physical', label: 'Physical' },
  { value: 'Visual', label: 'Visual' },
  { value: 'Hearing', label: 'Hearing' },
  { value: 'Mental', label: 'Mental' },
  { value: 'Learning', label: 'Learning Disability' },
  { value: 'Other', label: 'Other' },
];

export const BURSARY_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'DOCUMENTS_REQUIRED', label: 'Documents Required' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
];

export type BursaryForm = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string;
  idDocumentType: string;
  idNumber: string;
  disabilityStatus: string;
  residency: string;
  county: string;
  constituency: string;
  ward: string;
  village: string;
  gpsCoordinates: string;
  institutionType: string;
  institutionName: string;
  gradeOrForm: string;
  admissionNumber: string;
  academicYear: string;
  parentFullName: string;
  relationship: string;
  parentPhoneNumber: string;
  occupation: string;
  numberOfDependants: string;
  householdMonthlyIncome: string;
  totalFees: string;
  amountPaid: string;
  outstandingBalance: string;
  amountRequested: string;
  previousBursaryReceived: 'Yes' | 'No';
  previousBursaryAmount: string;
  previousBursaryYear: string;
  previousBursaryProgram: string;
  otherFinancialAssistance: 'Yes' | 'No';
  otherFinancialSource: string;
  otherFinancialAmount: string;
  otherFinancialDescription: string;
  reasonForApplication: string;
  documents: DocumentFile[];
  agreeToTerms: 'Yes' | 'No';
  currentStep: number;
  draftStatus: 'DRAFT' | 'SUBMITTED';
  referenceNumber: string | null;
  savedAt: string | null;
  applicationId: string | null;
};

export type DocumentFile = {
  id: string;
  name: string;
  uri: string;
  type: string;
  fileSize?: number;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  required: boolean;
  documentType: string;
  backendUrl?: string;
  uploadingError?: string;
  uploadProgress?: number;
};

export type BursaryStore = {
  form: BursaryForm;
  setField: (key: keyof BursaryForm, value: any) => void;
  setMultiple: (updates: Partial<BursaryForm>) => void;
  setCurrentStep: (step: number) => void;
  addDocument: (doc: DocumentFile) => void;
  updateDocument: (id: string, updates: Partial<DocumentFile>) => void;
  removeDocument: (id: string) => void;
  resetForm: () => void;
  loadDraft: (data: Partial<BursaryForm>) => void;
  clearDraftMarker: () => void;
  saveDraft: () => Promise<void>;
  hydrateDraft: () => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
  setSubmitting: (value: boolean) => void;
  setSubmitError: (error: string | null) => void;
};

const STORAGE_KEY = 'wrms_bursary_draft_v2';

const initialForm: BursaryForm = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  phoneNumber: '',
  email: '',
  idDocumentType: 'ID',
  idNumber: '',
  disabilityStatus: 'No',
  residency: 'Kenyan',
  county: '',
  constituency: '',
  ward: '',
  village: '',
  gpsCoordinates: '',
  institutionType: 'university',
  institutionName: '',
  gradeOrForm: '',
  admissionNumber: '',
  academicYear: '',
  parentFullName: '',
  relationship: 'Mother',
  parentPhoneNumber: '',
  occupation: '',
  numberOfDependants: '',
  householdMonthlyIncome: '',
  totalFees: '',
  amountPaid: '',
  outstandingBalance: '',
  amountRequested: '',
  previousBursaryReceived: 'No',
  previousBursaryAmount: '',
  previousBursaryYear: '',
  previousBursaryProgram: '',
  otherFinancialAssistance: 'No',
  otherFinancialSource: '',
  otherFinancialAmount: '',
  otherFinancialDescription: '',
  reasonForApplication: '',
  documents: [],
  agreeToTerms: 'No',
  currentStep: 1,
  draftStatus: 'DRAFT',
  referenceNumber: null,
  savedAt: null,
  applicationId: null,
};

export const useBursaryStore = create<BursaryStore>()((set, get) => ({
  form: { ...initialForm },
  setField: (key, value) => set((state) => ({ form: { ...state.form, [key]: value } })),
  setMultiple: (updates) => set((state) => ({ form: { ...state.form, ...updates } })),
  setCurrentStep: (step) => set((state) => ({ form: { ...state.form, currentStep: step } })),
  addDocument: (doc) => set((state) => ({ form: { ...state.form, documents: [...state.form.documents, doc] } })),
  updateDocument: (id, updates) =>
    set((state) => ({
      form: {
        ...state.form,
        documents: state.form.documents.map((d) => (d.id === id ? { ...d, ...updates } : d)),
      },
    })),
  removeDocument: (id) => set((state) => ({ form: { ...state.form, documents: state.form.documents.filter((d) => d.id !== id) } })),
  resetForm: () => set({ form: { ...initialForm } }),
  loadDraft: (data) => set((state) => ({ form: { ...state.form, ...data } })),
  clearDraftMarker: () => set((state) => ({ form: { ...state.form, draftStatus: 'DRAFT', savedAt: null } })),
  saveDraft: async () => {
    try {
      const state = get();
      await secureStorage.setItem(STORAGE_KEY, JSON.stringify(state.form));
    } catch (e) {
      console.warn('Failed to save bursary draft:', e);
    }
  },
  hydrateDraft: async () => {
    try {
      const raw = await secureStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        get().loadDraft(data);
      }
    } catch (e) {
      console.warn('Failed to load bursary draft:', e);
    }
  },
  isSubmitting: false,
  submitError: null,
  setSubmitting: (value) => set({ isSubmitting: value }),
  setSubmitError: (error) => set({ submitError: error }),
}));

export const DOCUMENT_REQUIREMENTS = [
  { key: 'idDocument', label: 'National ID / Birth Certificate', required: true },
  { key: 'admissionLetter', label: 'Admission Letter', required: true },
  { key: 'feesStructure', label: 'School Fees Structure / Fees Statement', required: true },
  { key: 'academicResult', label: 'Latest Academic Result', required: true },
  { key: 'parentId', label: "Parent/Guardian ID", required: true },
  { key: 'incomeProof', label: 'Proof of Income', required: false },
  { key: 'bankStatement', label: 'Bank Statement', required: false },
];
