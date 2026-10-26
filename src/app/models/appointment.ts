import { Doctor } from "./doctor";
import { Slot } from "./slot";

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

export type NewAppointment = Omit<Appointment, "id">;

export interface AppointmentWithDetails extends Appointment {
  doctor: Doctor;
  slot: Slot;
}
