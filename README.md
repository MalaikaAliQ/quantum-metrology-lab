# Quantum Metrology & Algorithm Interactive Laboratory

A high-precision, interactive React application demonstrating quantum search algorithm speedups (Grover register) alongside the physical principles of Quantum Metrology (3D Mach-Zehnder optical interferometers and atomic Ramsey interferometry).

## 🚀 Features

- **Interactive Grover Search Engine**: Real-time comparison of classical linear scans ($O(N)$) vs. 4-qubit Grover register evolution ($O(\sqrt{N})$) with oracle phase inversion and amplitude diffusion visualizer.
- **3D Quantum Sensing Bench**: Real-time 3D interactive viewport rendering a Mach-Zehnder Optical Interferometer with click-drag 3D camera controls, phase shift ($\theta$) modulation, photon flux ($N$) scaling, and coherent beam vs. NOON entangled state (SQL vs. Heisenberg Limit) performance readouts.
- **Atomic Ramsey Interferometry**: Animated 2-level atomic state transition diagram with dynamic 2D Bloch sphere vector rotation and interrogation pulse sequence phase tracking.
- **Responsive & Modern Design System**: High-density typography (Inter & JetBrains Mono), glassmorphism navigation bar, HSL color tokens, and smooth UI animations.

## 📦 Tech Stack

- **Framework**: React 18 + Vite
- **Icons**: Lucide React
- **3D Graphics**: HTML5 Canvas 2D Matrix Projection Engine
- **Styling**: Modern CSS with CSS Custom Properties

## 🌐 Vercel Deployment Guide

This project is pre-configured for **seamless 1-click Vercel Deployment**.

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push this project folder to your GitHub / GitLab / Bitbucket repository.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Click **Import Repository** and select `quantum-metrology-lab`.
4. Vercel will auto-detect the framework as **Vite** and build command as `npm run build`.
5. Click **Deploy**!

### Option 2: Deploy via Vercel CLI

Run the following command in your terminal inside this project directory:

```bash
npx vercel
```

### Option 3: Local Development & Production Build

```bash
# Start local development server
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

## 📄 Configuration Files Included

- `vercel.json`: Pre-configured for Vite framework, clean URLs, and security headers.
- `vite.config.js`: Production bundle optimization settings.
