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
            <div className="text-xl font-bold">Score: {score}</div>
            <canvas
                ref={canvasRef}
                width={config.canvasSize.width}
                height={config.canvasSize.height}
                className="border-2 border-gray-300"
            />

            {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                    <p className="text-xl font-bold text-red-500 mb-3">Game Over</p>
                    <Button onClick={resetGame}>Play Again</Button>
                </div>
            )}

            <div className="text-sm text-foreground">Use arrow keys to move</div>
        </div>
    );
};

export default SpaceDodger;