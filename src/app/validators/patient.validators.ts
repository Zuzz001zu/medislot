import { AbstractControl, ValidationErrors } from "@angular/forms";

// 079 123 45 67, +41 79 123 45 67, 0041791234567
export const SWISS_PHONE_PATTERN = /^(\+41|0041|0)\s?[1-9]\d(\s?\d{3})(\s?\d{2}){2}$/;

export function pastDateValidator(control: AbstractControl<string | null>): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  return new Date(control.value) < new Date() ? null : { futureDate: true };
}
