import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpResponse,
} from "@angular/common/http";
import { Observable, delay, of, throwError } from "rxjs";
import seed from "../../../mock/db.json";
import { API_URL } from "../api.config";
import { Appointment, NewAppointment } from "../models/appointment";
import { Doctor } from "../models/doctor";
import { Slot } from "../models/slot";

interface Database {
  doctors: Doctor[];
  slots: Slot[];
  appointments: Appointment[];
}

const STORAGE_KEY = "medislot-demo-db";
const DAY_MS = 24 * 60 * 60 * 1000;

function toLocalIso(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
  );
}

// Seed dates are fixed, so on the demo we move them forward to always start tomorrow
function moveSlotsToFuture(slots: Slot[]): Slot[] {
  const firstDay = new Date([...slots].sort((a, b) => a.start.localeCompare(b.start))[0].start);
  firstDay.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const shiftDays = Math.max(0, Math.round((today.getTime() - firstDay.getTime()) / DAY_MS) + 1);

  return slots.map((slot) => {
    const start = new Date(slot.start);
    start.setDate(start.getDate() + shiftDays);
    return { ...slot, start: toLocalIso(start) };
  });
}

function loadDatabase(): Database {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as Database;
    }
  } catch {
    // storage can be blocked (private mode), the demo still works without it
  }

  const db = structuredClone(seed) as Database;
  return { ...db, slots: moveSlotsToFuture(db.slots) };
}

function saveDatabase(db: Database): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // same as above
  }
}

function respond<T>(body: T, status = 200): Observable<HttpEvent<T>> {
  return of(new HttpResponse({ status, body })).pipe(delay(300));
}

function notFound(url: string): Observable<never> {
  return throwError(() => new HttpErrorResponse({ status: 404, statusText: "Not Found", url }));
}

// Answers the same requests as json-server, so services don't know the difference
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_URL)) {
    return next(req);
  }

  const db = loadDatabase();
  const [resource, rawId] = req.url.slice(API_URL.length).split("/").filter(Boolean);
  const id = rawId ? Number(rawId) : null;
  const route = `${req.method} ${resource}${id === null ? "" : "/:id"}`;

  switch (route) {
    case "GET doctors":
      return respond(db.doctors);

    case "GET doctors/:id": {
      const doctor = db.doctors.find((item) => item.id === id);
      return doctor ? respond(doctor) : notFound(req.url);
    }

    case "GET slots": {
      const doctorId = Number(req.params.get("doctorId"));
      const slots = db.slots
        .filter((slot) => slot.doctorId === doctorId)
        .sort((a, b) => a.start.localeCompare(b.start));
      return respond(slots);
    }

    case "GET slots/:id": {
      const slot = db.slots.find((item) => item.id === id);
      return slot ? respond(slot) : notFound(req.url);
    }

    case "PATCH slots/:id": {
      const slot = db.slots.find((item) => item.id === id);
      if (!slot) {
        return notFound(req.url);
      }
      Object.assign(slot, req.body);
      saveDatabase(db);
      return respond(slot);
    }

    case "GET appointments": {
      const appointments = db.appointments.map((appointment) => ({
        ...appointment,
        doctor: db.doctors.find((doctor) => doctor.id === appointment.doctorId),
        slot: db.slots.find((slot) => slot.id === appointment.slotId),
      }));
      return respond(appointments);
    }

    case "POST appointments": {
      const appointment: Appointment = {
        ...(req.body as NewAppointment),
        id: Math.max(0, ...db.appointments.map((item) => item.id)) + 1,
      };
      db.appointments.push(appointment);
      saveDatabase(db);
      return respond(appointment, 201);
    }

    case "DELETE appointments/:id":
      db.appointments = db.appointments.filter((item) => item.id !== id);
      saveDatabase(db);
      return respond({});

    default:
      return notFound(req.url);
  }
};
