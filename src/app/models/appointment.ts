export interface Patient {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
}

export interface Appointment {
  id: number;
  doctorId: number;
  slotId: number;
  patient: Patient;
  createdAt: string;
}
