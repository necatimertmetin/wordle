import React, { useState, useRef, useEffect } from 'react';
import { Grid, Paper, TextField, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import words from './kelimeler.json'; // Import the JSON file directly as an array
import './App.css';

const App: React.FC = () => {
  const [guess, setGuess] = useState<string[]>(Array(5).fill(''));
  const [guesses, setGuesses] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(5).fill(null));
  const [correctWord, setCorrectWord] = useState<string[]>([]); // Store the correct word as an array of characters

  // Function to generate a new random word
  const generateNewWord = () => {
    const randomIndex = Math.floor(Math.random() * words.length); // Select a random index
    const word = words[randomIndex].toUpperCase(); // Convert the correct word to uppercase
    setCorrectWord(word.split('')); // Convert the string to an array of uppercase characters
    setGuesses([]);
    setGuess(Array(5).fill(''));
    inputRefs.current.forEach((input) => input && (input.value = ''));
    inputRefs.current[0]?.focus();
  };

  // Call generateNewWord when the component mounts
  useEffect(() => {
    generateNewWord();
  }, []);

  // Function to normalize Turkish characters
  const normalizeInput = (value: string) => {
    return value
      .replace(/ı/g, 'I') // Convert dotted I to dotless I
      .replace(/i/g, 'İ') // Convert dotless I to dotted I
      .replace(/ğ/g, 'Ğ') // Convert g with dot to G with dot
      .replace(/G/g, 'Ğ') // Ensure uppercase G is converted correctly
      .replace(/ö/g, 'Ö') // Convert o with umlaut to O with umlaut
      .replace(/ü/g, 'Ü') // Convert u with umlaut to U with umlaut
      .replace(/ş/g, 'Ş') // Convert s with cedilla to S with cedilla
      .replace(/ç/g, 'Ç') // Convert c with cedilla to C with cedilla
      .toUpperCase(); // Ensure all inputs are uppercase
  };

  const handleInputChange = (index: number, value: string) => {
    const normalizedValue = normalizeInput(value); // Normalize input for Turkish characters
    const newGuess = [...guess];
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
    setGuesses([...guesses, newGuess.join('')]);

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
      <Grid container spacing={1} justifyContent="center">
        {guess.map((g, index) => (
          <Grid item key={index}>
            <TextField
              variant="outlined"
              value={g}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e as React.KeyboardEvent<HTMLInputElement>, index)}
              inputProps={{ maxLength: 1 }} // Single character input
              style={{ width: '50px', textAlign: 'center' }}
              inputRef={(el) => (inputRefs.current[index] = el)} // Assign reference
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
                      backgroundColor: getLetterColor(letter, letterIndex) // Background color
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

      {/* Dialog component for popup */}
      <Dialog open={open} onClose={handleDialogClose}>
        <DialogTitle>Tebrikler!</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Cevabı doğru bildiniz!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Tamam
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default App;
