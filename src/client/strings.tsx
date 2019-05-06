interface LangEntry {
  langName: string;
  labels: string[];
  placeholders: string[];
  randoms: string[][];
}

const Strings: { [key: string]: LangEntry } = {
  en: {
    langName: "English",
    labels: [
      "Enter a subject",
      "Enter a verb",
      "Enter an object",
      "Enter extra details (place/time/adjective/adverb)"
    ],
    placeholders: [
      "Examples: Ned, Catelyn, Robb",
      "Examples: bring, eat, drink",
      "Examples: ball, fruit, Ned's head",
      "Examples: in the woods, in the morning"
    ],
    randoms: [
      [
        "Donald Trump",
        "Barrack Obama",
        "Tom Cruise",
        "Bill Gates",
        "Emma Watson",
        "Taylor Swift",
        "Miley Cyrus",
        "Justin Bieber"
      ],
      [
        "pushes",
        "eats",
        "dances with",
        "looks at",
        "stares at",
        "picks",
        "kicks",
        "shakes",
        "lifts",
        "throws",
        "punches",
        "shoots",
        "stabs"
      ],
      [
        "Donald Trump",
        "Barrack Obama",
        "Tom Cruise",
        "Bill Gates",
        "Emma Watson",
        "Taylor Swift",
        "Miley Cyrus",
        "Justin Bieber"
      ],
      [
        "vigorously",
        "with passion",
        "because why not",
        "today",
        "this morning",
        "every day",
        "until the end of time",
        "on the himalayas"
      ]
    ]
  },
  id: {
    langName: "Bahasa Indonesia",
    labels: [
      "Masukkan subjek",
      "Masukkan kata kerja",
      "Masukkan objek",
      "Masukkan keterangan (tempat/waktu/dll)"
    ],
    placeholders: [
      "Contoh: Joko, Widodo, Ahok, Andi",
      "Contoh: membawa, menggendong",
      "Contoh: bola, buah, hidung Andi",
      "Contoh: di gunung, sampai puas"
    ],
    randoms: [
      [
        "Jokowi",
        "Ahok",
        "Donald Trump",
        "Bambang Pamungkas",
        "Emma Watson",
        "Taylor Swift",
        "Miley Cyrus",
        "Justin Bieber"
      ],
      [
        "menonjok",
        "makan",
        "menari dengan",
        "melihat",
        "menyaksikan",
        "menendang",
        "mengangkat",
        "melempar",
        "mengerjai",
        "menembak"
      ],
      [
        "Jokowi",
        "Ahok",
        "Donald Trump",
        "Bambang Pamungkas",
        "Emma Watson",
        "Taylor Swift",
        "Miley Cyrus",
        "Justin Bieber"
      ],
      [
        "sampai puas",
        "dengan semangat",
        "karena bosan",
        "hari ini",
        "setiap hari",
        "sampai akhir jaman",
        "di atas gunung semeru"
      ]
    ]
  }
};

export default Strings;
