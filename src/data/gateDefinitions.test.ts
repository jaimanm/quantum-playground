import { gateDefinitions } from "./gateDefinitions";

describe("Gate Definitions", () => {
  test("should have a valid structure", () => {
    expect(gateDefinitions).toBeInstanceOf(Array);
    gateDefinitions.forEach((gate) => {
      expect(gate).toHaveProperty("name");
      expect(gate).toHaveProperty("type");
      expect(gate).toHaveProperty("category");
      expect(gate).toHaveProperty("numQubits");
      expect(gate).toHaveProperty("hasParams");
    });
  });

  test("should have unique gate names", () => {
    const names = gateDefinitions.map((gate) => gate.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  test("should have valid gate categories", () => {
    const validCategories = ["single", "rotation", "controlled"];
    gateDefinitions.forEach((gate) => {
      expect(validCategories).toContain(gate.category);
    });
  });
});
