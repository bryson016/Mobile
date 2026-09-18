import { api } from "../utils/api";

function appendField(formData, key, value) {
  if (value === undefined || value === null) return;
  formData.append(key, String(value));
}

function appendFile(formData, field, file) {
  if (!file || !file.uri) return;
  const type = file.type || getMimeType(file.name) || 'application/octet-stream';
  formData.append(field, {
    uri: file.uri,
    name: file.name || 'document',
    type,
  });
}

function getMimeType(fileName) {
  if (!fileName) return null;
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    default:
      return null;
  }
}

export async function submitBursaryApplication(form, files) {
  const formData = new FormData();

  appendField(formData, "fullName", form.fullName);
  appendField(formData, "idNumber", form.idNumber);
  appendField(formData, "dateOfBirth", form.dateOfBirth);
  appendField(formData, "phone", form.phone);
  appendField(formData, "email", form.email);
  appendField(formData, "institution", form.institution);
  appendField(formData, "educationLevel", form.educationLevel || "university");
  appendField(formData, "course", form.course);
  appendField(formData, "yearOfStudy", form.yearOfStudy);
  appendField(formData, "applicantType", form.applicantType || "student");
  appendField(formData, "parentalName", form.parentalName);
  appendField(formData, "academicScore", form.academicScore);
  appendField(formData, "parentIncome", form.parentIncome);
  appendField(formData, "dependents", form.dependents);
  appendField(formData, "motivationalEssay", form.motivationalEssay);
  appendField(formData, "termsAccepted", form.termsAccepted ? "true" : "false");

  appendFile(formData, "idDocument", files.idDocument);
  appendFile(formData, "transcript", files.transcript);
  appendFile(formData, "incomeProof", files.incomeProof);

  return api.bursary.apply(formData);
}
