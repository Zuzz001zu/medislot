import { Component, inject, signal } from "@angular/core";
import { Doctor } from "../../models/doctor";
import { DoctorService } from "../../services/doctor.service";
import { SpecialtyLabelPipe } from "../../pipes/specialty-label.pipe";

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
