export const DESIGNS = {
  drum: {
    bodyClass: "theme-drum",
    containerClass: "drum-container",
    drumClass: "drum",
    hitSound: (drum) => `/sounds/${drum.sound}`,
    wrongSound: "/sounds/wrong.mp3",
    comboSounds: {
      warm: "/sounds/combo.mp3",
      hot: "/sounds/combo-hot.mp3",
      mega: "/sounds/combo-mega.mp3",
      super: "/sounds/combo-super.mp3",
    },
  },

  metal: {
    bodyClass: "theme-metal",
    containerClass: "metal-container",
    drumClass: "metal-drum",
    hitSound: () => "/sounds/steel-drum.mp3",
    wrongSound: "/sounds/wrong.mp3",
    comboSounds: {
      warm: "/sounds/combo.mp3",
      hot: "/sounds/combo-hot.mp3",
      mega: "/sounds/combo-mega.mp3",
      super: "/sounds/combo-super.mp3",
    },
  },

  neon: {
    bodyClass: "theme-neon",
    containerClass: "neon-container",
    drumClass: "neon-drum",
    hitSound: () => "/sounds/neon-hit.mp3",
    wrongSound: "/sounds/wrong.mp3",
    comboSounds: {
      warm: "/sounds/combo.mp3",
      hot: "/sounds/combo-hot.mp3",
      mega: "/sounds/combo-mega.mp3",
      super: "/sounds/combo-super.mp3",
    },
    flicker: true,
  },

  retro: {
    bodyClass: "theme-retro",
    containerClass: "retro-container",
    drumClass: "retro-drum",
    hitSound: () => "/sounds/punch.mp3",
    wrongSound: "/sounds/wrong.mp3",
    comboSounds: {
      warm: "/sounds/combo.mp3",
      hot: "/sounds/combo-hot.mp3",
      mega: "/sounds/combo-mega.mp3",
      super: "/sounds/combo-super.mp3",
    },
    crt: true,
  },
};
