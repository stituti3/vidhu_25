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
  memories: [
    {
      id: "mem-1",
      title: "Sample Memory Note",
      date: "sample note ♡",
      caption: "that sunset where we couldn't stop laughing ♡",
      image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80",
      rotation: -2.2,
    },
    {
      id: "mem-2",
      title: "",
      date: "",
      caption: "",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
      rotation: 1.8,
    },
    {
      id: "mem-3",
      title: "",
      date: "",
      caption: "",
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80",
      rotation: -1.5,
    },
    {
      id: "mem-4",
      title: "",
      date: "",
      caption: "",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
      rotation: 2.3,
    },
    {
      id: "mem-5",
      title: "",
      date: "",
      caption: "",
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80",
      rotation: -2,
    },
    {
      id: "mem-6",
      title: "",
      date: "",
      caption: "",
      image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=600&q=80",
      rotation: 1.5,
    },
    {
      id: "mem-7",
      title: "",
      date: "",
      caption: "",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
      rotation: -2.5,
    },
    {
      id: "mem-8",
      title: "",
      date: "",
      caption: "",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
      rotation: 2,
    },
    {
      id: "mem-9",
      title: "",
      date: "",
      caption: "",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
      rotation: -1.8,
    },
    {
      id: "mem-10",
      title: "",
      date: "",
      caption: "",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
      rotation: 2.2,
    },
    {
      id: "mem-11",
      title: "",
      date: "",
      caption: "",
      image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
      rotation: -2,
    },
    {
      id: "mem-12",
      title: "",
      date: "",
      caption: "",
      image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80",
      rotation: 1.6,
    },
    {
      id: "mem-13",
      title: "",
      date: "",
      caption: "",
      image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80",
      rotation: -2.3,
    },
    {
      id: "mem-14",
      title: "",
      date: "",
      caption: "",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
      rotation: 1.8,
    },
    {
      id: "mem-15",
      title: "",
      date: "",
      caption: "",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      rotation: -1.5,
    },
    {
      id: "mem-16",
      title: "",
      date: "",
      caption: "",
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
      rotation: 1.8,
    },
  ],

  // Page 3: Letters from everyone coming out of the envelope
  letters: [
    {
      id: "let-1",
      sender: "Maya & Sam",
      relation: "Best Friends",
      title: "To our absolute favorite human",
      message: "Happy Birthday! We hope your day is as radiant, heartwarming, and wonderful as you are to everyone around you. Thank you for always bringing so much laughter, warmth, and steady kindness into our lives. May this upcoming year be your best chapter yet, overflowing with exciting adventures, endless sweet treats, peace, and dreams coming true! We love you tons and tons!",
    },
    {
      id: "let-2",
      sender: "Jordan K.",
      relation: "Close Friend",
      title: "Another year of greatness",
      message: "Happy Birthday! Cheers to another year of legendary moments, late night conversations, and making memories. You're one of the most genuine, dependable, and creative people I know. Hope you celebrate properly today and eat way too much cake. You deserve the absolute world!",
    },
    {
      id: "let-3",
      sender: "Chamiah",
      relation: "Family",
      title: "With all my love on your birthday",
      message: "Dear Vidhanth, watching you grow and shine is the greatest gift. You pour so much empathy and heart into everything you touch. On this birthday, I hope you take a moment to look back at how much you've achieved and how deeply loved you are by everyone in your corner. Here's to celebrating you today and always!",
    },
    {
      id: "let-4",
      sender: "The Entire Crew",
      relation: "The Squad",
      title: "Happy Birthday from the squad",
      message: "To the star of the day! Happy Birthday! Today we celebrate you! Thank you for the endless memories, the inside jokes, and the good vibes you always bring. Wishing you 365 days of happiness, good health, and success! Let's celebrate!",
    }
  ],

  // Page 4: Cake & Countdown Configuration
  cake: {
    candleCount: 5,
    title: "Blow the Candles & Make a Wish!",
    subtitle: "When you're ready, hit the button below to blow out all the candles at once!",
    successTitle: "HAPPY BIRTHDAY!",
    successMessage: "May all your birthday wishes and wildest dreams come true this year!",
  }
};
