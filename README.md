# Quantum Playground

A visual quantum circuit builder and simulator built with React, TypeScript, and FastAPI.

## Features

- **Drag-and-drop circuit building** with intuitive visual feedback
- **Real-time simulation** using Qiskit or PennyLane backends
- **Multiple quantum computer types** (simulator, ion-trap, superconducting)
- **Code generation** for Qiskit, PennyLane, Cirq, Q#, and Braket
- **Educational insights** with circuit analysis and explanations

## Setup

### Frontend

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

### Backend

1. Navigate to backend directory:

```bash
cd backend
```

2. Install Python dependencies:

```bash
pip install -r requirements.txt
```

3. Start FastAPI server:

```bash
uvicorn main:app --reload
```

The backend will run on `http://localhost:8000` and the frontend on `http://localhost:5173`.

## Usage

1. **Build circuits** by dragging gates from the library onto the canvas
2. **Configure qubits** using the +/- buttons
3. **Execute simulations** using the execution panel
4. **Generate code** in your preferred quantum framework
5. **View results** with interactive visualizations

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Qiskit/PennyLane
- **Simulation**: Accurate quantum computation with proper gate implementations
- **State Management**: Custom React hooks for circuit state

## Development

- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking
- `npm run build` - Build for production

## API Documentation

Backend API docs available at `http://localhost:8000/docs` when running.
