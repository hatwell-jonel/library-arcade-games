import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface Position {
    x: number;
    y: number;
}

interface Enemy extends Position {
    radius: number;
}

interface Player extends Position {
    width: number;
    height: number;
}

interface SpaceDodgerState {
    player: Player;
    enemies: Enemy[];
    frame: number;
    keys: Record<string, boolean>;
}


const config = {
    canvasSize : { 
        width: 450, 
        height: 450 
    },
    player: { x: 200, y: 350, width: 25, height: 50 }
}


const buttonOutlineStyle = {
    border: '1px solid white',
    padding: '10px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: 'white',
}

const SpaceDodger: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scoreRef = useRef(0);
    const lastBatchScoreRef = useRef(0);

    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const gameStateRef = useRef<SpaceDodgerState>({
        player: config.player,
        enemies: [],
        frame: 0,
        keys: {}
    });

    const resetGame = () => {
        gameStateRef.current = {
            player: config.player,
            enemies: [],
            frame: 0,
            keys: {}
        };
        scoreRef.current = 0;
        lastBatchScoreRef.current = 0;
        setScore(0);
        setGameOver(false);
    };

    const handleDirectionPress = (direction: string, pressed: boolean) => {
        gameStateRef.current.keys[direction] = pressed;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const state = gameStateRef.current;

        const handleKeyDown = (e: KeyboardEvent) => {
            state.keys[e.key] = true;
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            state.keys[e.key] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const randomRadius = () => 10 + Math.random() * 15;

        const getEnemySpeed = () => {
            const base = 3;
            const increase = Math.floor(scoreRef.current / 20) * 0.5;
            return base + increase;
        };

        let animationId: number;

        const gameLoop = () => {
            if (gameOver) return;

            state.frame++;

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, config.canvasSize.width, config.canvasSize.height);

            // Player movement
            if (state.keys['ArrowLeft'] && state.player.x > 0) state.player.x -= 5;
            if (state.keys['ArrowRight'] && state.player.x < config.canvasSize.width - state.player.width) state.player.x += 5;
            if (state.keys['ArrowUp'] && state.player.y > 0) state.player.y -= 5;
            if (state.keys['ArrowDown'] && state.player.y < config.canvasSize.height - state.player.height) state.player.y += 5;

            // Draw player
            ctx.fillStyle = '#0ea5e9';
            ctx.fillRect(
                state.player.x,
                state.player.y,
                state.player.width,
                state.player.height
            );

            // Normal enemy spawn
            if (state.frame % 40 === 0) {
                const radius = randomRadius();
                state.enemies.push({
                    x: radius + Math.random() * (config.canvasSize.width - radius * 2),
                    y: -radius,
                    radius,
                });
            }

            // Extra batch every 20 score
            if (
                scoreRef.current > 0 &&
                scoreRef.current % 20 === 0 &&
                lastBatchScoreRef.current !== scoreRef.current
            ) {
                lastBatchScoreRef.current = scoreRef.current;
                const batchCount = 2 + Math.floor(Math.random() * 3);

                for (let i = 0; i < batchCount; i++) {
                    const radius = randomRadius();
                    state.enemies.push({
                        x: radius + Math.random() * (config.canvasSize.width - radius * 2),
                        y: -Math.random() * 100,
                        radius
                    });
                }
            }

            // Enemies update
            state.enemies = state.enemies.filter(enemy => {
                enemy.y += getEnemySpeed();

                // Draw enemy (circle)
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
                ctx.fill();

                // Circle vs rectangle collision
                const closestX = Math.max(
                    state.player.x,
                    Math.min(enemy.x, state.player.x + state.player.width)
                );
                const closestY = Math.max(
                    state.player.y,
                    Math.min(enemy.y, state.player.y + state.player.height)
                );

                const dx = enemy.x - closestX;
                const dy = enemy.y - closestY;

                if (dx * dx + dy * dy < enemy.radius * enemy.radius) {
                    setGameOver(true);
                    return false;
                }

                // Passed screen
                if (enemy.y - enemy.radius > config.canvasSize.height) {
                    setScore(s => {
                        scoreRef.current = s + 1;
                        return s + 1;
                    });
                    return false;
                }

                return true;
            });

            animationId = requestAnimationFrame(gameLoop);
        };

        gameLoop();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameOver]);

    return (
        <div className="relative flex flex-col items-center gap-4 p-4">
            <div className="text-xl text-white font-bold">🚀 Space Dodger </div>
            <div className="text-xl text-white font-bold"> Score: {score}</div>
            <canvas
                ref={canvasRef}
                width={config.canvasSize.width}
                height={config.canvasSize.height}
                className="border-2 border-gray-300"
            />

            {/* Touch controls for mobile */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)', // grid-cols-3
                    gap: '0.5rem',                          // gap-2
                    width: '12rem',                          // w-48
                    marginTop: '0.5rem',                     // mt-2
                }}
            >
                <div></div>
                <Button
                    size="lg"
                    variant="outline"
                    onMouseDown={() => handleDirectionPress('ArrowUp', true)}
                    onMouseUp={() => handleDirectionPress('ArrowUp', false)}
                    onMouseLeave={() => handleDirectionPress('ArrowUp', false)}
                    onTouchStart={() => handleDirectionPress('ArrowUp', true)}
                    onTouchEnd={() => handleDirectionPress('ArrowUp', false)}
                    disabled={gameOver}
                    className="text-2xl"
                    style={buttonOutlineStyle}
                >
                    ↑
                </Button>
                <div></div>
                <Button
                    size="lg"
                    variant="outline"
                    onMouseDown={() => handleDirectionPress('ArrowLeft', true)}
                    onMouseUp={() => handleDirectionPress('ArrowLeft', false)}
                    onMouseLeave={() => handleDirectionPress('ArrowLeft', false)}
                    onTouchStart={() => handleDirectionPress('ArrowLeft', true)}
                    onTouchEnd={() => handleDirectionPress('ArrowLeft', false)}
                    disabled={gameOver}
                    className="text-2xl"
                    style={buttonOutlineStyle}
                >
                    ←
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    onMouseDown={() => handleDirectionPress('ArrowDown', true)}
                    onMouseUp={() => handleDirectionPress('ArrowDown', false)}
                    onMouseLeave={() => handleDirectionPress('ArrowDown', false)}
                    onTouchStart={() => handleDirectionPress('ArrowDown', true)}
                    onTouchEnd={() => handleDirectionPress('ArrowDown', false)}
                    disabled={gameOver}
                    className="text-2xl"
                    style={buttonOutlineStyle}
                >
                    ↓
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    onMouseDown={() => handleDirectionPress('ArrowRight', true)}
                    onMouseUp={() => handleDirectionPress('ArrowRight', false)}
                    onMouseLeave={() => handleDirectionPress('ArrowRight', false)}
                    onTouchStart={() => handleDirectionPress('ArrowRight', true)}
                    onTouchEnd={() => handleDirectionPress('ArrowRight', false)}
                    disabled={gameOver}
                    className="text-2xl"
                    style={buttonOutlineStyle}
                >
                    →
                </Button>
            </div>

            {gameOver && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                }}>
                    <p className="text-3xl font-bold text-white mb-3">GAME OVER</p>
                    <p className="text-xl text-yellow-400 mb-4">Final Score: {score}</p>
                    <Button 
                        onClick={resetGame}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700"
                        style={buttonOutlineStyle}

                    >
                        Play Again
                    </Button>
                </div>
            )}

            <div className="text-sm text-gray-400 text-center max-w-md">
                Arrow keys or touch controls to move • Dodge the red circles • Speed increases every 20 points!
            </div>
        </div>
    );
};
export default SpaceDodger;