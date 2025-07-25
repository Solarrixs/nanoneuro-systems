'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';

// --- Helper Functions ---

/** Initializes canvas properties for high DPI rendering and returns the 2D context. */
function setupCanvas(canvas, width, height) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
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
                recentActivity: 0,
                inExclusionZone: false,
            });
        }
    }
    return neurons;
}

/** Modifies neuron objects in the grid to form a text pattern. */
function applyTextPattern(localGridContextRef, NEURAL_CONFIG) {
    const { text, letters, letterWidth, letterHeight, exclusionRadius } = NEURAL_CONFIG.textPattern;
    const { cols, rows, getNeuronAt } = localGridContextRef.current;
    if (!text || Object.keys(letters).length === 0 || !cols || !rows || !getNeuronAt) return;

    const totalTextVisualWidth = text.length * letterWidth - (text.length > 0 ? 1 : 0);
    const startCol = Math.floor((cols - totalTextVisualWidth) / 2);
    const startRow = Math.floor(rows / 3);

    // Mark the exclusion zone
    const exclusionStartRow = startRow - exclusionRadius;
    const exclusionEndRow = startRow + letterHeight + exclusionRadius;
    const exclusionStartCol = startCol - exclusionRadius;
    const exclusionEndCol = startCol + totalTextVisualWidth + exclusionRadius;

    for (let r = exclusionStartRow; r <= exclusionEndRow; r++) {
        for (let c = exclusionStartCol; c <= exclusionEndCol; c++) {
            const neuron = getNeuronAt(r, c);
            if (neuron) {
                neuron.inExclusionZone = true;
            }
        }
    }

    // Apply the text pattern
    text.toLowerCase().split('').forEach((char, charIdx) => {
        const letterPattern = letters[char];
        if (letterPattern) {
            letterPattern.forEach((rowPattern, rowIndex) => {
                rowPattern.forEach((val, colPatternIndex) => {
                    if (val === 1) {
                        const neuron = getNeuronAt(
                            startRow + rowIndex,
                            startCol + charIdx * letterWidth + colPatternIndex
                        );
                        if (neuron) {
                            neuron.isText = true;
                            neuron.textValue = true;
                        }
                    }
                });
            });
        }
    });
}

/** Generates a set of axon paths originating from a given neuron. */
function generateAxonPaths(startNeuron, localGridContextRef, NEURAL_CONFIG) {
    const config = NEURAL_CONFIG.axon;
    const { getNeuronAt } = localGridContextRef.current;
    if (!getNeuronAt) return [];

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
                let branchRow = path[path.length - 1].neuron.row;
                let branchCol = path[path.length - 1].neuron.col;

                for (let branchStep = 0; branchStep < Math.max(1, maxLength - step - 1); branchStep++) {
                    branchAngle += (Math.random() - 0.5) * 2 * Math.PI * (1 - config.angularPersistence);
                    branchRow += Math.sin(branchAngle);
                    branchCol += Math.cos(branchAngle);
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
function updateNeuronState(neuron, timestamp, activeSignalsList, localGridContextRef, waveInfo, NEURAL_CONFIG) {
    const config = NEURAL_CONFIG.neuron;
    const axonConfig = NEURAL_CONFIG.axon;
    const waveConfig = NEURAL_CONFIG.wave;

    if (neuron.isText || neuron.inExclusionZone) return;

    if (neuron.refractory > 0) neuron.refractory -= 0.02;
    neuron.potential *= config.potentialDecayRate;
    neuron.recentActivity *= config.recentActivityDecayRate;

    const canFire = neuron.refractory <= 0;

    let firesFromWave = false;
    if (waveConfig.enabled && waveInfo.active && canFire) {
        const distance = Math.sqrt(
            Math.pow(neuron.x - waveInfo.centerX, 2) +
            Math.pow(neuron.y - waveInfo.centerY, 2)
        );
        const waveRadius = waveInfo.progress * Math.max(waveInfo.maxRadius, 0);
        const waveThickness = 50;
        if (Math.abs(distance - waveRadius) < waveThickness) {
            firesFromWave = Math.random() < waveConfig.probability;
        }
    }

    const firesSpontaneously = canFire && Math.random() < config.spontaneousFireProbability;
    const firesFromPotential = canFire && neuron.potential >= config.firingThreshold;

    if (firesSpontaneously || firesFromPotential || firesFromWave) {
        if ((firesSpontaneously || firesFromWave) && !firesFromPotential) {
            neuron.potential = config.firingThreshold;
        }

        neuron.lastFired = timestamp;
        neuron.refractory = config.refractoryPeriodBase + Math.random() * config.refractoryPeriodRandomFactor;
        neuron.recentActivity = 1;

        const newAxonPaths = generateAxonPaths(neuron, localGridContextRef, NEURAL_CONFIG);
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

/** Updates a signal's position, renders it, and delivers potential. Returns true if signal is finished. */
function updateAndRenderSignal(signal, ctx, dotRadius, NEURAL_CONFIG) {
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

    ctx.fillStyle = `rgba(200, 220, 255, ${Math.max(0, Math.min(1, intensity * 0.8))})`;
    ctx.beginPath();
    ctx.arc(x, y, dotRadius * 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, intensity))})`;
    ctx.beginPath();
    ctx.arc(x, y, dotRadius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    if (pathIndex === signal.path.length - 1 && progressInSegment >= 1.0) {
        const targetNeuron = currentSegmentStart.neuron;
        if (targetNeuron && !targetNeuron.isText && !targetNeuron.inExclusionZone) {
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
function renderNeuron(neuron, ctx, dotRadius, NEURAL_CONFIG) {
    const { x, y, potential, isText, textValue } = neuron;
    const visualConfig = NEURAL_CONFIG.visuals;
    const neuronConfig = NEURAL_CONFIG.neuron;

    if (isText && textValue) {
        ctx.fillStyle = 'rgb(220, 220, 220)';
    } else if (!isText && potential > 0.01) {
        const intensity = Math.min(1, potential / Math.max(0.01, neuronConfig.firingThreshold));
        const rVal = visualConfig.neuronPotentialColorIntensity * intensity * 0.2;
        const gVal = visualConfig.neuronPotentialColorIntensity * intensity * 0.8;
        const bVal = visualConfig.neuronPotentialColorIntensity * intensity;
        ctx.fillStyle = `rgb(${Math.floor(rVal)}, ${Math.floor(gVal)}, ${Math.floor(bVal)})`;
    } else {
        // Don't render non-text neurons with negligible potential to improve performance.
        return;
    }

    ctx.beginPath();
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
}

// --- React Component ---
export default function NeuralWaveVisualization() {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const gridContextRef = useRef({
        neurons: [],
        activeSignals: [],
        cols: 0,
        rows: 0,
        dotSpacing: 0,
        dotRadius: 0,
        getNeuronAt: () => null,
    });
    // --- CHANGE: Use a ref for waveInfo to allow modification from event handlers ---
    const waveInfoRef = useRef({
        active: false,
        startTime: 0,
        progress: 0,
        centerX: 0,
        centerY: 0,
        maxRadius: 0,
        lastWaveTime: 0,
    });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const NEURAL_CONFIG = useMemo(() => ({
        grid: { dotsPerRow: 80 },
        neuron: {
            spontaneousFireProbability: 0.00002,
            firingThreshold: 0.65,
            potentialDecayRate: 0.92,
            refractoryPeriodBase: 3.0,
            refractoryPeriodRandomFactor: 2.0,
            recentActivityDecayRate: 0.98,
        },
        axon: {
            signalVelocity: 0.1,
            numAxonsMin: 3,
            numAxonsRandomFactor: 2,
            longRangeProbability: 0.3,
            shortMaxLengthBase: 4,
            shortMaxLengthRandomFactor: 4,
            longMaxLengthBase: 10,
            longMaxLengthRandomFactor: 8,
            angularPersistence: 0.7,
            bifurcationProbability: 0.15,
            mainAttenuationBase: 0.1,
            mainAttenuationRandomFactor: 0.2,
            branchAttenuationBase: 0.3,
            branchAttenuationRandomFactor: 0.3,
            branchSignalStrengthFactor: 0.7,
            obstacleAvoidanceSensitivity: 0.3,
        },
        visuals: {
            dotRadiusFactor: 0.08,
            trailEffectAlpha: 0.15,
            neuronPotentialColorIntensity: 180,
        },
        wave: {
            enabled: true,
            interval: 8000,
            duration: 1500,
            probability: 0.02,
            direction: 'radial',
        },
        textPattern: {
            text: 'ENGRAM',
            letterWidth: 6,
            letterHeight: 7,
            exclusionRadius: 8,
            letters: {
                'e': [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
                'n': [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
                'g': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
                'r': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
                'a': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
                'm': [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
            },
        }
    }), []);

    // Effect for handling window resize
    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
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

        const getNeuronAtDirect = (row, col) => {
            const r = Math.floor(row);
            const c = Math.floor(col);
            const currentContext = gridContextRef.current;
            if (r < 0 || r >= currentContext.rows || c < 0 || c >= currentContext.cols) return null;
            return currentContext.neurons[r * currentContext.cols + c];
        };

        gridContextRef.current = {
            neurons: currentNeurons,
            activeSignals: [],
            cols: currentColCount,
            rows: currentRowCount,
            dotSpacing: currentDotSpacing,
            dotRadius: currentDotRadius,
            getNeuronAt: getNeuronAtDirect,
        };

        applyTextPattern(gridContextRef, NEURAL_CONFIG);

        // --- CHANGE: Initialize waveInfoRef ---
        waveInfoRef.current = {
            ...waveInfoRef.current,
            centerX: dimensions.width / 2,
            centerY: dimensions.height / 2,
            maxRadius: Math.max(dimensions.width, dimensions.height),
            lastWaveTime: performance.now(), // Use performance.now() for high-precision timing
        };

        const animate = (timestamp) => {
            // --- CHANGE: Use waveInfoRef.current for state ---
            const waveInfo = waveInfoRef.current;
            const { neurons, activeSignals, dotRadius } = gridContextRef.current;

            if (NEURAL_CONFIG.wave.enabled) {
                if (!waveInfo.active && timestamp - waveInfo.lastWaveTime > NEURAL_CONFIG.wave.interval) {
                    waveInfo.active = true;
                    waveInfo.startTime = timestamp;
                    waveInfo.progress = 0;
                    waveInfo.lastWaveTime = timestamp; // Reset timer for automatic wave
                    waveInfo.centerX = Math.random() * dimensions.width;
                    waveInfo.centerY = Math.random() < 0.5 ?
                        dimensions.height * 0.1 + Math.random() * dimensions.height * 0.15 :
                        dimensions.height * 0.7 + Math.random() * dimensions.height * 0.25;
                }

                if (waveInfo.active) {
                    waveInfo.progress = (timestamp - waveInfo.startTime) / NEURAL_CONFIG.wave.duration;
                    if (waveInfo.progress > 1) {
                        waveInfo.active = false;
                    }
                }
            }

            ctx.fillStyle = `rgba(0, 0, 0, ${NEURAL_CONFIG.visuals.trailEffectAlpha})`;
            ctx.fillRect(0, 0, dimensions.width, dimensions.height);

            neurons.forEach(neuron => {
                updateNeuronState(neuron, timestamp, activeSignals, gridContextRef, waveInfo, NEURAL_CONFIG);
            });

            gridContextRef.current.activeSignals = activeSignals.filter(signal => {
                const signalFinished = updateAndRenderSignal(signal, ctx, dotRadius, NEURAL_CONFIG);
                return !signalFinished;
            });

            gridContextRef.current.neurons.forEach(neuron => {
                renderNeuron(neuron, ctx, gridContextRef.current.dotRadius, NEURAL_CONFIG);
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [dimensions, NEURAL_CONFIG]);

    // --- CHANGE: Add click handler for manual wave propagation ---
    const handleCanvasClick = (event) => {
        const waveInfo = waveInfoRef.current;
        const timestamp = performance.now();

        // Trigger a new wave at the click position
        waveInfo.active = true;
        waveInfo.startTime = timestamp;
        waveInfo.progress = 0;
        waveInfo.centerX = event.clientX;
        waveInfo.centerY = event.clientY;

        // Reset the timer for the next automatic wave
        waveInfo.lastWaveTime = timestamp;
    };

    return (
        <div
            className="relative w-full h-screen overflow-hidden bg-black cursor-pointer"
            onClick={handleCanvasClick} // Attach click handler
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0"
            />
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-blue-300 font-mono text-[8px] xs:text-[10px] sm:text-sm md:text-base tracking-wide text-center w-[90%] sm:w-full max-w-2xl px-2 sm:px-4 whitespace-nowrap">
                <div className="fade-in-line" style={{ animation: 'fadeIn 2s 0.15s forwards' }}>
                    this is what human thought looks like: sparse & complex
                </div>
                <div className="fade-in-line" style={{ animation: 'fadeIn 2s 0.3s forwards' }}>
                    we use principles of neural information encoding
                </div>
                <div className="fade-in-line" style={{ animation: 'fadeIn 2s 0.45s forwards' }}>
                    to develop biological learning models
                </div>
                <div className="fade-in-line" style={{ animation: 'fadeIn 2s 0.6s forwards' }}>
                    on chips wired to human cells
                </div>
                <div className="fade-in-line" style={{ animation: 'fadeIn 2s 0.75s forwards' }}>
                    <a
                        href="mailto:maxx@engramcompute.com"
                        className="underline decoration-blue-300/50 hover:decoration-blue-300 transition-colors duration-300 hover:text-blue-100"
                    >
                        email us here
                    </a>
                </div>
            </div>
            {/* Using a style tag for keyframes is fine, but CSS-in-JS or a separate CSS module can be more scalable */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 0.8; transform: translateY(0); }
                }
                .fade-in-line {
                    opacity: 0;
                }
            `}</style>
        </div>
    );
}