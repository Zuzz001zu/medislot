# MediSlot

Book an appointment with a doctor in Western Switzerland: find a doctor, pick a free slot, fill in your details, manage your appointments.

**Live demo:** https://zuzz001zu.github.io/medislot/

The interface is in French, as it would be for patients in Geneva and Lausanne.

## Features

- Doctor list with search by name and filters by specialty and city
- Doctor page with available slots grouped by day (dates in Swiss French format)
- Booking form with validation: required fields, e-mail, Swiss phone number, birth date in the past
- "Mes rendez-vous" page: list of booked appointments, cancellation frees the slot again
- Loading, empty and error states on every page, with a retry button
- Responsive layout, keyboard focus styles, labelled form fields

## Stack

- Angular 22 (standalone components, signals, new control flow `@if` / `@for`)
- TypeScript
- SCSS with BEM naming
- Reactive Forms with custom validators
- REST API: [json-server](https://github.com/typicode/json-server) locally
- Vitest for unit tests
- GitHub Actions: tests and build on every push, deployment to GitHub Pages

## Run locally

Requires Node.js 20 or later.

```bash
npm install
npm run api     # REST API on http://localhost:3000
npm start       # app on http://localhost:4200
```

Run the two commands in separate terminals. Bookings made while testing go to `mock/db.local.json`, which is not tracked by git; restarting the API resets the data.

```bash
npm test        # unit tests
```

## How it works

```
src/app/
  models/       Doctor, Slot, Appointment interfaces
  services/     HTTP calls (DoctorService, AppointmentService)
  pages/        doctor-list, doctor-detail, booking, my-appointments
  pipes/        specialty code -> French label
  validators/   Swiss phone pattern, past date
  mock-api/     in-browser API used by the online demo
```

A few decisions worth explaining:

- **Booking a slot.** json-server has no transactions, so `AppointmentService.book()` reads the slot again right before booking. If someone took it in the meantime, the user gets a clear message instead of a double booking. With a real backend this check would live on the server.
- **Filtering on the client.** There are only a handful of doctors, so filtering with a `computed` signal is instant. With thousands of doctors I would send the filters as query params and debounce the search input.
- **Online demo without a backend.** GitHub Pages only serves static files. In the production build an HTTP interceptor answers the same requests as json-server and keeps the data in `localStorage`, so the services and components are exactly the same in both modes.

## Possible next steps

- English / German translations
- Real backend (FastAPI + PostgreSQL)
- End-to-end tests with Playwright
