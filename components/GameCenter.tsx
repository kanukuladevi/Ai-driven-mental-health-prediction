import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, RefreshCcw, Check, X } from 'lucide-react';

export const GameCenter: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'memory' | 'stroop' | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Mind Refreshment Center 🧘</h2>
        <p className="text-slate-500">Take a break and reset your mental state with these cognitive puzzles.</p>
      </div>

      {!activeGame ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => setActiveGame('memory')}
            className="group relative overflow-hidden bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl hover:border-indigo-200 transition-all text-left"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Brain className="w-32 h-32 text-indigo-600" />
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-2xl">🎴</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Memory Match</h3>
            <p className="text-slate-500">Flip cards to match emoji pairs. Great for focus and short-term memory.</p>
          </button>

          <button 
            onClick={() => setActiveGame('stroop')}
            className="group relative overflow-hidden bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl hover:border-pink-200 transition-all text-left"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="w-32 h-32 text-pink-600" />
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4 text-2xl">🎨</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Color Trick (Stroop)</h3>
            <p className="text-slate-500">Don't read the text! Select the color of the word. A classic brain teaser.</p>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 relative min-h-[400px]">
          <button 
            onClick={() => setActiveGame(null)}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 font-medium flex items-center gap-2"
          >
            Back to Menu <RefreshCcw className="w-4 h-4" />
          </button>
          
          {activeGame === 'memory' && <MemoryGame />}
          {activeGame === 'stroop' && <StroopGame />}
        </div>
      )}
    </div>
  );
};

// --- Memory Game Sub-component ---
const MemoryGame: React.FC = () => {
  const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
  const [cards, setCards] = useState<{id: number, content: string, isFlipped: boolean, isMatched: boolean}[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    shuffleCards();
  }, []);

  const shuffleCards = () => {
    const duplicated = [...emojis, ...emojis];
    const shuffled = duplicated
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, content: emoji, isFlipped: false, isMatched: false }));
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
  };

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (newCards[first].content === newCards[second].content) {
        // Match
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const isWon = cards.every(c => c.isMatched);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-2xl font-bold text-indigo-700 mb-6">Memory Match</h3>
      <div className="mb-4 text-slate-500 font-medium">Moves: {moves}</div>
      
      <div className="grid grid-cols-4 gap-3 md:gap-4 mb-8">
        {cards.map((card, index) => (
          <div 
            key={card.id}
            onClick={() => handleCardClick(index)}
            className={`
              w-16 h-16 md:w-20 md:h-20 rounded-xl cursor-pointer flex items-center justify-center text-3xl select-none transition-all duration-300 transform
              ${card.isFlipped || card.isMatched ? 'bg-indigo-100 rotate-y-180' : 'bg-indigo-600 hover:bg-indigo-700'}
            `}
          >
            {(card.isFlipped || card.isMatched) ? card.content : '❓'}
          </div>
        ))}
      </div>

      {isWon && (
        <div className="text-center animate-bounce">
          <p className="text-xl font-bold text-green-600 mb-4">🎉 Excellent! You cleared it!</p>
          <button onClick={shuffleCards} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Play Again</button>
        </div>
      )}
    </div>
  );
};

// --- Stroop Game Sub-component ---
const StroopGame: React.FC = () => {
  const colors = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Purple', hex: '#a855f7' },
  ];

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'ended'>('intro');
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState('');

  useEffect(() => {
    let timer: any;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setGameState('ended');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const nextRound = () => {
    const wordObj = colors[Math.floor(Math.random() * colors.length)];
    const colorObj = colors[Math.floor(Math.random() * colors.length)];
    setCurrentWord(wordObj.name);
    setCurrentColor(colorObj.hex);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameState('playing');
    nextRound();
  };

  const handleChoice = (selectedHex: string) => {
    if (selectedHex === currentColor) {
      setScore(s => s + 10);
    } else {
      setScore(s => Math.max(0, s - 5));
    }
    nextRound();
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto text-center">
      <h3 className="text-2xl font-bold text-pink-600 mb-2">Color Trick</h3>
      
      {gameState === 'intro' && (
        <div className="space-y-6 mt-8">
          <p className="text-slate-600">
            A word will appear. Click the button that matches the <span className="font-bold text-indigo-600">COLOR</span> of the text, not the word itself!
          </p>
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
             Example: If you see <span className="font-bold text-xl" style={{color: '#3b82f6'}}>Red</span>, click the "Blue" button.
          </div>
          <button onClick={startGame} className="px-8 py-3 bg-pink-600 text-white rounded-xl font-bold text-lg hover:bg-pink-700 shadow-lg hover:shadow-pink-500/30">Start Game</button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full mt-4">
          <div className="flex justify-between mb-8 text-lg font-bold text-slate-700">
            <span>Score: {score}</span>
            <span className={`${timeLeft < 10 ? 'text-red-500' : 'text-slate-700'}`}>Time: {timeLeft}s</span>
          </div>
          
          <div className="h-32 flex items-center justify-center mb-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
            <span className="text-6xl font-black tracking-wider" style={{ color: currentColor }}>
              {currentWord}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => handleChoice(c.hex)}
                className="py-4 rounded-xl font-bold text-white shadow-md transform active:scale-95 transition-all hover:opacity-90"
                style={{ backgroundColor: c.hex }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'ended' && (
        <div className="mt-8 space-y-6">
          <div className="text-6xl mb-4">🏁</div>
          <h2 className="text-3xl font-bold text-slate-800">Time's Up!</h2>
          <p className="text-xl text-slate-600">Final Score: <span className="font-bold text-indigo-600">{score}</span></p>
          <button onClick={startGame} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Play Again</button>
        </div>
      )}
    </div>
  );
};