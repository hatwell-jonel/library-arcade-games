'use client';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { SpaceDodger } from "@jonelhatwell/arcade-games";

export default function Home() {

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent 
                className="max-w-3xl bg-gray-900 border-[#ff6b6b] shadow-[0_0_40px_rgba(255,107,107,0.98)]"
                showCloseButton={false}
                >

                <DialogHeader className='sr-only'>
                    <DialogTitle className="text-3xl font-bold text-center">
                    🕹 <span className='bg-linear-to-b from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent'>ARCADE</span> 
                    </DialogTitle>
                    <DialogDescription className="text-neutral-400 text-center">
                    Choose your game and let the fun begin!
                    </DialogDescription>
                </DialogHeader> 
                <ArcadeGame />
                </DialogContent>
            </Dialog>
            <div className="relative h-full w-full overflow-hidde">
                <SpaceDodger />
            </div>
        </>
            
    );
}


function ArcadeGame() {
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    const activeGame = games.find(g => g.value === selectedGame)
    if (!selectedGame) {
        return (
        <>
            <div>
                <div className="text-3xl font-bold text-center">
                🕹 <span className='bg-linear-to-b from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent'>ARCADE</span> 
                </div>
                <div className="text-neutral-400 text-center">
                Choose your game and let the fun begin!
                </div>
            </div>
            <ScrollArea className="h-[400px] w-full pt-2">
                <div>
                    {games.map((game) => (
                    <React.Fragment key={game.name}>
                        <div
                        onClick={() => setSelectedGame(game.value)}
                        className={
                            cn(
                            "group relative overflow-hidden bg-gray-800 p-4 transition-all duration-300 cursor-pointer",
                            "hover:scale-[1.01] hover:shadow-lg hover:border-b-4 hover:border-[#ff6b6b]"
                            )
                        }
                        >
                        <div className="flex items-start gap-4">
                            <div className="text-4xl transition-transform duration-300 group-hover:scale-110">{game.image}</div>
                            <div className="flex-1">
                            <h3 className="font-semibold text-lg text-white mb-1 group-hover:text-[#ff6b6b] transition-colors">
                                {game.name}
                            </h3>
                            <p className="text-sm text-gray-400 line-clamp-2">{game.description}</p>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-linear-to-r from-purple-500/0 via-pink-500/0 to-red-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-red-500/5 transition-all duration-300 pointer-events-none" />
                        </div>
                    </React.Fragment>
                    ))}
                </div>
            </ScrollArea>
        </>
        );
    }
    
    return (
        <Dialog 
            open={!!selectedGame} 
            onOpenChange={() => setSelectedGame(null)}

        >
            <DialogContent 
                className="bg-gray-900 border-[#ff6b6b] shadow-[0_0_40px_rgba(255,107,107,0.98)]"
                showCloseButton={false}
                onInteractOutside={(e) => e.preventDefault()}
            >

                <DialogTitle className='sr-only'>
                {activeGame?.name ?? 'Arcade Game'}
                </DialogTitle>


                {/* Game Area */}
                <div className="relative h-full w-full overflow-hidden">
                    {activeGame?.component}
                </div>

                {/* Footer */}
                <DialogFooter className="border-t pt-2">
                <button
                    onClick={() => setSelectedGame(null)}
                    className="bg-[#ff6b35] px-4 py-2 text-sm font-bold text-white hover:opacity-90 transition cursor-pointer"
                >
                    ← Back
                </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


type Game = {
    name: string
    value: string;
    image: string
    description: string
    component: React.ReactNode
}


const games: Game[] = [
    {
        name: 'Space Dodger',
        value: 'spaceDodger',
        image: '🚀',
        description: 'Space Dodger is a classic arcade game where you have to dodge asteroids and collect power-ups to score points.',
        component: <SpaceDodger />
    },
    {
        name: 'Memory Game',
        value: 'memoryGame',
        image: '🧠',
        description: 'Memorize and click the numbers in order. Levels get harder as the speed and count increase.', 
        component: <Test />
    },
    {
        name: 'Tetris',
        value: 'tetris',
        image: '🟦',
        description: 'Tetris is a classic arcade game where you have to clear lines of falling blocks to score points.',
        component: <Test />
    },
    {
        name: 'Snake',
        value: 'snake',
        image: '🐍',
        description: 'Snake is a classic arcade game where you have to eat apples and avoid obstacles to grow and grow.',
        component: <Test />
    },
    {
        name: 'Sudoku',
        value: 'sudoku',
        image: '🔢',
        description: 'Sudoku is a classic arcade game where you have to fill in the numbers to complete the grid.', 
        component: <Test />
    },
]


function Test() {
    return (
        <div className="relative h-full w-full overflow-hidden text-white">
            asdasd
        </div>
    )
}