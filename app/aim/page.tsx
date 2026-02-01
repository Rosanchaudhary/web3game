'use client';

import { useState, useEffect } from 'react';

export default function AimTest() {
  const [gameState, setGameState] = useState('idle'); // idle, playing, finished
  const [bubblesClicked, setBubblesClicked] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [score, setScore] = useState(null);
  const [bubblePosition, setBubblePosition] = useState({ x: 50, y: 50 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [totalAccuracy, setTotalAccuracy] = useState(0);
  const [accuracyScores, setAccuracyScores] = useState([]);

  const TOTAL_BUBBLES = 30;
  const BUBBLE_SIZE = 80; // Larger for better bullseye visibility

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = document.getElementById('aim-canvas');
      if (canvas) {
        setCanvasSize({
          width: canvas.offsetWidth,
          height: canvas.offsetHeight
        });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const getRandomPosition = () => {
    const margin = BUBBLE_SIZE;
    const maxX = canvasSize.width - margin * 2;
    const maxY = canvasSize.height - margin * 2;
    
    return {
      x: margin + Math.random() * maxX,
      y: margin + Math.random() * maxY
    };
  };

  const startGame = () => {
    setGameState('playing');
    setBubblesClicked(0);
    setScore(null);
    setTotalAccuracy(0);
    setAccuracyScores([]);
    setStartTime(Date.now());
    setBubblePosition(getRandomPosition());
  };

  const calculateAccuracy = (clickX, clickY) => {
    // Calculate distance from center of bullseye
    const centerX = bubblePosition.x;
    const centerY = bubblePosition.y;
    const distance = Math.sqrt(
      Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2)
    );
    
    // Maximum distance is half the bubble size (radius)
    const maxDistance = BUBBLE_SIZE / 2;
    
    // Calculate accuracy percentage (100% at center, 0% at edge)
    const accuracy = Math.max(0, Math.min(100, ((maxDistance - distance) / maxDistance) * 100));
    
    return Math.round(accuracy);
  };

  const handleBubbleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = bubblePosition.x;
    const clickY = bubblePosition.y;
    
    // Calculate accuracy for this click
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;
    const accuracy = calculateAccuracy(relativeX, relativeY);
    
    const newAccuracyScores = [...accuracyScores, accuracy];
    setAccuracyScores(newAccuracyScores);
    
    const newTotal = totalAccuracy + accuracy;
    setTotalAccuracy(newTotal);
    
    const newCount = bubblesClicked + 1;
    setBubblesClicked(newCount);

    if (newCount >= TOTAL_BUBBLES) {
      // Game finished
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      setScore(totalTime);
      setGameState('finished');
    } else {
      // Spawn next bubble
      setBubblePosition(getRandomPosition());
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900">
      {/* Game Canvas */}
      <div 
        id="aim-canvas"
        className="relative flex-1 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden"
      >
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={startGame}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-lg transition-colors"
            >
              Start Aim Test
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div
            onClick={handleBubbleClick}
            style={{
              position: 'absolute',
              left: `${bubblePosition.x}px`,
              top: `${bubblePosition.y}px`,
              transform: 'translate(-50%, -50%)',
              width: `${BUBBLE_SIZE}px`,
              height: `${BUBBLE_SIZE}px`,
            }}
            className="cursor-crosshair"
          >
            {/* Bullseye Target */}
            <div className="relative w-full h-full">
              {/* Outer ring - Red */}
              <div className="absolute inset-0 bg-red-500 rounded-full"></div>
              
              {/* Second ring - White */}
              <div className="absolute inset-[15%] bg-white rounded-full"></div>
              
              {/* Third ring - Red */}
              <div className="absolute inset-[30%] bg-red-500 rounded-full"></div>
              
              {/* Fourth ring - White */}
              <div className="absolute inset-[45%] bg-white rounded-full"></div>
              
              {/* Center - Red */}
              <div className="absolute inset-[60%] bg-red-600 rounded-full shadow-lg"></div>
              
              {/* Target number */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-black font-bold text-xs bg-yellow-300 px-2 py-1 rounded-full shadow-md">
                  {bubblesClicked + 1}
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-green-400 text-6xl font-bold mb-4">
                Complete!
              </div>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-lg transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="absolute top-4 left-4 text-white text-2xl font-bold">
            {bubblesClicked} / {TOTAL_BUBBLES}
          </div>
        )}
      </div>

      {/* Score Section */}
      <div className="bg-gray-950 p-6 border-t border-gray-700">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-white text-2xl font-bold mb-4">Score</h2>
          {score !== null ? (
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-gray-400 text-sm mb-1">Time</div>
                <div className="text-green-400 text-4xl font-bold">
                  {score} ms
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Average Accuracy</div>
                <div className="text-blue-400 text-4xl font-bold">
                  {Math.round(totalAccuracy / TOTAL_BUBBLES)}%
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-xl">
              {gameState === 'idle' ? 'Click Start to begin' : 'Game in progress...'}
            </div>
          )}
          
          {gameState === 'playing' && bubblesClicked > 0 && (
            <div className="mt-4">
              <div className="text-gray-400 text-sm mb-1">Current Average Accuracy</div>
              <div className="text-blue-300 text-2xl font-bold">
                {Math.round(totalAccuracy / bubblesClicked)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}