import { Component, inject, signal } from "@angular/core";
import { Doctor } from "../../models/doctor";
import { DoctorService } from "../../services/doctor.service";

@Component({
  selector: "app-doctor-list",
  templateUrl: "./doctor-list.html",
  styleUrl: "./doctor-list.scss",
})
export class DoctorList {
  private readonly doctorService = inject(DoctorService);

  protected readonly doctors = signal<Doctor[]>([]);

  constructor() {
    this.doctorService
      .getDoctors()
      .subscribe((doctors) => this.doctors.set(doctors));
  }
}
