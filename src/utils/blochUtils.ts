// Helper to convert backend statevector (array of complex numbers) to per-qubit Bloch coordinates
// Assumes statevector is an array of { re, im } objects, length 2^n
// Returns array of { x, y, z } for each qubit
export function getBlochVectorsFromStatevector(
  statevector: Array<{ re: number; im: number }>,
  numQubits: number
) {
  // For single-qubit, just use the statevector directly
  if (numQubits === 1) {
    const a = statevector[0];
    const b = statevector[1];
    // Use Bloch formula
    const a_conj_b = {
      re: a.re * b.re + a.im * b.im,
      im: a.re * b.im - a.im * b.re,
    };
    const x = 2 * a_conj_b.re;
    const y = 2 * a_conj_b.im;
    const z = a.re * a.re + a.im * a.im - (b.re * b.re + b.im * b.im);
    return [{ x, y, z }];
  }

  // For multi-qubit systems, compute reduced density matrix for each qubit
  // by tracing out all other qubits
  const blochVectors = [];

  for (let targetQubit = 0; targetQubit < numQubits; targetQubit++) {
    // Compute reduced density matrix for this qubit
    // Backend uses little-endian (q0 is LSB), so targetQubit directly maps to bit position
    // ρ = Tr_{other qubits}(|ψ⟩⟨ψ|)

    // Density matrix elements: ρ_00, ρ_01, ρ_10, ρ_11
    let rho00 = { re: 0, im: 0 };
    let rho01 = { re: 0, im: 0 };
    let rho10 = { re: 0, im: 0 };
    let rho11 = { re: 0, im: 0 };

    // Sum over all basis states
    for (let i = 0; i < statevector.length; i++) {
      for (let j = 0; j < statevector.length; j++) {
        // Check if i and j differ only in qubits other than targetQubit
        const bitI = (i >> targetQubit) & 1;
        const bitJ = (j >> targetQubit) & 1;

        // Remove targetQubit bit from i and j to see if other bits match
        const otherBitsI = i & ~(1 << targetQubit);
        const otherBitsJ = j & ~(1 << targetQubit);

        if (otherBitsI === otherBitsJ) {
          // Compute ψ_i * ψ_j^*
          const psi_i = statevector[i];
          const psi_j = statevector[j];
          const product = {
            re: psi_i.re * psi_j.re + psi_i.im * psi_j.im,
            im: psi_i.im * psi_j.re - psi_i.re * psi_j.im,
          };

          if (bitI === 0 && bitJ === 0) {
            rho00.re += product.re;
            rho00.im += product.im;
          } else if (bitI === 0 && bitJ === 1) {
            rho01.re += product.re;
            rho01.im += product.im;
          } else if (bitI === 1 && bitJ === 0) {
            rho10.re += product.re;
            rho10.im += product.im;
          } else if (bitI === 1 && bitJ === 1) {
            rho11.re += product.re;
            rho11.im += product.im;
          }
        }
      }
    }

    // Compute Bloch vector from density matrix
    // x = Tr(ρ * σ_x) = ρ_01 + ρ_10 (real part)
    // y = Tr(ρ * σ_y) = i(ρ_10 - ρ_01) (imaginary part)
    // z = Tr(ρ * σ_z) = ρ_00 - ρ_11
    const x = rho01.re + rho10.re;
    const y = rho10.im - rho01.im;
    const z = rho00.re - rho11.re;

    blochVectors.push({ x, y, z });
  }

  return blochVectors;
}
