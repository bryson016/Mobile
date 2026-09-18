export function isValidKenyanIdNumber(idNumber) {
  if (!idNumber) return false;
  const cleaned = String(idNumber).trim();
  return /^\d{7,8}$/.test(cleaned);
}

export function idNumberError(idNumber) {
  if (!idNumber || !String(idNumber).trim()) {
    return "National ID number is required.";
  }
  if (!isValidKenyanIdNumber(idNumber)) {
    return "Enter a valid Kenyan National ID number (7-8 digits).";
  }
  return "";
}

export function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export function isPositiveNumber(value) {
  const num = Number(value);
  return value !== "" && !Number.isNaN(num) && num >= 0;
}

export function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}
