import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { API_URL } from "../api.config";
import { Appointment, Patient } from "../models/appointment";
import { Slot } from "../models/slot";
import { AppointmentService, SlotUnavailableError } from "./appointment.service";

describe("AppointmentService", () => {
  let service: AppointmentService;
  let http: HttpTestingController;

  const patient: Patient = {
    firstName: "Zara",
    lastName: "Test",
    email: "zara@example.ch",
    phone: "079 123 45 67",
    birthDate: "1990-05-01",
  };
  const freeSlot: Slot = { id: 5, doctorId: 2, start: "2026-11-09T10:00:00", isBooked: false };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AppointmentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("marks the slot as booked and then creates the appointment", () => {
    let result: Appointment | undefined;
    service.book(5, patient).subscribe((appointment) => (result = appointment));

    http.expectOne(`${API_URL}/slots/5`).flush(freeSlot);

    const patch = http.expectOne((req) => req.method === "PATCH");
    expect(patch.request.url).toBe(`${API_URL}/slots/5`);
    expect(patch.request.body).toEqual({ isBooked: true });
    patch.flush({ ...freeSlot, isBooked: true });

    const post = http.expectOne((req) => req.method === "POST");
    expect(post.request.url).toBe(`${API_URL}/appointments`);
    expect(post.request.body).toMatchObject({ doctorId: 2, slotId: 5, patient });
    post.flush({ ...post.request.body, id: 1 });

    expect(result?.id).toBe(1);
  });

  it("does not book a slot that someone else has already taken", () => {
    let error: unknown;
    service.book(5, patient).subscribe({ error: (err) => (error = err) });

    http.expectOne(`${API_URL}/slots/5`).flush({ ...freeSlot, isBooked: true });

    expect(error).toBeInstanceOf(SlotUnavailableError);
    // http.verify() in afterEach makes sure no PATCH or POST was sent
  });

  it("frees the slot when an appointment is cancelled", () => {
    let done = false;
    service
      .cancel({ id: 1, doctorId: 2, slotId: 5, patient, createdAt: "" })
      .subscribe(() => (done = true));

    http.expectOne((req) => req.method === "DELETE" && req.url === `${API_URL}/appointments/1`).flush({});
    const patch = http.expectOne((req) => req.method === "PATCH");
    expect(patch.request.body).toEqual({ isBooked: false });
    patch.flush({});

    expect(done).toBe(true);
  });
});
