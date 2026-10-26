import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { API_URL } from "../api.config";
import { Doctor } from "../models/doctor";

@Injectable({ providedIn: "root" })
export class DoctorService {
  private readonly http = inject(HttpClient);

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${API_URL}/doctors`);
  }
}
