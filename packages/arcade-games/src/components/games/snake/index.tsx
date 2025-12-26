import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type GamePhase = 'playing' | 'paused' | 'gameover';
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Position {
    x: number;
    y: number;
}

interface GameState {
    snake: Position[];
    food: Position;
    bonusFood: Position[];
    direction: Direction;
    nextDirection: Direction;
    score: number;
    speed: number;
    phase: GamePhase;
}

const config = {
    gridSize: 20,
    cellSize: 20,
    initialSpeed: 150,
    speedIncrement: 5,
};

const SnakeGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [message, setMessage] = useState('Use arrow keys or WASD to play!');
    const [showOverlay, setShowOverlay] = useState<{ visible: boolean; text: string }>({
        visible: false,
        text: '',
    });

    const gameStateRef = useRef<GameState>({
        snake: [{ x: 10, y: 10 }],
        food: { x: 15, y: 15 },
        bonusFood: [],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        score: 0,
        speed: config.initialSpeed,
        phase: 'playing',
    });

    const generateFood = (snake: Position[]): Position => {
        let food: Position;
        do {
            food = {
                x: Math.floor(Math.random() * config.gridSize),
                y: Math.floor(Math.random() * config.gridSize),
            };
        } while (snake.some((seg) => seg.x === food.x && seg.y === food.y));
        return food;
    };

    const generateBonusFood = (snake: Position[], regularFood: Position, count: number = 3): Position[] => {
        const bonusFood: Position[] = [];
        for (let i = 0; i < count; i++) {
            let food: Position;
            do {
                food = {
                    x: Math.floor(Math.random() * config.gridSize),
                    y: Math.floor(Math.random() * config.gridSize),
                };
            } while (
                snake.some((seg) => seg.x === food.x && seg.y === food.y) ||
                (food.x === regularFood.x && food.y === regularFood.y) ||
                bonusFood.some((bf) => bf.x === food.x && bf.y === food.y)
            );
            bonusFood.push(food);
        }
        return bonusFood;
    };

    const initGame = () => {
        const initialSnake = [{ x: 10, y: 10 }];
        gameStateRef.current = {
            snake: initialSnake,
            food: generateFood(initialSnake),
            bonusFood: [],
            direction: 'RIGHT',
            nextDirection: 'RIGHT',
            score: 0,
            speed: config.initialSpeed,
            phase: 'playing',
        };
        setMessage('Use arrow keys or WASD to play!');
    };

    const checkCollision = (head: Position, snake: Position[]): boolean => {
        // Only self collision (no wall collision - wrap around instead)
        return snake.some((seg) => seg.x === head.x && seg.y === head.y);
    };

    const moveSnake = () => {
        const state = gameStateRef.current;
        if (state.phase !== 'playing') return;

        state.direction = state.nextDirection;

        const head = { ...state.snake[0] };

        switch (state.direction) {
            case 'UP':
                head.y -= 1;
                break;
            case 'DOWN':
                head.y += 1;
                break;
            case 'LEFT':
                head.x -= 1;
                break;
            case 'RIGHT':
                head.x += 1;
                break;
        }

        // Wrap around edges
        if (head.x < 0) head.x = config.gridSize - 1;
        if (head.x >= config.gridSize) head.x = 0;
        if (head.y < 0) head.y = config.gridSize - 1;
        if (head.y >= config.gridSize) head.y = 0;

        if (checkCollision(head, state.snake)) {
            state.phase = 'gameover';
            setShowOverlay({ visible: true, text: 'Game Over! 💀' });
            return;
        }

        const newSnake = [head, ...state.snake];
        let ateFood = false;

        // Check if regular food eaten
        if (head.x === state.food.x && head.y === state.food.y) {
            state.score += 10;
            state.speed = Math.max(50, state.speed - config.speedIncrement);
            state.food = generateFood(newSnake);
            ateFood = true;
            setMessage(`Score: ${state.score} 🍎`);

            // Generate bonus food every 50 points
            if (state.score % 50 === 0 && state.score > 0) {
                state.bonusFood = generateBonusFood(newSnake, state.food);
                setMessage(`Score: ${state.score} 🍎 BONUS FOOD! ⭐`);
            }
        }

        // Check if bonus food eaten
        const bonusFoodIndex = state.bonusFood.findIndex(
            (bf) => bf.x === head.x && bf.y === head.y
        );
        if (bonusFoodIndex !== -1) {
            state.score += 10;
            state.bonusFood.splice(bonusFoodIndex, 1);
            ateFood = true;
            setMessage(`Score: ${state.score} ⭐ Bonus!`);
        }

        if (!ateFood) {
            newSnake.pop();
        }

        state.snake = newSnake;
    };

    const handleDirectionChange = (newDirection: Direction) => {
        const state = gameStateRef.current;
        const opposites: Record<Direction, Direction> = {
            UP: 'DOWN',
            DOWN: 'UP',
            LEFT: 'RIGHT',
            RIGHT: 'LEFT',
        };

        if (opposites[state.direction] !== newDirection) {
            state.nextDirection = newDirection;
        }
    };

    const togglePause = () => {
        const state = gameStateRef.current;
        if (state.phase === 'playing') {
            state.phase = 'paused';
            setMessage('Game Paused');
        } else if (state.phase === 'paused') {
            state.phase = 'playing';
            setMessage('Use arrow keys or WASD to play!');
        }
    };

    const resetGame = () => {
        setShowOverlay({ visible: false, text: '' });
        initGame();
    };

    useEffect(() => {
        initGame();

        const onKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            
            if (key === ' ') {
                e.preventDefault();
                togglePause();
                return;
            }

            if (gameStateRef.current.phase !== 'playing') return;

            switch (key) {
                case 'arrowup':
                case 'w':
                    e.preventDefault();
                    handleDirectionChange('UP');
                    break;
                case 'arrowdown':
                case 's':
                    e.preventDefault();
                    handleDirectionChange('DOWN');
                    break;
                case 'arrowleft':
                case 'a':
                    e.preventDefault();
                    handleDirectionChange('LEFT');
                    break;
                case 'arrowright':
                case 'd':
                    e.preventDefault();
                    handleDirectionChange('RIGHT');
                    break;
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // Game loop
    useEffect(() => {
        const interval = setInterval(() => {
            moveSnake();
        }, gameStateRef.current.speed);

        return () => clearInterval(interval);
    }, []);

    // Drawing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const draw = () => {
            const state = gameStateRef.current;
            const width = config.gridSize * config.cellSize;
            const height = config.gridSize * config.cellSize;

            // Background
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, width, height);

            // Grid
            ctx.strokeStyle = '#16213e';
            ctx.lineWidth = 1;
            for (let i = 0; i <= config.gridSize; i++) {
                ctx.beginPath();
                ctx.moveTo(i * config.cellSize, 0);
                ctx.lineTo(i * config.cellSize, height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * config.cellSize);
                ctx.lineTo(width, i * config.cellSize);
                ctx.stroke();
            }

            // Food
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(
                state.food.x * config.cellSize + config.cellSize / 2,
                state.food.y * config.cellSize + config.cellSize / 2,
                config.cellSize / 2 - 2,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Bonus Food (star-shaped)
            state.bonusFood.forEach((bf) => {
                ctx.fillStyle = '#fbbf24';
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2;
                
                const centerX = bf.x * config.cellSize + config.cellSize / 2;
                const centerY = bf.y * config.cellSize + config.cellSize / 2;
                const outerRadius = config.cellSize / 2 - 2;
                const innerRadius = outerRadius / 2;
                const points = 5;
                
                ctx.beginPath();
                for (let i = 0; i < points * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (Math.PI * i) / points - Math.PI / 2;
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            });

            // Snake
            state.snake.forEach((seg, idx) => {
                if (idx === 0) {
                    // Head
                    ctx.fillStyle = '#22c55e';
                } else {
                    // Body
                    ctx.fillStyle = '#16a34a';
                }
                ctx.fillRect(
                    seg.x * config.cellSize + 1,
                    seg.y * config.cellSize + 1,
                    config.cellSize - 2,
                    config.cellSize - 2
                );
            });

            animationId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationId);
    }, []);

    const state = gameStateRef.current;
    const canvasSize = config.gridSize * config.cellSize;

    return (
        <div className="relative flex flex-col items-center gap-4 p-4 max-w-xl mx-auto">
            <div className="text-3xl font-bold text-green-500">🐍 Snake Game</div>

            <div className="flex gap-8 text-lg">
                <div className="text-yellow-400">
                    Score: <span className="font-bold">{state.score}</span>
                </div>
                <div className="text-blue-400">
                    Length: <span className="font-bold">{state.snake.length}</span>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                width={canvasSize}
                height={canvasSize}
                className="border-4 border-green-600 rounded-lg shadow-xl"
            />

            <div className="flex gap-2">
                <Button onClick={togglePause} variant="outline" disabled={state.phase === 'gameover'}>
                    {state.phase === 'paused' ? 'Resume' : 'Pause'}
                </Button>
                <Button onClick={resetGame} variant="outline">
                    Restart
                </Button>
            </div>

            <div className="text-sm text-center text-blue-400 h-5">{message}</div>

            {/* Touch controls for mobile */}
            <div className="grid grid-cols-3 gap-2 w-48">
                <div></div>
                <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleDirectionChange('UP')}
                    disabled={state.phase !== 'playing'}
                    className="text-2xl"
                >
                    ↑
                </Button>
                <div></div>
                <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleDirectionChange('LEFT')}
                    disabled={state.phase !== 'playing'}
                    className="text-2xl"
                >
                    ←
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleDirectionChange('DOWN')}
                    disabled={state.phase !== 'playing'}
                    className="text-2xl"
                >
                    ↓
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleDirectionChange('RIGHT')}
                    disabled={state.phase !== 'playing'}
                    className="text-2xl"
                >
                    →
                </Button>
            </div>

            {showOverlay.visible && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg">
                    <p className="text-4xl font-bold mb-4 text-red-500">{showOverlay.text}</p>
                    <p className="mb-2 text-xl text-gray-300">
                        Final Score: <strong className="text-yellow-400">{state.score}</strong>
                    </p>
                    <p className="mb-6 text-lg text-gray-300">
                        Length: <strong className="text-green-400">{state.snake.length}</strong>
                    </p>
                    <Button onClick={resetGame} size="lg" className="bg-green-600 hover:bg-green-700">
                        Play Again
                    </Button>
                </div>
            )}

            <div className="text-xs text-center text-gray-400 max-w-md">
                Arrow keys or WASD to move • Space to pause • Red apple = +10 pts • Golden star = +10 pts (every 50 pts)
            </div>
        </div>
    );
};

export default SnakeGame;