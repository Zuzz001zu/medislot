import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { Observable, of, throwError } from "rxjs";
import { Doctor } from "../../models/doctor";
import { DoctorService } from "../../services/doctor.service";
import { DoctorList } from "./doctor-list";

const doctors: Doctor[] = [
  {
    id: 1,
    firstName: "Claire",
    lastName: "Dubois",
    specialty: "general",
    city: "Genève",
    address: "Rue de Carouge 42",
    languages: ["fr"],
  },
  {
    id: 2,
    firstName: "Anna",
    lastName: "Keller",
    specialty: "dermatology",
    city: "Lausanne",
    address: "Avenue de la Gare 7",
    languages: ["fr", "de"],
  },
];

async function setup(getDoctors: () => Observable<Doctor[]>) {
  TestBed.configureTestingModule({
    imports: [DoctorList],
    providers: [provideRouter([]), { provide: DoctorService, useValue: { getDoctors } }],
  });
  const fixture = TestBed.createComponent(DoctorList);
  await fixture.whenStable();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

describe("DoctorList", () => {
  it("shows a card for each doctor", async () => {
    const { element } = await setup(() => of(doctors));

    const cards = element.querySelectorAll(".doctor-card");
    expect(cards.length).toBe(2);
    expect(cards[1].textContent).toContain("Dermatologie");
  });

  it("filters doctors by name", async () => {
    const { fixture, element } = await setup(() => of(doctors));

    const input = element.querySelector<HTMLInputElement>('input[type="search"]')!;
    input.value = "kel";
    input.dispatchEvent(new Event("input"));
    await fixture.whenStable();

    const cards = element.querySelectorAll(".doctor-card");
    expect(cards.length).toBe(1);
    expect(cards[0].textContent).toContain("Keller");
  });

  it("filters doctors by city", async () => {
    const { fixture, element } = await setup(() => of(doctors));

    const select = element.querySelectorAll<HTMLSelectElement>("select")[1];
    select.value = "Genève";
    select.dispatchEvent(new Event("change"));
    await fixture.whenStable();

    expect(element.querySelectorAll(".doctor-card").length).toBe(1);
  });

  it("shows an error with a retry button when the request fails", async () => {
    const { element } = await setup(() => throwError(() => new Error("Server down")));

    expect(element.querySelector('[role="alert"]')?.textContent).toContain("Impossible de charger");
    expect(element.querySelector("button")?.textContent).toContain("Réessayer");
  });
});
