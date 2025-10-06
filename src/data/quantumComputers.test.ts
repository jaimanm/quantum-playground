import { describe, it, expect } from 'vitest';

describe('Quantum Computers Data Structure', () => {
    const quantumComputers = [
        { name: 'Qubit', type: 'basic', properties: { coherenceTime: 10, errorRate: 0.01 } },
        { name: 'Superconducting Qubit', type: 'advanced', properties: { coherenceTime: 100, errorRate: 0.001 } },
        { name: 'Trapped Ion', type: 'advanced', properties: { coherenceTime: 200, errorRate: 0.0001 } }
    ];

    it('should have a valid structure', () => {
        quantumComputers.forEach(qc => {
            expect(qc).toHaveProperty('name');
            expect(qc).toHaveProperty('type');
            expect(qc).toHaveProperty('properties');
        });
    });

    it('should contain valid types', () => {
        quantumComputers.forEach(qc => {
            expect(['basic', 'advanced']).toContain(qc.type);
        });
    });

    it('should have valid properties for each quantum computer', () => {
        quantumComputers.forEach(qc => {
            expect(qc.properties).toHaveProperty('coherenceTime');
            expect(qc.properties).toHaveProperty('errorRate');
        });
    });
});