export interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
  ward?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  isActive?: boolean;
  token?: string;
}

export interface CitizenProfile {
  id: number;
  nationalId: string;
  firstName?: string;
  lastName?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  phoneNumber?: string;
  email?: string;
  occupation?: string;
  village?: string;
  subLocation?: string;
  ward?: string;
  physicalAddress?: string;
  emergencyContact?: string;
  photoUrl?: string;
  status?: string;
  registrationDate?: string;
}

export interface Complaint {
  id: number;
  complaintCode: string;
  citizenName: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'Assigned' | 'In_Progress' | 'Resolved' | 'Closed';
  village: string;
  description: string;
  dateReported: string;
  lastUpdated: string;
  resolvedAt?: string | null;
  officerNotes?: string | null;
  resolutionNotes?: string | null;
  assignedOfficer?: string | null;
}

export interface ComplaintDetail extends Complaint {
  communications: Communication[];
}

export interface Communication {
  id: number;
  date: string;
  action: string;
  performedBy: string;
  notes?: string | null;
  createdAt: string;
}

export interface Attachment {
  id: number;
  fileName: string;
  filePath: string;
  fileType?: string;
  fileSize: number;
  uploadedAt: string;
}

export interface Project {
  id: number;
  projectCode: string;
  projectName: string;
  category: string;
  ward: string;
  location?: string;
  village?: string;
  description?: string;
  contractorName?: string;
  budget: number;
  amountSpent: number;
  fundingSource?: string;
  startDate?: string;
  expectedCompletion?: string;
  priority: string;
  projectManagerName?: string;
  status: string;
  progress: number;
  financialYear?: string;
}

export interface Event {
  id: number;
  eventCode: string;
  title: string;
  type: string;
  description?: string;
  ward: string;
  location?: string;
  village?: string;
  date: string;
  time: string;
  endTime?: string;
  organizer?: string;
  contactPhone?: string;
  contactEmail?: string;
  maxAttendees?: number;
  status: string;
}

export interface Announcement {
  id: number;
  title: string;
  description: string;
  category: string;
  ward: string;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedId?: number | null;
  relatedType?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface Program {
  id: number;
  programCode: string;
  name: string;
  description?: string;
  category: string;
  ward: string;
  location?: string;
  targetBeneficiaries?: string;
  eligibilityRequirements?: string;
  openingDate?: string;
  closingDate?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  status: string;
}

export interface ImpactStory {
  id: number;
  title: string;
  slug: string;
  description: string;
  content?: string | null;
  category: string;
  ward: string;
  location?: string;
  imageUrl?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  beneficiaries?: number | null;
  program?: { id: number; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface BursaryApplication {
  id: number;
  referenceNumber: string;
  fullName: string;
  idNumber: string;
  dateOfBirth?: string | null;
  phone?: string | null;
  email: string;
  institution: string;
  educationLevel: string;
  course: string;
  yearOfStudy: string;
  applicantType: string;
  parentalName?: string | null;
  academicScore: number;
  parentIncome: number;
  dependents: number;
  idDocumentUrl: string;
  transcriptUrl: string;
  incomeProofUrl: string;
  motivationalEssay: string;
  termsAccepted: boolean;
  status: string;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  citizen?: CitizenProfile | null;
  complaints: Complaint[];
  applications: BursaryApplication[];
  events: Event[];
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface EventRegistration {
  id: number;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventStatus: string;
  status: string;
  fullName: string;
  registeredAt: string;
}

export interface PublicParticipation {
  id: number;
  title: string;
  description?: string;
  category: string;
  ward: string;
  location?: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
