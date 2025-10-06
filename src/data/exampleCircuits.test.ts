import { exampleCircuits } from "./exampleCircuits";

describe("Example Circuits Data", () => {
  test("should be an array", () => {
    expect(Array.isArray(exampleCircuits)).toBe(true);
  });

  test("should have at least one circuit", () => {
    expect(exampleCircuits.length).toBeGreaterThan(0);
  });

  test("each circuit should have required properties", () => {
    exampleCircuits.forEach((circuit) => {
      expect(circuit).toHaveProperty("id");
      expect(circuit).toHaveProperty("name");
      expect(circuit).toHaveProperty("description");
      expect(circuit).toHaveProperty("difficulty");
      expect(circuit).toHaveProperty("circuit");
    });
  });

  test("circuit property should be an object", () => {
    exampleCircuits.forEach((circuit) => {
      expect(typeof circuit.circuit).toBe("object");
      expect(circuit.circuit).toHaveProperty("numQubits");
      expect(circuit.circuit).toHaveProperty("gates");
      expect(circuit.circuit).toHaveProperty("measurements");
    });
  });
});
