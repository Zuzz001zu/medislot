import { DatePipe } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AppointmentWithDetails } from "../../models/appointment";
import { SpecialtyLabelPipe } from "../../pipes/specialty-label.pipe";
import { AppointmentService } from "../../services/appointment.service";

@Component({
  selector: "app-my-appointments",
  imports: [RouterLink, DatePipe, SpecialtyLabelPipe],
  templateUrl: "./my-appointments.html",
  styleUrl: "./my-appointments.scss",
})
export class MyAppointments {
  private readonly appointmentService = inject(AppointmentService);

  protected readonly appointments = signal<AppointmentWithDetails[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly hasError = signal(false);
  protected readonly cancellingId = signal<number | null>(null);
  protected readonly cancelError = signal<string | null>(null);

  protected readonly sortedAppointments = computed(() =>
    [...this.appointments()].sort((a, b) => a.slot.start.localeCompare(b.slot.start)),
  );

  constructor() {
    this.loadAppointments();
  }

  protected loadAppointments(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  protected cancel(appointment: AppointmentWithDetails): void {
    if (!confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) {
      return;
    }

    this.cancellingId.set(appointment.id);
    this.cancelError.set(null);

    this.appointmentService.cancel(appointment).subscribe({
      next: () => {
        this.appointments.update((list) => list.filter((item) => item.id !== appointment.id));
        this.cancellingId.set(null);
      },
      error: () => {
        this.cancelError.set("L’annulation a échoué. Veuillez réessayer.");
        this.cancellingId.set(null);
      },
    });
  }
}
