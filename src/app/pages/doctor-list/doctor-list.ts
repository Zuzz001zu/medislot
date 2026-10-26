import { Component, computed, inject, signal } from "@angular/core";
import { Doctor, Specialty } from "../../models/doctor";
import {
  SPECIALTY_LABELS,
  SpecialtyLabelPipe,
} from "../../pipes/specialty-label.pipe";
import { DoctorService } from "../../services/doctor.service";

@Component({
  selector: "app-doctor-list",
  imports: [SpecialtyLabelPipe],
  templateUrl: "./doctor-list.html",
  styleUrl: "./doctor-list.scss",
})
export class DoctorList {
  private readonly doctorService = inject(DoctorService);

  protected readonly doctors = signal<Doctor[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly hasError = signal(false);

  protected readonly search = signal("");
  protected readonly specialty = signal("");
  protected readonly city = signal("");

  protected readonly specialties = Object.keys(SPECIALTY_LABELS) as Specialty[];

  protected readonly cities = computed(() =>
    [...new Set(this.doctors().map((doctor) => doctor.city))].sort(),
  );

  protected readonly filteredDoctors = computed(() => {
    const search = this.search().trim().toLowerCase();
    const specialty = this.specialty();
    const city = this.city();

    return this.doctors().filter((doctor) => {
      const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();

      return (
        (!search || fullName.includes(search)) &&
        (!specialty || doctor.specialty === specialty) &&
        (!city || doctor.city === city)
      );
    });
  });

  constructor() {
    this.loadDoctors();
  }

  protected loadDoctors(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors.set(doctors);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
