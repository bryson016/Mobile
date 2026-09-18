import { api } from '../utils/api';
import type { BursaryForm } from '../store/bursaryStore';

export async function fetchUploadSession() {
  return { id: Date.now().toString() };
}

export async function uploadBursaryDocument(
  documentType: string,
  file: { uri: string; name: string; type: string; fileSize?: number },
  onProgress?: (progress: number) => void
): Promise<{ url?: string; error?: string }> {
  const formData = new FormData();
  formData.append('documentType', documentType);
  formData.append(
    'attachment',
    {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any
  );

  return { url: '' };
}

export async function submitBursaryApplication(
  form: BursaryForm,
  onUploadProgress?: (progress: number) => void
): Promise<any> {
  const formData = new FormData();

  // Step 1 - Personal Information
  formData.append('firstName', form.firstName || '');
  formData.append('lastName', form.lastName || '');
  formData.append('dateOfBirth', form.dateOfBirth || '');
  formData.append('gender', form.gender || '');
  formData.append('phoneNumber', form.phoneNumber || '');
  formData.append('email', form.email || '');
  formData.append('idDocumentType', form.idDocumentType || '');
  formData.append('idNumber', form.idNumber || '');
  formData.append('disabilityStatus', form.disabilityStatus || '');
  formData.append('residency', form.residency || '');

  // Step 2 - Educational Details
  formData.append('institutionType', form.institutionType || '');
  formData.append('institutionName', form.institutionName || '');
  formData.append('gradeOrForm', form.gradeOrForm || '');
  formData.append('admissionNumber', form.admissionNumber || '');
  formData.append('academicYear', form.academicYear || '');

  // Step 3 - Parent/Guardian Information
  formData.append('parentFullName', form.parentFullName || '');
  formData.append('relationship', form.relationship || '');
  formData.append('parentPhoneNumber', form.parentPhoneNumber || '');
  formData.append('occupation', form.occupation || '');
  formData.append('numberOfDependants', form.numberOfDependants || '0');
  formData.append('householdMonthlyIncome', form.householdMonthlyIncome || '0');

  // Step 4 - Financial Information
  formData.append('totalFees', form.totalFees || '0');
  formData.append('amountPaid', form.amountPaid || '0');
  formData.append('outstandingBalance', form.outstandingBalance || '0');
  formData.append('amountRequested', form.amountRequested || '0');
  formData.append('previousBursaryReceived', form.previousBursaryReceived || 'No');
  formData.append('previousBursaryAmount', form.previousBursaryAmount || '');
  formData.append('previousBursaryYear', form.previousBursaryYear || '');
  formData.append('previousBursaryProgram', form.previousBursaryProgram || '');
  formData.append('otherFinancialAssistance', form.otherFinancialAssistance || 'No');
  formData.append('otherFinancialSource', form.otherFinancialSource || '');
  formData.append('otherFinancialAmount', form.otherFinancialAmount || '');
  formData.append('otherFinancialDescription', form.otherFinancialDescription || '');
  formData.append('reasonForApplication', form.reasonForApplication || '');

  // Step 6 - Location/Residential
  formData.append('county', form.county || '');
  formData.append('constituency', form.constituency || '');
  formData.append('ward', form.ward || '');
  formData.append('village', form.village || '');
  formData.append('gpsCoordinates', form.gpsCoordinates || '');

  // Append uploaded documents
  form.documents.forEach((doc) => {
    if (doc.uploaded && doc.uri) {
      formData.append(doc.documentType, {
        uri: doc.uri,
        name: doc.name,
        type: doc.type,
      } as any);
    }
  });

  return api.bursary.apply(formData);
}

export async function fetchBursaryApplications(): Promise<any[]> {
  const result = await api.bursary.getMyApplications();
  return result?.applications || [];
}

export async function fetchBursaryApplication(id: number): Promise<any> {
  const result = await api.bursary.getMyApplication(id);
  return result?.application;
}

export async function withdrawBursaryApplication(id: number): Promise<any> {
  return api.bursary.withdrawMyApplication(id);
}

export async function deleteBursaryApplication(id: number): Promise<any> {
  return api.bursary.deleteMyApplication(id);
}

export async function fetchBursaryApplicationHistory(id: number): Promise<any> {
  const result = await api.bursary.getApplicationHistory(id);
  return result?.history || [];
}
