import { DatePipe } from "@angular/common";
import { Component, OnInit, inject, input, signal } from "@angular/core";
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { forkJoin } from "rxjs";
import { Doctor } from "../../models/doctor";
import { Slot } from "../../models/slot";
import { SpecialtyLabelPipe } from "../../pipes/specialty-label.pipe";
import { AppointmentService, SlotUnavailableError } from "../../services/appointment.service";
import { DoctorService } from "../../services/doctor.service";
import { SWISS_PHONE_PATTERN, pastDateValidator } from "../../validators/patient.validators";

@Component({
  selector: "app-booking",
  imports: [ReactiveFormsModule, RouterLink, DatePipe, SpecialtyLabelPipe],
  templateUrl: "./booking.html",
  styleUrl: "./booking.scss",
})
export class Booking implements OnInit {
  readonly id = input.required<string>();
  readonly slotId = input.required<string>();

  private readonly doctorService = inject(DoctorService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly doctor = signal<Doctor | null>(null);
  protected readonly slot = signal<Slot | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly loadError = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly isConfirmed = signal(false);

  protected readonly form = this.fb.group({
    firstName: ["", [Validators.required, Validators.maxLength(50)]],
    lastName: ["", [Validators.required, Validators.maxLength(50)]],
    email: ["", [Validators.required, Validators.email]],
    phone: ["", [Validators.required, Validators.pattern(SWISS_PHONE_PATTERN)]],
    birthDate: ["", [Validators.required, pastDateValidator]],
  });

  ngOnInit(): void {
    this.loadData();
  }

  protected loadData(): void {
    this.isLoading.set(true);
    this.loadError.set(false);

    forkJoin({
      doctor: this.doctorService.getDoctor(Number(this.id())),
      slot: this.appointmentService.getSlot(Number(this.slotId())),
    }).subscribe({
      next: ({ doctor, slot }) => {
        this.doctor.set(doctor);
        this.slot.set(slot.doctorId === doctor.id ? slot : null);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  protected showError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!control && control.touched && control.hasError(error);
  }

  protected submit(): void {
    const slot = this.slot();

    if (!slot || this.isSubmitting()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.appointmentService.book(slot.id, this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isConfirmed.set(true);
      },
      error: (error: unknown) => {
        this.isSubmitting.set(false);
        this.submitError.set(
          error instanceof SlotUnavailableError
            ? "Ce créneau vient d’être réservé. Veuillez en choisir un autre."
            : "La réservation a échoué. Veuillez réessayer.",
        );
      },
    });
  }
}
