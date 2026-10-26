import { FormControl } from "@angular/forms";
import { SWISS_PHONE_PATTERN, pastDateValidator } from "./patient.validators";

describe("SWISS_PHONE_PATTERN", () => {
  it.each(["079 123 45 67", "0791234567", "+41 79 123 45 67", "0041791234567", "022 345 67 89"])(
    "accepts %s",
    (phone) => {
      expect(SWISS_PHONE_PATTERN.test(phone)).toBe(true);
    },
  );

  it.each(["123", "079 123 45", "+33 6 12 34 56 78", "079-123-45-67"])("rejects %s", (phone) => {
    expect(SWISS_PHONE_PATTERN.test(phone)).toBe(false);
  });
});

describe("pastDateValidator", () => {
  it("accepts a date in the past", () => {
    expect(pastDateValidator(new FormControl("1990-05-01"))).toBeNull();
  });

  it("rejects a date in the future", () => {
    expect(pastDateValidator(new FormControl("2999-01-01"))).toEqual({ futureDate: true });
  });

  it("leaves empty values to the required validator", () => {
    expect(pastDateValidator(new FormControl(""))).toBeNull();
  });
});
