import React, { useState, useRef, useEffect } from 'react';
import { Grid, Paper, TextField, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import words from './kelimeler.json'; // Import the JSON file directly as an array
import './App.css';
import Keyboard from './keyboard';

const App: React.FC = () => {
  const [guess, setGuess] = useState<string[]>(Array(5).fill(''));
  const [guesses, setGuesses] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(5).fill(null));
  const [correctWord, setCorrectWord] = useState<string[]>([]);
  const [disabledLetters, setDisabledLetters] = useState<string[]>([]); // Track disabled letters

  // Function to generate a new random word
  const generateNewWord = () => {
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex].toUpperCase();
    setCorrectWord(word.split(''));
    setGuesses([]);
    setGuess(Array(5).fill(''));
    inputRefs.current.forEach((input) => input && (input.value = ''));
    inputRefs.current[0]?.focus();
    setDisabledLetters([]); // Reset disabled letters when generating a new word
  };

  // Call generateNewWord when the component mounts
  useEffect(() => {
    generateNewWord();
  }, []);

  // Function to normalize Turkish characters
  const normalizeInput = (value: string) => {
    return value
      .replace(/ı/g, 'I')
      .replace(/i/g, 'İ')
      .replace(/ğ/g, 'Ğ')
      .replace(/G/g, 'Ğ')
      .replace(/ö/g, 'Ö')
      .replace(/ü/g, 'Ü')
      .replace(/ş/g, 'Ş')
      .replace(/ç/g, 'Ç')
      .toUpperCase();
  };

  const handleInputChange = (index: number, value: string) => {
    const normalizedValue = normalizeInput(value);
    const newGuess = [...guess];
    
    if (disabledLetters.includes(normalizedValue)) {
      // If the input letter is disabled, clear the input and shake
      newGuess[index] = '';
      setGuess(newGuess);
      shakeLetter(normalizedValue); // Shake the letter
      return;
    }

    newGuess[index] = normalizedValue; // Use the normalized value
    setGuess(newGuess);

    if (normalizedValue.length === 1 && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }

    // Place cursor at the end of input
    setTimeout(() => {
      inputRefs.current[index]?.setSelectionRange(normalizedValue.length, normalizedValue.length);
    }, 0);

    // If all inputs are filled, submit the guess
    if (newGuess.every((g) => g.length === 1)) {
      handleGuessSubmit(newGuess);
    }
  };

  const shakeLetter = (letter: string) => {
    const letterElement = document.getElementById(`disabled-${letter}`);
    if (letterElement) {
      letterElement.classList.add('shake');
      setTimeout(() => {
        letterElement.classList.remove('shake');
      }, 500); // Remove the shake effect after 500ms
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
    if (e.key === 'Backspace') {
      if (guess[index]) {
        const newGuess = [...guess];
        newGuess[index] = '';
        setGuess(newGuess);
        inputRefs.current[index]?.focus();
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      e.preventDefault();
    }
  };

  const handleGuessSubmit = (newGuess: string[]) => {
    setGuesses([newGuess.join(''), ...guesses]);

    // Check for incorrect letters and update disabledLetters
    const incorrectLetters = newGuess.filter(letter => !correctWord.includes(letter));
    setDisabledLetters([...new Set([...disabledLetters, ...incorrectLetters])]);

    // Check if the guess is correct by comparing to the correctWord array
    if (JSON.stringify(newGuess) === JSON.stringify(correctWord)) {
      setOpen(true);
    } else {
      setGuess(Array(5).fill('')); // Reset guess
      inputRefs.current.forEach((input) => input && (input.value = '')); // Reset inputs
      inputRefs.current[0]?.focus(); // Focus on the first input
    }
  };

  const handleDialogClose = () => {
    setOpen(false);
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
    generateNewWord(); // Generate a new word
  };

  const getLetterColor = (letter: string, index: number) => {
    if (letter === correctWord[index]) {
      return 'green'; // Correct position
    } else if (correctWord.includes(letter)) {
      return 'yellow'; // Wrong position
    }
    return 'white'; // Not in the word
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Wordle Oyununa Hoş Geldiniz!
      </Typography>

      {/* Disabled letters display */}
      <div style={{ marginBottom: '20px' }}>
        <Typography variant="h6">Engellenen Harfler:</Typography>
        <Keyboard blockedLetters={disabledLetters}/>

      </div>

      <Grid container spacing={1} justifyContent="center">
        {guess.map((g, index) => (
          <Grid item key={index}>
            <TextField
              variant="outlined"
              value={g}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e as React.KeyboardEvent<HTMLInputElement>, index)}
              inputProps={{ maxLength: 1 }}
              style={{ width: '50px', textAlign: 'center' }}
              inputRef={(el) => (inputRefs.current[index] = el)}
            />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" style={{ marginTop: '20px' }}>
        Tahminler:
      </Typography>
      <Grid container spacing={2} style={{ marginTop: '10px' }} justifyContent="center">
        {guesses.map((g, index) => (
          <Grid item xs={12} key={index}>
            <Grid container spacing={1} justifyContent="center">
              {g.split('').map((letter, letterIndex) => (
                <Grid item key={letterIndex}>
                  <Paper
                    elevation={3}
                    style={{
                      padding: '10px',
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: 'center',
                      minWidth: '30px',
                      minHeight: "50px",
                      backgroundColor: getLetterColor(letter, letterIndex)
                    }}
                  >
                    <Typography variant="h4" style={{ fontWeight: 'bold' }}>
                      {letter}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleDialogClose}>
        <DialogTitle>Doğru Tahmin!</DialogTitle>
        <DialogContent>
          <Typography>Yeni bir kelime ile devam edelim!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">Tamam</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default App;
