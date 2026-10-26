import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { API_URL } from "../api.config";
import { Doctor } from "../models/doctor";
import { Slot } from "../models/slot";

@Injectable({ providedIn: "root" })
export class DoctorService {
  private readonly http = inject(HttpClient);

  getDoctor(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${API_URL}/doctors/${id}`);
  }

  getSlots(doctorId: number): Observable<Slot[]> {
    const params = new HttpParams()
      .set("doctorId", doctorId)
      .set("_sort", "start");
    return this.http.get<Slot[]>(`${API_URL}/slots`, { params });
  }
  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${API_URL}/doctors`);
  }
}
