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

const buttonOutlineStyle = {
    border: '1px solid white',
    padding: '10px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: 'white',
}

const SnakeGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [score, setScore] = useState(0);
    const [length, setLength] = useState(1);
    const [phase, setPhase] = useState<GamePhase>('playing');
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

    // Generate food
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
        setScore(0);
        setLength(initialSnake.length);
        setPhase('playing');
        setMessage('Use arrow keys or WASD to play!');
        setShowOverlay({ visible: false, text: '' });
    };

    const checkCollision = (head: Position, snake: Position[]): boolean => {
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
        setPhase('gameover');
        setShowOverlay({ visible: true, text: 'Game Over! 💀' });
        return;
        }

        const newSnake = [head, ...state.snake];
        let ateFood = false;

        // Regular food
        if (head.x === state.food.x && head.y === state.food.y) {
        state.score += 10;
        state.speed = Math.max(50, state.speed - config.speedIncrement);
        state.food = generateFood(newSnake);
        ateFood = true;
        setScore(state.score);

        if (state.score % 50 === 0 && state.score > 0) {
            state.bonusFood = generateBonusFood(newSnake, state.food);
            setMessage(`Score: ${state.score} 🍎 BONUS FOOD! ⭐`);
        }
        }

        // Bonus food
        const bonusFoodIndex = state.bonusFood.findIndex((bf) => bf.x === head.x && bf.y === head.y);
        if (bonusFoodIndex !== -1) {
        state.score += 10;
        state.bonusFood.splice(bonusFoodIndex, 1);
        ateFood = true;
        setScore(state.score);
        setMessage(`Score: ${state.score} ⭐ Bonus!`);
        }

        if (!ateFood) newSnake.pop();

        state.snake = newSnake;
        setLength(newSnake.length);
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
        setPhase('paused');
        setMessage('Game Paused');
        } else if (state.phase === 'paused') {
        state.phase = 'playing';
        setPhase('playing');
        setMessage('Use arrow keys or WASD to play!');
        }
    };

    const resetGame = () => {
        initGame();
    };

    // Key events
    useEffect(() => {
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
        const interval = setInterval(() => moveSnake(), gameStateRef.current.speed);
        return () => clearInterval(interval);
    }, []);

    // Canvas drawing
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

        // Food 🍎
        ctx.font = `${config.cellSize}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            '🍎',
            state.food.x * config.cellSize + config.cellSize / 2,
            state.food.y * config.cellSize + config.cellSize / 2
        );

        // Bonus Food ⭐
        state.bonusFood.forEach((bf) => {
            ctx.fillText(
            '⭐',
            bf.x * config.cellSize + config.cellSize / 2,
            bf.y * config.cellSize + config.cellSize / 2
            );
        });

        // Snake
        state.snake.forEach((seg, idx) => {
            ctx.fillStyle = idx === 0 ? '#22c55e' : '#16a34a';
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

    const canvasSize = config.gridSize * config.cellSize;

    return (
        <div className="relative flex flex-col items-center gap-4 p-4 max-w-xl mx-auto bg-gray-800">
        {/* Title */}
        <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#22c55e' }}>🐍 Snake Game</div>

        {/* HUD */}
        <div className="flex gap-8 text-lg">
            <div style={{ color: '#facc15' }}>Score: <strong>{score}</strong></div>
            <div style={{ marginInline: '3px', color: 'white' }}>|</div>
            <div style={{ color: '#60a5fa' }}>Length: <strong>{length}</strong></div>
        </div>

        {/* Canvas */}
        <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            className="border-4 border-green-600 rounded-lg shadow-xl"
        />

        {/* Controls */}
        <div className="flex gap-2">
            <Button onClick={togglePause}  disabled={phase === 'gameover'} style={buttonOutlineStyle}>
                {phase === 'paused' ? 'Resume' : 'Pause'}
            </Button>
            <Button onClick={resetGame}
                style={buttonOutlineStyle
}
    
            >
                Restart
            </Button>
        </div>

        <div className="text-sm text-center text-white h-5">{message}</div>

        {/* Touch controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', width: '12rem' }}>
            <div></div>
            <Button style={buttonOutlineStyle}  onClick={() => handleDirectionChange('UP')} disabled={phase !== 'playing'}>
                ↑
            </Button>
            <div></div>
            <Button style={buttonOutlineStyle}  onClick={() => handleDirectionChange('LEFT')} disabled={phase !== 'playing'}>
                ←
            </Button>
            <Button  style={buttonOutlineStyle} onClick={() => handleDirectionChange('DOWN')} disabled={phase !== 'playing'}>
                ↓
            </Button>
            <Button  style={buttonOutlineStyle} onClick={() => handleDirectionChange('RIGHT')} disabled={phase !== 'playing'}>
                →
            </Button>
        </div>

        {/* Overlay */}
        {showOverlay.visible && (
            <div style={{
            position: 'absolute',
            top: 0, right: 0, bottom: 0, left: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderRadius: '0.5rem'
            }}>
            <p style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '1rem', color: '#ef4444' }}>
                {showOverlay.text}
            </p>
            <p style={{ marginBottom: '0.5rem', fontSize: '1.25rem', color: '#d1d5db' }}>
                Final Score: <strong style={{ color: '#facc15' }}>{score}</strong>
            </p>
            <p style={{ marginBottom: '1.5rem', fontSize: '1.125rem', color: '#d1d5db' }}>
                Length: <strong style={{ color: '#4ade80' }}>{length}</strong>
            </p>
            <Button onClick={resetGame} size="lg" style={{ backgroundColor: '#16a34a', color: 'white' }}>
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
