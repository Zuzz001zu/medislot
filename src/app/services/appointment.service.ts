import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map, switchMap, throwError } from "rxjs";
import { API_URL } from "../api.config";
import {
  Appointment,
  AppointmentWithDetails,
  NewAppointment,
  Patient,
} from "../models/appointment";
import { Slot } from "../models/slot";

export class SlotUnavailableError extends Error {
  constructor() {
    super("Slot is no longer available");
  }
}

@Injectable({ providedIn: "root" })
export class AppointmentService {
  private readonly http = inject(HttpClient);

  getSlot(id: number): Observable<Slot> {
    return this.http.get<Slot>(`${API_URL}/slots/${id}`);
  }

  getAppointments(): Observable<AppointmentWithDetails[]> {
    const params = new HttpParams()
      .append("_expand", "doctor")
      .append("_expand", "slot")
      .set("_sort", "createdAt")
      .set("_order", "desc");
    return this.http.get<AppointmentWithDetails[]>(`${API_URL}/appointments`, { params });
  }

  // json-server has no transactions, so we re-check the slot right before booking it
  book(slotId: number, patient: Patient): Observable<Appointment> {
    return this.getSlot(slotId).pipe(
      switchMap((slot) => {
        if (slot.isBooked) {
          return throwError(() => new SlotUnavailableError());
        }

        const appointment: NewAppointment = {
          doctorId: slot.doctorId,
          slotId: slot.id,
          patient,
          createdAt: new Date().toISOString(),
        };

        return this.http
          .patch<Slot>(`${API_URL}/slots/${slot.id}`, { isBooked: true })
          .pipe(switchMap(() => this.http.post<Appointment>(`${API_URL}/appointments`, appointment)));
      }),
    );
  }

  cancel(appointment: Appointment): Observable<void> {
    return this.http.delete(`${API_URL}/appointments/${appointment.id}`).pipe(
      switchMap(() =>
        this.http.patch(`${API_URL}/slots/${appointment.slotId}`, { isBooked: false }),
      ),
      map(() => undefined),
    );
  }
}
