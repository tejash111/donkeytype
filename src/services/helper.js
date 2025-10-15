export const formatPercentage = (percentage) => {
  return percentage.toFixed(0) + "%";
};

export const countErrors = (actual, expected) => {
  const expectedCharacters = expected.split("");

  return expectedCharacters.reduce((errors, expectedChar, i) => {
    const actualChar = actual[i];
    if (actualChar !== expectedChar) {
      errors++;
    }
    return errors;
  }, 0);
};

export const calculateAccuracyPercentage = (errors, total) => {
  if (total > 0) {
    const corrects = total - errors;
    return (corrects / total) * 100;
  }

  return 0;
};

export const calculateWordsPerMinute = (characters, timeInSeconds) => {
  if (timeInSeconds <= 0) {
    return 0;
  }
  
  // Standard: 1 word = 5 characters
  const words = characters / 5;
  const minutes = timeInSeconds / 60;
  
  return Math.round(words / minutes);
};
