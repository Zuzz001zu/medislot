import { Routes } from "@angular/router";
import { Booking } from "./pages/booking/booking";
import { DoctorDetail } from "./pages/doctor-detail/doctor-detail";
import { DoctorList } from "./pages/doctor-list/doctor-list";

export const routes: Routes = [
  { path: "", component: DoctorList },
  { path: "doctors/:id", component: DoctorDetail },
  { path: "doctors/:id/book/:slotId", component: Booking },
  { path: "**", redirectTo: "" },
];
