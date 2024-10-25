import React, { useState, useEffect } from 'react';

interface KeyboardProps {
  blockedLetters: string[]; // Letters to be highlighted in red
}

const Keyboard: React.FC<KeyboardProps> = ({ blockedLetters }) => {
  const [shakingKey, setShakingKey] = useState<string | null>(null); // State for the shaking key
  const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ', ','],
    ['<', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', '.']
  ];

  // Function to handle keyboard events
  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toUpperCase(); // Get the key pressed and convert to uppercase
    if (blockedLetters.includes(key)) {
      setShakingKey(key);
      setTimeout(() => setShakingKey(null), 500); // Reset shaking after 500ms
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown); // Add event listener for keydown

    return () => {
      window.removeEventListener('keydown', handleKeyDown); // Cleanup event listener
    };
  }, []);

  return (
    <div className="keyboard">
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((letter) => (
            <span
              key={letter}
              className={`key ${blockedLetters.includes(letter) ? 'blocked' : ''} ${shakingKey === letter ? 'shake' : ''}`}
            >
              {letter}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
