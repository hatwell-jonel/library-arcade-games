
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';


interface Position {
    x: number;
    y: number;
}


interface Enemy extends Position {
    width: number;
    height: number;
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

const SpaceDodger: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const gameStateRef = useRef<SpaceDodgerState>({
        player: { x: 200, y: 350, width: 30, height: 30 },
        enemies: [],
        frame: 0,
        keys: {}
    });

    const resetGame = (): void => {
        gameStateRef.current = {
        player: { x: 200, y: 350, width: 30, height: 30 },
        enemies: [],
        frame: 0,
        keys: {}
        };
        setScore(0);
        setGameOver(false);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const state = gameStateRef.current;

        const handleKeyDown = (e: KeyboardEvent): void => { 
        state.keys[e.key] = true; 
        };
        const handleKeyUp = (e: KeyboardEvent): void => { 
        state.keys[e.key] = false; 
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        let animationId: number;
        const gameLoop = (): void => {
        if (gameOver) return;
        
        state.frame++;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 400, 400);

        if (state.keys['ArrowLeft'] && state.player.x > 0) state.player.x -= 5;
        if (state.keys['ArrowRight'] && state.player.x < 370) state.player.x += 5;
        if (state.keys['ArrowUp'] && state.player.y > 0) state.player.y -= 5;
        if (state.keys['ArrowDown'] && state.player.y < 370) state.player.y += 5;

        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);

        if (state.frame % 40 === 0) {
            state.enemies.push({ x: Math.random() * 370, y: -20, width: 30, height: 30 });
        }

        state.enemies = state.enemies.filter(enemy => {
            enemy.y += 3;
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

            if (enemy.x < state.player.x + state.player.width &&
                enemy.x + enemy.width > state.player.x &&
                enemy.y < state.player.y + state.player.height &&
                enemy.y + enemy.height > state.player.y) {
            setGameOver(true);
            return false;
            }

            if (enemy.y > 400) {
            setScore(s => s + 1);
            return false;
            }
            return true;
        });

        animationId = requestAnimationFrame(gameLoop);
        };
        
        if (!gameOver) gameLoop();

        return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameOver]);

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <div className="text-xl font-bold">Score: {score}</div>
            <canvas ref={canvasRef} width="400" height="400" className="border-2 border-gray-300" />
            {gameOver && (
                <div className="text-center">
                <p className="text-xl font-bold text-red-500 mb-2">Game Over!</p>
                <Button onClick={resetGame}>Play Again</Button>
                </div>
            )}
            <p className="text-sm text-gray-600">Use arrow keys to move</p>
        </div>
    );
};

export default SpaceDodger;