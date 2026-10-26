import { SpecialtyLabelPipe } from "./specialty-label.pipe";

describe("SpecialtyLabelPipe", () => {
  const pipe = new SpecialtyLabelPipe();

  it("translates a specialty code to its french label", () => {
    expect(pipe.transform("dermatology")).toBe("Dermatologie");
    expect(pipe.transform("dentistry")).toBe("Médecine dentaire");
  });
});
