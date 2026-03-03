export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  enrolledAt: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentContactInfo?: string;
}
