// Centralized Data Store for the 4-Page Birthday Application
// Easily customize photos, captions, letters, names, and dates here!

export const BIRTHDAY_CONFIG = {
  celebrant: {
    name: "Vidhanth",
    nickname: "Vidhanth",
    birthdate: "2026-08-15T00:00:00", // ISO date for live countdown timer
    waxSealInitial: "V", // Letter 'V' in vintage cursive
  },

  // Page 2: Memories & Pictures (1 Sample Note displayed, remaining 15 clean ready for your photos & notes)
  memories: [],

  // Page 3: Letters from everyone coming out of the envelope
  letters: [],

  // Page 4: Cake & Countdown Configuration
  cake: {
    candleCount: 5,
    title: "Blow the Candles & Make a Wish!",
    subtitle: "When you're ready, hit the button below to blow out all the candles at once!",
    successTitle: "HAPPY BIRTHDAY!",
    successMessage: "May all your birthday wishes and wildest dreams come true this year!",
  }
};
