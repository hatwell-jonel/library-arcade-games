import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface NumberItem {
    x: number;
    y: number;
    value: number;
    radius: number;
}

type GamePhase = 'memorize' | 'recall' | 'transition';

interface GameState {
    numbers: NumberItem[];
    sequence: number[];
    currentIndex: number;
    level: number;
    showNumbers: boolean;
    phase: GamePhase;
    revealed: Set<number>;
}

const config = {
    canvasSize: { width: 450, height: 450 },
    baseHideTime: 3000,
    numberRadius: 30,
};

const MemoryGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('');
    const [showOverlay, setShowOverlay] = useState<{ visible: boolean; text: string }>({
        visible: false,
        text: '',
    });
    const gameStateRef = useRef<GameState>({
        numbers: [],
        sequence: [],
        currentIndex: 0,
        level: 1,
        showNumbers: true,
        phase: 'memorize',
        revealed: new Set(),
    });

    // Max numbers = 9
    const getNumberCount = (lvl: number) => Math.min(4 + lvl, 9);

    // Hide time decreases as level increases, min 500ms
    const getHideTime = (lvl: number) =>
        Math.max(500, config.baseHideTime - Math.floor((lvl - 1) / 1) * 500);

    const generateNumbers = (lvl: number) => {
        const count = getNumberCount(lvl);
        const numbers: NumberItem[] = [];
        const sequence: number[] = [];
        const padding = config.numberRadius * 2.5;

        for (let i = 0; i < count; i++) {
        let x: number, y: number, overlap: boolean;
        let attempts = 0;

        do {
            overlap = false;
            x = padding + Math.random() * (config.canvasSize.width - padding * 2);
            y = padding + Math.random() * (config.canvasSize.height - padding * 2);

            for (const num of numbers) {
            const dx = x - num.x;
            const dy = y - num.y;
            if (Math.sqrt(dx * dx + dy * dy) < config.numberRadius * 2.5) {
                overlap = true;
                break;
            }
            }
            attempts++;
        } while (overlap && attempts < 100);

        numbers.push({ x, y, value: i + 1, radius: config.numberRadius });
        sequence.push(i + 1);
        }

        return { numbers, sequence };
    };

    const startLevel = (lvl: number) => {
        const { numbers, sequence } = generateNumbers(lvl);
        gameStateRef.current = {
        numbers,
        sequence,
        currentIndex: 0,
        level: lvl,
        showNumbers: true,
        phase: 'memorize',
        revealed: new Set(),
        };
        setMessage('Memorize the sequence!');

        setTimeout(() => {
        gameStateRef.current.showNumbers = false;
        gameStateRef.current.phase = 'recall';
        setMessage('Click the numbers in order!');
        }, getHideTime(lvl));
    };

    const resetGame = () => {
        setLevel(1);
        setGameOver(false);
        setShowOverlay({ visible: false, text: '' });
        startLevel(1);
    };

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (gameOver || gameStateRef.current.phase !== 'recall') return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const state = gameStateRef.current;

        for (const num of state.numbers) {
            const distance = Math.hypot(x - num.x, y - num.y);
            if (distance <= num.radius) {
                const expected = state.sequence[state.currentIndex];
                if (num.value === expected) {
                    state.revealed.add(num.value);
                    state.currentIndex++;

                    if (state.currentIndex === state.sequence.length) {
                        const nextLevel = level + 1;
                        setLevel(nextLevel);
                        state.phase = 'transition';
                        setShowOverlay({ visible: true, text: `Get Ready! Level ${nextLevel}` });

                        setTimeout(() => {
                        setShowOverlay({ visible: false, text: '' });
                        startLevel(nextLevel);
                        }, 1500);
                    }
                } else {
                    setGameOver(true);
                    setMessage(`Wrong! Clicked ${num.value}, expected ${expected}`);
                }
                break;
            }
        }
    };

    useEffect(() => startLevel(1), []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const draw = () => {
            const state = gameStateRef.current;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, config.canvasSize.width, config.canvasSize.height);

            state.numbers.forEach((num, idx) => {
                // Show green hint only in level 1
                const isNext = state.phase === 'recall' && level === 1 && idx === state.currentIndex;
                ctx.fillStyle = isNext ? '#22c55e' : '#3b82f6';
                ctx.beginPath();
                ctx.arc(num.x, num.y, num.radius, 0, Math.PI * 2);
                ctx.fill();

                // Reveal numbers if memorizing, transitioning, or already correctly guessed
                if (state.showNumbers || state.phase === 'transition' || state.revealed.has(num.value)) {
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 24px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(num.value.toString(), num.x, num.y);
                }
            });

            if (!gameOver) animationId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationId);
    }, [gameOver, level]);

    return (
        <div className="relative flex flex-col items-center gap-4 p-4">
        <div className="flex gap-8 text-xl font-bold">
            <div>Level: {level}</div>
            <div>Numbers: {getNumberCount(level)}</div>
        </div>
        <div className="text-lg font-semibold text-blue-400 h-6">{message}</div>
        <canvas
            ref={canvasRef}
            width={config.canvasSize.width}
            height={config.canvasSize.height}
            className="border-2 border-gray-300 cursor-pointer"
            onClick={handleCanvasClick}
        />
        {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                <p className="text-xl font-bold text-red-500 mb-2">Game Over</p>
                <p className="text-lg text-white mb-4">Reached Level {level}</p>
                <Button onClick={resetGame}>Play Again</Button>
            </div>
        )}

        {showOverlay.visible && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
            <p className="text-2xl font-bold text-yellow-400">{showOverlay.text}</p>
            </div>
        )}

        <div className="text-sm text-center text-foreground max-w-md">
            <div>Memorize the numbers, then click them in sequence (1, 2, 3...)</div>
            <div className="mt-1 text-xs text-gray-400">Green circle = next number to click (level 1 only)</div>
        </div>
        </div>
    );
};

export default MemoryGame;
