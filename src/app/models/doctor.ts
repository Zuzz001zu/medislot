export type Specialty =
  | "general"
  | "pediatrics"
  | "dermatology"
  | "gynecology"
  | "dentistry"
  | "ophthalmology";

export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialty: Specialty;
  city: string;
  address: string;
  languages: string[];
}
