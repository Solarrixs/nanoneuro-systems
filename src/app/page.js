'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GeistMono } from 'geist/font/mono';

// --- Configuration ---
const NEURAL_CONFIG = {
  grid: {
    dotsPerRow: 80, // Affects the density of the neuron grid
  },
  neuron: {
    spontaneousFireProbability: 0.0002, // Likelihood of a neuron firing without external input
    firingThreshold: 0.65, // Membrane potential needed for a neuron to fire
    potentialDecayRate: 0.4, // Rate at which a neuron's potential decreases (e.g., 0.4 means 60% decay per step)
    refractoryPeriodBase: 1.0, // Minimum duration a neuron cannot fire after firing
    refractoryPeriodRandomFactor: 2.0, // Variability: refractory = base + Math.random() * factor
    recentActivityDecayRate: 0.95, // Rate at which "recent activity" marker fades for obstacle avoidance
  },
  axon: {
    signalVelocity: 0.5, // Speed of signals along axons
    numAxonsMin: 2, // Minimum number of axons generated when a neuron fires
    numAxonsRandomFactor: 4, // Variability: numAxons = min + Math.floor(Math.random() * factor)
    longRangeProbability: 0.5, // Probability (0-1) of an axon being long-range
    shortMaxLengthBase: 3, // Base maximum length for short-range axons
    shortMaxLengthRandomFactor: 6, // Variability in short-range axon length
    longMaxLengthBase: 8, // Base maximum length for long-range axons
    longMaxLengthRandomFactor: 16, // Variability in long-range axon length
    angularPersistence: 0.1, // How much an axon tends to continue in its current direction (0-1, 0 is very random)
    bifurcationProbability: 0.25, // Probability of an axon branching
    mainAttenuationBase: 0.3, // Base signal strength attenuation for main axons (0-1)
    mainAttenuationRandomFactor: 0.4, // Variability in main axon attenuation
    branchAttenuationBase: 0.2, // Base signal strength attenuation for branched axons
    branchAttenuationRandomFactor: 0.7, // Variability in branch axon attenuation
    branchSignalStrengthFactor: 0.5, // Strength multiplier for signals in bifurcated branches
    obstacleAvoidanceSensitivity: 0.5, // Threshold of "recentActivity" to consider a neuron an obstacle
  },
  visuals: {
    dotRadiusFactor: 0.1, // Neuron dot radius as a factor of dotSpacing
    trailEffectAlpha: 0.05, // Alpha for canvas clearing, creates motion blur (0-1)
    neuronPotentialColorIntensity: 128, // Scales RGB for neuron potential visualization
    signalGlowFactor: 3, // Radius of signal's glow as a multiple of dotRadius
    signalColor: {
      rBase: 0, rIntensityFactor: 127,
      gBase: 32, gIntensityFactor: 127,
      bBase: 160, bIntensityFactor: 127,
    },
    textColor: {
      blinkSpeed: 0.002, // Speed of blinking effect for text neurons
      blinkPhaseFactor: 0.15, // Staggered blinking phase for text neurons
      baseIntensity: 1, // Base brightness for text neurons (0-1)
      blinkAmplitude: 0.2, // Amplitude of blink brightness variation (0-1)
    },
  },
  textPattern: {
    text: 'nanoneuro', // The text to display
    letterWidth: 6, // Columns allocated per letter (including spacing)
    letterHeight: 7, // Rows used by letter patterns
    letters: {
      'n': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
      'a': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
      'o': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
      'e': [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
      'u': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
      'r': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,1,0],[1,0,0,0,1],[1,0,0,0,1]],
    },
  }
};

// --- Helper Functions ---

/** Initializes canvas properties for high DPI rendering and returns the 2D context. */
function setupCanvas(canvas, width, height) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);
  return ctx;
}

/** Creates and returns an array of neuron objects based on grid dimensions. */
function initializeNeurons(rows, cols, dotSpacing) {
  const neurons = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      neurons.push({
        x: j * dotSpacing + dotSpacing / 2,
        y: i * dotSpacing + dotSpacing / 2,
        row: i,
        col: j,
        potential: 0,
        refractory: 0,
        lastFired: 0,
        isText: false,
        textValue: false,
        textPhase: 0,
        recentActivity: 0,
      });
    }
  }
  return neurons;
}

/** Modifies neuron objects in the grid to form a text pattern. */
// Takes the grid context ref, which contains .getNeuronAt, .cols, .rows
function applyTextPattern(localGridContextRef) {
  const { text, letters, letterWidth, letterHeight } = NEURAL_CONFIG.textPattern;
  const { cols, rows, getNeuronAt } = localGridContextRef.current; 
  if (!text || Object.keys(letters).length === 0 || !cols || !rows || !getNeuronAt) return;

  const totalTextVisualWidth = text.length * letterWidth - (text.length > 0 ? 1 : 0);
  const startCol = Math.floor((cols - totalTextVisualWidth) / 2);
  const startRow = Math.floor(rows / 3);
  let charPhaseIndex = 0;

  text.split('').forEach((char, charIdx) => {
    const letterPattern = letters[char.toLowerCase()];
    if (letterPattern) {
      letterPattern.forEach((rowPattern, rowIndex) => {
        rowPattern.forEach((val, colPatternIndex) => {
          if (val === 1) {
            // Correctly call getNeuronAt from the ref's current object
            const neuron = getNeuronAt(
              startRow + rowIndex,
              startCol + charIdx * letterWidth + colPatternIndex
            );
            if (neuron) {
              neuron.isText = true;
              neuron.textValue = true;
              neuron.textPhase = charPhaseIndex * NEURAL_CONFIG.visuals.textColor.blinkPhaseFactor;
              charPhaseIndex++;
            }
          }
        });
      });
    }
  });
}

/** Generates a set of axon paths originating from a given neuron. */
// Takes the grid context ref, which contains .getNeuronAt
function generateAxonPaths(startNeuron, localGridContextRef) {
  const config = NEURAL_CONFIG.axon;
  const { getNeuronAt } = localGridContextRef.current; // Destructure getNeuronAt from the ref
  if (!getNeuronAt) return []; // Guard if getNeuronAt is not ready

  const paths = [];
  const numAxons = config.numAxonsMin + Math.floor(Math.random() * config.numAxonsRandomFactor);

  for (let i = 0; i < numAxons; i++) {
    const path = [];
    let currentRow = startNeuron.row;
    let currentCol = startNeuron.col;
    let angle = Math.random() * 2 * Math.PI;

    const isLongRange = Math.random() < config.longRangeProbability;
    const maxLength = isLongRange
      ? config.longMaxLengthBase + Math.floor(Math.random() * config.longMaxLengthRandomFactor)
      : config.shortMaxLengthBase + Math.floor(Math.random() * config.shortMaxLengthRandomFactor);

    for (let step = 0; step < maxLength; step++) {
      angle += (Math.random() - 0.5) * 2 * Math.PI * (1 - config.angularPersistence);
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      currentRow += dy;
      currentCol += dx;

      // Correctly call getNeuronAt
      const targetNeuron = getNeuronAt(Math.round(currentRow), Math.round(currentCol));
      if (!targetNeuron) break;

      if (targetNeuron.recentActivity > config.obstacleAvoidanceSensitivity && !targetNeuron.isText) {
        angle += Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
        currentRow -= dy; 
        currentCol -= dx;
        step--; 
        continue;
      }
      path.push({ row: Math.round(currentRow), col: Math.round(currentCol), neuron: targetNeuron });

      if (Math.random() < config.bifurcationProbability && step < maxLength - 2 && path.length > 0) {
        const branchPath = [];
        let branchAngle = angle + (Math.random() - 0.5) * Math.PI / 2;
        let branchRow = path[path.length-1].neuron.row;
        let branchCol = path[path.length-1].neuron.col;

        for (let branchStep = 0; branchStep < Math.max(1, maxLength - step - 1) ; branchStep++) {
          branchAngle += (Math.random() - 0.5) * 2 * Math.PI * (1 - config.angularPersistence);
          branchRow += Math.sin(branchAngle);
          branchCol += Math.cos(branchAngle);
          // Correctly call getNeuronAt
          const branchNeuron = getNeuronAt(Math.round(branchRow), Math.round(branchCol));
          if (!branchNeuron) break;
           if (branchNeuron.recentActivity > config.obstacleAvoidanceSensitivity && !branchNeuron.isText) {
             branchAngle += Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
             branchStep--;
             continue;
           }
          branchPath.push({ row: Math.round(branchRow), col: Math.round(branchCol), neuron: branchNeuron });
        }
        if (branchPath.length > 0) {
          paths.push({
            path: branchPath,
            attenuation: config.branchAttenuationBase + Math.random() * config.branchAttenuationRandomFactor,
            isBranch: true,
          });
        }
      }
    }
    if (path.length > 0) {
      paths.push({
        path: path,
        attenuation: config.mainAttenuationBase + Math.random() * config.mainAttenuationRandomFactor,
        isBranch: false,
      });
    }
  }
  return paths;
}

/** Updates the state of a single neuron (potential, refractory period, firing). */
// Takes the grid context ref for generateAxonPaths
function updateNeuronState(neuron, timestamp, activeSignalsList, localGridContextRef) {
  const config = NEURAL_CONFIG.neuron;
  const axonConfig = NEURAL_CONFIG.axon;

  if (neuron.isText) return;

  if (neuron.refractory > 0) neuron.refractory -= 0.02;
  neuron.potential *= config.potentialDecayRate;
  neuron.recentActivity *= config.recentActivityDecayRate;

  const canFire = neuron.refractory <= 0;
  const firesSpontaneously = canFire && Math.random() < config.spontaneousFireProbability;
  const firesFromPotential = canFire && neuron.potential >= config.firingThreshold;

  if (firesSpontaneously || firesFromPotential) {
    if (firesSpontaneously && !firesFromPotential) neuron.potential = config.firingThreshold;
    
    neuron.lastFired = timestamp;
    neuron.refractory = config.refractoryPeriodBase + Math.random() * config.refractoryPeriodRandomFactor;
    neuron.recentActivity = 1;

    // Pass the localGridContextRef to generateAxonPaths
    const newAxonPaths = generateAxonPaths(neuron, localGridContextRef);
    newAxonPaths.forEach(({ path, attenuation, isBranch }) => {
      activeSignalsList.push({
        path: path,
        position: 0,
        strength: isBranch ? axonConfig.branchSignalStrengthFactor : 1.0,
        attenuation: attenuation,
        velocity: axonConfig.signalVelocity,
        sourceNeuron: neuron,
      });
    });
    neuron.potential = 0;
  }
}

/** Updates a signal's position, renders it, and delivers potential. Returns true if signal finished. */
function updateAndRenderSignal(signal, ctx, dotRadius) {
  const visualConfig = NEURAL_CONFIG.visuals;

  signal.position += signal.velocity;
  const pathIndex = Math.floor(signal.position);

  if (pathIndex >= signal.path.length) return true;

  const currentSegmentStart = signal.path[pathIndex];
  const progressInSegment = signal.position - pathIndex;
  let x, y;

  if (pathIndex < signal.path.length - 1) {
    const currentSegmentEnd = signal.path[pathIndex + 1];
    x = currentSegmentStart.neuron.x + (currentSegmentEnd.neuron.x - currentSegmentStart.neuron.x) * progressInSegment;
    y = currentSegmentStart.neuron.y + (currentSegmentEnd.neuron.y - currentSegmentStart.neuron.y) * progressInSegment;
  } else {
    x = currentSegmentStart.neuron.x;
    y = currentSegmentStart.neuron.y;
  }

  const intensity = signal.strength * signal.attenuation * (1 - (pathIndex + progressInSegment) / signal.path.length);
  const gradientRadius = dotRadius * visualConfig.signalGlowFactor;
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, gradientRadius);

  const rVal = visualConfig.signalColor.rBase + visualConfig.signalColor.rIntensityFactor * intensity;
  const gVal = visualConfig.signalColor.gBase + visualConfig.signalColor.gIntensityFactor * intensity;
  const bVal = visualConfig.signalColor.bBase + visualConfig.signalColor.bIntensityFactor * intensity;

  gradient.addColorStop(0, `rgba(${Math.floor(rVal)}, ${Math.floor(gVal)}, ${Math.floor(bVal)}, ${Math.max(0, intensity)})`);
  gradient.addColorStop(1, `rgba(${Math.floor(visualConfig.signalColor.rBase)}, ${Math.floor(visualConfig.signalColor.gBase)}, ${Math.floor(visualConfig.signalColor.bBase)}, 0)`);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, gradientRadius, 0, Math.PI * 2);
  ctx.fill();

  if (pathIndex === signal.path.length - 1 && progressInSegment >= 1.0) {
    const targetNeuron = currentSegmentStart.neuron;
    if (targetNeuron && !targetNeuron.isText) {
        targetNeuron.potential = Math.min(
            targetNeuron.potential + signal.strength * signal.attenuation,
            NEURAL_CONFIG.neuron.firingThreshold * 1.5
        );
    }
    return true;
  }
  return false;
}

/** Renders a single neuron on the canvas. */
function renderNeuron(neuron, ctx, dotRadius, timestamp) {
  const { x, y, potential, isText, textValue, textPhase } = neuron;
  const visualConfig = NEURAL_CONFIG.visuals;
  const neuronConfig = NEURAL_CONFIG.neuron;

  if (isText && textValue) {
    const blinkIntensity = visualConfig.textColor.baseIntensity +
                           visualConfig.textColor.blinkAmplitude * Math.sin(timestamp * visualConfig.textColor.blinkSpeed + (textPhase || 0));
    const brightness = Math.floor(255 * Math.max(0, Math.min(1, blinkIntensity)));
    ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
  } else {
    const intensity = Math.min(1, potential / Math.max(0.01, neuronConfig.firingThreshold));
    const rVal = visualConfig.neuronPotentialColorIntensity * intensity * 0.2;
    const gVal = visualConfig.neuronPotentialColorIntensity * intensity * 0.8;
    const bVal = visualConfig.neuronPotentialColorIntensity * intensity;
    ctx.fillStyle = `rgb(${Math.floor(rVal)}, ${Math.floor(gVal)}, ${Math.floor(bVal)})`;
  }
  ctx.beginPath();
  ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
  ctx.fill();
}

// --- React Component ---
// Moved gridContextRef inside the component to use useRef for its standard behavior
// It will persist across re-renders of NeuralWaveVisualization.
export default function NeuralWaveVisualization() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  // Initialize gridContextRef here. Its .current property will hold our simulation state.
  const gridContextRef = useRef({
    neurons: [],
    activeSignals: [],
    cols: 0,
    rows: 0,
    dotSpacing: 0,
    dotRadius: 0,
    getNeuronAt: (row, col) => null, // Initial placeholder
  });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Effect for handling window resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Main effect for simulation initialization and animation loop
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const canvas = canvasRef.current;
    const ctx = setupCanvas(canvas, dimensions.width, dimensions.height);

    const currentDotSpacing = dimensions.width / NEURAL_CONFIG.grid.dotsPerRow;
    const currentDotRadius = currentDotSpacing * NEURAL_CONFIG.visuals.dotRadiusFactor;
    const currentColCount = Math.ceil(dimensions.width / currentDotSpacing);
    const currentRowCount = Math.ceil(dimensions.height / currentDotSpacing);

    const currentNeurons = initializeNeurons(currentRowCount, currentColCount, currentDotSpacing);
    const currentActiveSignals = [];
    
    // Define the actual getNeuronAt function for this specific grid setup
    const getNeuronAtDirect = (row, col) => {
      const r = Math.floor(row);
      const c = Math.floor(col);
      // Access grid dimensions and neurons from the *current* state of gridContextRef
      const currentContext = gridContextRef.current;
      if (r < 0 || r >= currentContext.rows || c < 0 || c >= currentContext.cols) return null;
      return currentContext.neurons[r * currentContext.cols + c];
    };
    
    // Update gridContextRef.current with all simulation elements
    // This object is what helper functions will access via gridContextRef.current
    gridContextRef.current = {
        neurons: currentNeurons,
        activeSignals: currentActiveSignals,
        cols: currentColCount,
        rows: currentRowCount,
        dotSpacing: currentDotSpacing,
        dotRadius: currentDotRadius,
        getNeuronAt: getNeuronAtDirect, // Store the actual function
    };
    
    // Pass the ref object itself. applyTextPattern will use .current internally.
    applyTextPattern(gridContextRef); 

    const animate = (timestamp) => {
      // Destructure directly from gridContextRef.current at the start of each animation frame
      // This ensures we always use the latest state for neurons, signals, etc.
      const {
        neurons,
        activeSignals, // This will be the array to push new signals into and filter
        dotRadius,
        // getNeuronAt is available via gridContextRef if needed directly here,
        // but helper functions will access it through the passed gridContextRef.
      } = gridContextRef.current;

      ctx.fillStyle = `rgba(0, 0, 0, ${NEURAL_CONFIG.visuals.trailEffectAlpha})`;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Pass the ref to functions that need access to its .current.getNeuronAt or other properties
      neurons.forEach(neuron => {
        updateNeuronState(neuron, timestamp, activeSignals, gridContextRef);
      });
      
      // Filter activeSignals in place on the ref's current object
      gridContextRef.current.activeSignals = activeSignals.filter(signal => {
          const signalFinished = updateAndRenderSignal(signal, ctx, dotRadius);
          return !signalFinished;
      });

      // Re-fetch neurons in case their state was updated (though renderNeuron primarily reads)
      gridContextRef.current.neurons.forEach(neuron => {
        renderNeuron(neuron, ctx, gridContextRef.current.dotRadius, timestamp);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => { // Cleanup function
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions]); // Rerun this effect if dimensions change
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 0.8; transform: translateY(0); }
        }
        .fade-in-line {
          opacity: 0;
          animation: fadeIn 2s forwards;
        }
        .email-link {
          color: inherit;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .email-link:hover {
          opacity: 1;
        }
      `}</style>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-indigo-300 font-mono text-lg tracking-wide text-center w-full max-w-2xl">
        <div className="fade-in-line" style={{ animationDelay: '0.15s' }}>
          this is what human thought looks like: sparse & complex
        </div>
        <div className="fade-in-line" style={{ animationDelay: '0.3s' }}>
          we use principles of neural information encoding
        </div>
        <div className="fade-in-line" style={{ animationDelay: '0.45s' }}>
          to develop biological learning models
        </div>
        <div className="fade-in-line" style={{ animationDelay: '0.6s' }}>
          on chips wired to human cells
        </div>
        <div className="fade-in-line" style={{ animationDelay: '0.75s' }}>
          <a 
            href="mailto:maxx@nanoneuro.systems" 
            className="underline decoration-indigo-500 hover:decoration-indigo-300 transition-colors duration-300 hover:text-indigo-100"
          >
            email us here
          </a>
        </div>
      </div>
    </div>
  );
}
