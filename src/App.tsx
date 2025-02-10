import "./App.css";

import React, { useRef, useState, useEffect, useCallback } from "react";

const PaddleHeight = 40; // in vh
const PaddleWidth = 2; // in vw
const BallSize = 2; // in vh

const App: React.FC = () => {
  const [player1Y, setPlayer1Y] = useState(40); // Player 1 paddle position (in vh)
  const [player2Y, setPlayer2Y] = useState(40); // Player 2 paddle position (in vh)
  const [ballX, setBallX] = useState(50); // Ball X position (in vw)
  const [ballY, setBallY] = useState(50); // Ball Y position (in vh)
  const [ballDirX, setBallDirX] = useState(1); // Ball X direction (1 or -1)
  const [ballDirY, setBallDirY] = useState(1); // Ball Y direction (1 or -1)
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const isScoredRef = useRef(false); // Ref to track scoring state
  const [gameTime, setGameTime] = useState(0); // Track game time
  const speedIncrement = 0.000008; // Rate of speed increase

  // const [isScored, setIsScored] = useState(false);
  const gameLoopRef = useRef<number | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const step = 5; // Movement step in vh
    if (event.key === "w") {
      setPlayer1Y((prev) => Math.max(0, prev - step));
    } else if (event.key === "s") {
      setPlayer1Y((prev) => Math.min(100 - PaddleHeight / 2, prev + step));
    } else if (event.key === "ArrowUp") {
      setPlayer2Y((prev) => Math.max(0, prev - step));
    } else if (event.key === "ArrowDown") {
      setPlayer2Y((prev) => Math.min(100 - PaddleHeight / 2, prev + step));
    }
  }, []);

  const resetGame = useCallback(() => {
    setBallX(50);
    setBallY(50);
    setBallDirX(1);
    setBallDirY(1);
    setScore1(0);
    setScore2(0);
    setIsPlaying(false);
    isScoredRef.current = false; // Reset scoring flag
  }, []);

  const randomizeVelocity = useCallback(() => {
    const randomSpeedX = Math.random() * 0.5 + 0.5 + gameTime * speedIncrement; // Speed increases over time
    const randomSpeedY = Math.random() * 0.5 + 0.5 + gameTime * speedIncrement; // Speed increases over time
    const randomDirX = Math.random() < 0.5 ? -1 : 1;
    const randomDirY = Math.random() < 0.5 ? -1 : 1;

    setBallDirX(randomDirX * randomSpeedX);
    setBallDirY(randomDirY * randomSpeedY);
  }, [gameTime]);

  const updateGame = useCallback(() => {
    setBallX((prev) => {
      const newX = prev + ballDirX * 0.25; // Ball speed in vw

      // Player 1 paddle bounce
      if (newX <= PaddleWidth && ballY >= player1Y && ballY <= player1Y + PaddleHeight / 2) {
        setBallDirX((prev) => Math.abs(prev)); // Reflect X direction
        setBallDirY((prev) => prev + (Math.random() - 0.5) * 0.25); //ss Add randomness to Y
      }
      // Player 2 paddle bounce
      else if (newX >= 100 - PaddleWidth - BallSize && ballY >= player2Y && ballY <= player2Y + PaddleHeight / 2) {
        setBallDirX((prev) => -Math.abs(prev)); // Reflect X direction
        setBallDirY((prev) => prev + (Math.random() - 0.5) * 0.25); // Add randomness to Y
      }
      // Player 2 scores
      else if (newX < 0 - PaddleWidth - 1 && !isScoredRef.current) {
        isScoredRef.current = true;
        setIsPlaying(false);
        setScore2((prev) => prev + 1);
        setTimeout(() => {
          setBallX(50);
          setBallY(50);
          randomizeVelocity(); // Reset with randomized velocity
          isScoredRef.current = false;
          setIsPlaying(true);
        }, 1000); // 500ms delay
      }
      // Player 1 scores
      else if (newX > 100 && !isScoredRef.current) {
        isScoredRef.current = true;
        setIsPlaying(false);
        setScore1((prev) => prev + 1);
        setTimeout(() => {
          setBallX(50);
          setBallY(50);
          randomizeVelocity(); // Reset with randomized velocity
          isScoredRef.current = false;
          setIsPlaying(true);
        }, 1000); // 500ms delay
      }

      return newX;
    });

    setBallY((prev) => {
      const newY = prev + ballDirY * 0.25; // Ball speed in vh
      if (newY <= 0) {
        setBallDirY((prev) => Math.abs(prev)); // Bounce from the top wall
      } else if (newY >= 100 - BallSize) {
        setBallDirY((prev) => -Math.abs(prev)); // Bounce from the bottom wall
      }

      return newY;
    });
  }, [ballDirX, ballDirY, ballY, player1Y, player2Y, randomizeVelocity, isScoredRef.current]);

  useEffect(() => {
    if (isPlaying) {
      gameLoopRef.current = requestAnimationFrame(function loop() {
        updateGame();
        setGameTime((prev) => prev + 0.01); // Increment game time every frame (roughly 60 FPS)
        // console.log(gameTime);
        gameLoopRef.current = requestAnimationFrame(loop);
      });
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, updateGame]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="game-container">
      <div className="paddle player1" style={{ top: `calc(${player1Y} * 1vh)` }}></div>
      <div className="paddle player2" style={{ top: `calc(${player2Y} * 1vh)` }}></div>
      <div className="ball" style={{ left: `calc(${ballX} * 1vw)`, top: `calc(${ballY} * 1vh)` }}></div>
      <div className="score">
        Player 1: {score1} | Player 2: {score2}
      </div>
      <div className="controls">
        <button onClick={() => setIsPlaying(true)}>Play</button>
        <button onClick={() => setIsPlaying(false)}>Pause</button>
        <button onClick={resetGame}>Restart</button>
      </div>
    </div>
  );
};

export default App;

// App.css
