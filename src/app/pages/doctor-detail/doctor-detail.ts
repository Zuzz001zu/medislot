import { DatePipe, UpperCasePipe } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import {
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { forkJoin } from "rxjs";
import { Doctor } from "../../models/doctor";
import { Slot } from "../../models/slot";
import { SpecialtyLabelPipe } from "../../pipes/specialty-label.pipe";
import { DoctorService } from "../../services/doctor.service";

@Component({
  selector: "app-doctor-detail",
  imports: [RouterLink, DatePipe, UpperCasePipe, SpecialtyLabelPipe],
  templateUrl: "./doctor-detail.html",
  styleUrl: "./doctor-detail.scss",
})
export class DoctorDetail implements OnInit {
  readonly id = input.required<string>();

  private readonly doctorService = inject(DoctorService);

  protected readonly doctor = signal<Doctor | null>(null);
  protected readonly slots = signal<Slot[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly slotsByDay = computed(() => {
    const groups = new Map<string, Slot[]>();

    for (const slot of this.slots()) {
      const day = slot.start.slice(0, 10);
      groups.set(day, [...(groups.get(day) ?? []), slot]);
    }

    return [...groups].map(([date, slots]) => ({ date, slots }));
  });

  ngOnInit(): void {
    this.loadDoctor();
  }

  protected loadDoctor(): void {
    const id = Number(this.id());

    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      doctor: this.doctorService.getDoctor(id),
      slots: this.doctorService.getSlots(id),
    }).subscribe({
      next: ({ doctor, slots }) => {
        this.doctor.set(doctor);
        this.slots.set(slots);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.status === 404
            ? "Ce médecin n’existe pas."
            : "Impossible de charger les informations du médecin.",
        );
        this.isLoading.set(false);
      },
    });
  }
}
