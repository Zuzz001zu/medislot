import { Pipe, PipeTransform } from "@angular/core";
import { Specialty } from "../models/doctor";

const SPECIALTY_LABELS: Record<Specialty, string> = {
  general: "Médecine générale",
  pediatrics: "Pédiatrie",
  dermatology: "Dermatologie",
  gynecology: "Gynécologie",
  dentistry: "Médecine dentaire",
  ophthalmology: "Ophtalmologie",
};

@Pipe({ name: "specialtyLabel" })
export class SpecialtyLabelPipe implements PipeTransform {
  transform(value: Specialty): string {
    return SPECIALTY_LABELS[value];
  }
}
