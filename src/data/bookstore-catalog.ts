export interface OfficialBook {
  id: string; // ISBN or unique handle
  slug: string;
  title: string;
  subtitle?: string;
  author: string;
  authorBio?: string;
  genre: "Poetry" | "Finance & Wealth" | "Contemporary Fiction" | "Philosophy & Drama" | "Spiritual & Healing" | "Hindi Sahitya" | "Nonfiction";
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewsCount: number;
  frontCover: string;
  backCover: string;
  fallbackCover: string;
  isbn: string;
  pages: number;
  language: string;
  format: string; // "Paperback", "Hardcover", "eBook"
  publisher: string;
  publicationDate: string;
  dimensions: string;
  weight: string;
  synopsis: string;
  fullDescription: string[];
  keyHighlights: string[];
  reviews: {
    author: string;
    rating: number;
    date: string;
    verified: boolean;
    title: string;
    content: string;
  }[];
}

export const OFFICIAL_BOOKSTORE_CATALOG: OfficialBook[] = [
  {
    id: "9789375431183",
    slug: "hope-between-the-lines",
    title: "Hope Between the Lines",
    subtitle: "English and Hindi Poems",
    author: "Anisha Amol Karmalkar",
    authorBio: "Anisha Amol Karmalkar is a bilingual poet and writer whose work explores the quiet intersections of everyday vulnerability, memory, and emotional resilience across languages.",
    genre: "Poetry",
    price: 210,
    compareAtPrice: 299,
    rating: 4.9,
    reviewsCount: 148,
    frontCover: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/9789375431183_front.jpg?v=1784963237",
    backCover: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/9789375431183_back.jpg?v=1784963237",
    fallbackCover: "/images/bookleaf/hope-between-the-lines.jpg",
    isbn: "9789375431183",
    pages: 142,
    language: "English & Hindi (Bilingual)",
    format: "Paperback",
    publisher: "BookLeaf Publishing",
    publicationDate: "July 2024",
    dimensions: "5.5 x 0.35 x 8.5 inches",
    weight: "185 grams",
    synopsis: "This collection of poems brings together the lyrical beauty of English and the soulful depth of Hindi. Each verse is a reflection of life's emotions — love, hope, longing, and resilience — woven across two languages yet united by one heart. Whether read in English or Hindi, these poems invite you to pause, feel, and connect with the universal rhythm of human experience.",
    fullDescription: [
      "\"Hope Between the Lines\" is a bilingual poetic tapestry designed to accompany readers through the quiet corridors of introspection and healing.",
      "Divided into dual expressions, the collection bridges the cadence of contemporary English verse with the lyrical, earthen warmth of Hindi poetry (शायरी व कविताएं). Each chapter unfolds like a confidential conversation between heart and paper.",
      "From quiet dawn reflections to the bittersweet endurance of love, Anisha Amol Karmalkar crafts verses that do not preach, but gently reassure. A celebration of emotional honesty, printed on certified high-opacity cream paper with soft-touch matte lamination."
    ],
    keyHighlights: [
      "Official BookLeaf Bestseller & Staff Favorite",
      "Bilingual Verse Collection (English & Hindi)",
      "High-Opacity Cream Paper (80 GSM) with Soft-Touch Velvet Matte Finish",
      "National Distribution across Amazon, Flipkart, and BookLeaf Bookstore",
      "Author Royalty Protected (100% Transparency Imprint)"
    ],
    reviews: [
      {
        author: "Pooja Sharma",
        rating: 5,
        date: "October 14, 2024",
        verified: true,
        title: "Touches the very core of your heart",
        content: "The switch between English and Hindi is so seamless. You read a piece in English and feel understood, then the next Hindi poem leaves you with goosebumps. Beautiful production quality by BookLeaf."
      },
      {
        author: "Devendra Mehta",
        rating: 5,
        date: "September 28, 2024",
        verified: true,
        title: "Pure lyrical gold",
        content: "A genuine bedside companion. Perfect for early mornings with a cup of tea. Delivery was prompt and packaging was pristine."
      },
      {
        author: "Kavita Rao",
        rating: 4.8,
        date: "August 19, 2024",
        verified: true,
        title: "Superb cover and binding",
        content: "The floral cover illustration looks even more vivid in person. The paper thickness is top-notch."
      }
    ]
  },
  {
    id: "9788199612686",
    slug: "from-middle-class-to-millionaire",
    title: "From Middle Class to Millionaire – Lessons That Changed My Life",
    subtitle: "The Real Story of Dreams, Doubts & Daring to Rise",
    author: "Saumya Singh",
    authorBio: "Saumya Singh is a content creator, entrepreneur, and author who grew from a modest middle-class home to building a sustainable media venture and gifting her parents a home at age 23.",
    genre: "Finance & Wealth",
    price: 210,
    compareAtPrice: 350,
    rating: 4.8,
    reviewsCount: 312,
    frontCover: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/FrontCover_b362f06d-2376-42f2-8565-49dcbfbcb9a6.png?v=1776934789",
    backCover: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/BackCoverISBN.png?v=1776934788",
    fallbackCover: "/images/bookleaf/middle-class-to-millionaire.png",
    isbn: "9788199612686",
    pages: 220,
    language: "English",
    format: "Paperback",
    publisher: "BookLeaf Publishing",
    publicationDate: "August 2024",
    dimensions: "5.5 x 0.52 x 8.5 inches",
    weight: "260 grams",
    synopsis: "This is not a fairytale. It's the raw, real, and powerful story of a girl who had no rich connections, no elite degrees, and no fancy tools — just an unshakable dream to break free. Saumya Singh grew up in a small middle-class household where luxury was a far-off dream. From editing videos on a dying phone to gifting her parents a ₹1.5 crore home at 23, Saumya's journey is proof that your background does not define your future.",
    fullDescription: [
      "\"From Middle Class to Millionaire\" breaks down the psychological conditioning, economic friction, and practical steps necessary to break out of middle-class inertia in India.",
      "Saumya Singh walks the reader through her unvarnished journey: from counting rupees for transport to navigating freelance burnout, understanding modern digital monetization, building scalable assets, and mastering emotional discipline around money.",
      "Packed with real-life case studies, monthly cashflow frameworks, and actionable self-audits, this is an essential manual for young professionals, creators, and ambitious dreamers fighting quiet financial battles."
    ],
    keyHighlights: [
      "Top Trending National Finance & Self-Help Bestseller",
      "Includes Actionable Budgeting & Monetization Frameworks",
      "Authentic, Relatable Indian Context & Ground Realities",
      "Premium Gloss Cover with Anti-Scuff Coating",
      "Printed & Dispatched under BookLeaf POD Network"
    ],
    reviews: [
      {
        author: "Rohan Varma",
        rating: 5,
        date: "October 10, 2024",
        verified: true,
        title: "No fluff, just raw truth",
        content: "Most finance books written by Western authors don't apply to Indian middle-class households. Saumya speaks our language, our fears, and gives realistic, executable advice."
      },
      {
        author: "Meenakshi Sundaram",
        rating: 5,
        date: "September 15, 2024",
        verified: true,
        title: "Gifted this to my younger brother",
        content: "Inspiring from page 1. The chapter on building digital leverage and saving without feeling deprived is worth ten times the price of this book."
      }
    ]
  },
  {
    id: "9789375279310",
    slug: "the-language-of-us",
    title: "The Language of Us",
    subtitle: "Lines Written by the Heart",
    author: "Sohani Jani",
    authorBio: "Sohani Jani is a contemporary romantic poet and storyteller known for capturing subtle emotional silences, longing, and delicate domestic intimacies in lyrical simplicity.",
    genre: "Contemporary Fiction",
    price: 249,
    compareAtPrice: 320,
    rating: 4.9,
    reviewsCount: 289,
    frontCover: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/image-1_83410d26-8ccb-4c96-b926-f09f312241f8.png?v=1775044230",
    backCover: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/image-1_3598297a-30c6-4258-92d0-58d74e3ccdfa.png?v=1775211407",
    fallbackCover: "/images/bookleaf/the-language-of-us.png",
    isbn: "9789375279310",
    pages: 196,
    language: "English",
    format: "Paperback",
    publisher: "BookLeaf Publishing",
    publicationDate: "June 2024",
    dimensions: "5.5 x 0.45 x 8.5 inches",
    weight: "220 grams",
    synopsis: "The Language of Us is a collection of evocative poems that explores the quiet power of emotional intimacy. Moving through themes of tenderness, devotion, and timeless love, these poems reflect relationships as lived experiences shaped by silence, choice, and shared moments. Written in a lyrical yet accessible voice, the collection invites readers to pause, reflect, and rediscover their own understanding of love.",
    fullDescription: [
      "Not every love story needs dramatic crescendos. In \"The Language of Us,\" Sohani Jani turns the spotlight on the unsaid words, the lingering glances across crowded rooms, and the quiet comfort of being truly seen by another person.",
      "Across 196 tender pages, the collection traces the arc of romantic attachment — from tentative beginnings and shared humor, to weathered storms, mutual forgiveness, and enduring companionship.",
      "An ideal keepsake for lovers of heartfelt, understated poetry that echoes long after the book is closed."
    ],
    keyHighlights: [
      "Bestseller in Contemporary Indian Romance & Poetry",
      "Sophisticated Minimalist Forest-Green Cover Design",
      "Custom Typography & Interior Layout",
      "Over 3,200 Copies Dispatched Worldwide"
    ],
    reviews: [
      {
        author: "Aakanksha Roy",
        rating: 5,
        date: "September 02, 2024",
        verified: true,
        title: "Breathtakingly gentle",
        content: "Sohani Jani has a way with words that feels like a warm embrace. If you've ever loved someone through difficult days, this book will speak directly to you."
      }
    ]
  },
  {
    id: "9789375432029",
    slug: "verses-on-the-human-stage",
    title: "Verses on The HUMAN Stage",
    subtitle: "All of us. On Display.",
    author: "S Sujit Nayak",
    authorBio: "S Sujit Nayak is a dramatist, essayist, and poet exploring social sociology, theatrical metaphor, and human psychology.",
    genre: "Philosophy & Drama",
    price: 220,
    compareAtPrice: 280,
    rating: 4.7,
    reviewsCount: 195,
    frontCover: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/front_0d9e2d7b-d802-41e2-a244-64e4bf5e6e47.png?v=1778218422",
    backCover: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/1776360356590_9789375432029_back.png?v=1778218250",
    fallbackCover: "/images/bookleaf/verses-on-the-human-stage.png",
    isbn: "9789375432029",
    pages: 168,
    language: "English",
    format: "Paperback",
    publisher: "BookLeaf Publishing",
    publicationDate: "May 2024",
    dimensions: "5.5 x 0.4 x 8.5 inches",
    weight: "205 grams",
    synopsis: "A poetic look at human nature and its many shades, where ego, emotion, and instinct take the lead. These verses mirror the lives we quietly perform on a stage called society. Where masks slip between moments of truth, and silence often speaks the loudest lines. In fleeting acts of pride, fear, and grace, we reveal more than we ever intend.",
    fullDescription: [
      "\"All the world's a stage\" receives a vivid 21st-century reinterpretation in S Sujit Nayak's compelling anthology.",
      "The book deconstructs modern personas — the curated digital facade, the corporate polite smile, the familial sacrifice, and the hidden dread of solitude. Through rhythmic monologue and sharp cadence, Nayak invites the audience behind the backstage curtain.",
      "Striking theatrical artwork, rich dark aesthetic, and sharp philosophical insights make this a cornerstone work in contemporary Indian English verse."
    ],
    keyHighlights: [
      "Dramatic Philosophical Verse Collection",
      "Striking Theatrical Venetian Mask Cover Art",
      "High Density Acid-Free Book Paper",
      "Registered ISBN & Worldwide Rights"
    ],
    reviews: [
      {
        author: "Tariq Anwer",
        rating: 5,
        date: "August 11, 2024",
        verified: true,
        title: "Intense, thought-provoking, and original",
        content: "A masterclass in examining our social masquerades. Every poem leaves you examining your own daily behavior."
      }
    ]
  },
  {
    id: "9789375271727",
    slug: "the-light-i-became",
    title: "The Light I Became",
    subtitle: "Musings on Healing, Grace & Becoming",
    author: "Rupika Talwar",
    authorBio: "Rupika Talwar is an author, mindfulness coach, and wellness advocate specializing in trauma healing and spiritual writing.",
    genre: "Spiritual & Healing",
    price: 299,
    compareAtPrice: 399,
    rating: 4.9,
    reviewsCount: 164,
    frontCover: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/image-1_c47d1a64-21b7-47b2-baad-73bc6f5941ec.png",
    backCover: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/image-1_c47d1a64-21b7-47b2-baad-73bc6f5941ec.png",
    fallbackCover: "/images/bookleaf/the-light-i-became.png",
    isbn: "9789375271727",
    pages: 176,
    language: "English",
    format: "Paperback",
    publisher: "BookLeaf Publishing",
    publicationDate: "April 2024",
    dimensions: "5.5 x 0.42 x 8.5 inches",
    weight: "210 grams",
    synopsis: "A soulful journey through breaking, awakening, and remembering. Tracing the transformation of a woman who walked through her shadows and found a doorway back to herself. A companion for anyone healing or grieving.",
    fullDescription: [
      "A luminous collection of essays and verse dedicated to the art of self-reclamation. Written during times of profound silence and renewal, Rupika Talwar's words offer a soft landing for exhausted souls.",
      "The book navigates through 4 movements: The Fall, The Silence, The Ember, and The Light."
    ],
    keyHighlights: [
      "Spiritual & Healing Bestseller",
      "Soft Gold Foil Embossed Lettering",
      "Includes Guided Reflection Prompts"
    ],
    reviews: [
      {
        author: "Shreya Sen",
        rating: 5,
        date: "September 20, 2024",
        verified: true,
        title: "Brought tears to my eyes",
        content: "Healing in every word. Rupika writes with so much grace and gentleness."
      }
    ]
  },
  {
    id: "9789375275404",
    slug: "khalbali-lafzon-ki-panchayat",
    title: "Khalbali (Lafzon ki Panchayat)",
    subtitle: "समकालीन हिन्दी कविता व शायरी",
    author: "Shivangi Garg",
    authorBio: "Shivangi Garg is a spoken-word artist and Hindi poetess celebrated for her fiery commentary on modern relationships and independence.",
    genre: "Hindi Sahitya",
    price: 199,
    compareAtPrice: 250,
    rating: 4.8,
    reviewsCount: 142,
    frontCover: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/9789375275404_front.png",
    backCover: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/9789375275404_front.png",
    fallbackCover: "/images/bookleaf/khalbali.png",
    isbn: "9789375275404",
    pages: 130,
    language: "Hindi & Hinglish",
    format: "Paperback",
    publisher: "BookLeaf Publishing",
    publicationDate: "March 2024",
    dimensions: "5.5 x 0.32 x 8.5 inches",
    weight: "165 grams",
    synopsis: "मन के द्वंद्व, समाज के रीति-रिवाजों और आधुनिक रिश्तों की कड़वी-मीठी सच्चाइयों को बेबाक लहजे में बयां करती कविताओं की एक अनूठी पंचायत।",
    fullDescription: [
      "खलबली केवल एक किताब नहीं, बल्कि हर उस दिल की आवाज़ है जो चुपचाप बहुत कुछ सहता और सोचता है।",
      "शिवांगी गर्ग ने युवा पीढ़ी की उलझनों, सपनों और टूटते-जुड़ते रिश्तों को अपने धारदार और आत्मीय शब्दों में पिरोया है।"
    ],
    keyHighlights: [
      "Top Trending Hindi Poetry",
      "Spoken Word Sensation",
      "Compact Pocket Size Edition"
    ],
    reviews: [
      {
        author: "Virendra Singh",
        rating: 5,
        date: "August 29, 2024",
        verified: true,
        title: "लाजवाब शायरी",
        content: "हर कविता सीधे दिल में उतरती है। शिवांगी जी का अंदाज़ बहुत ही ताज़ा और सच्चा है।"
      }
    ]
  },
  {
    id: "9789376666621",
    slug: "april",
    title: "April",
    subtitle: "A Season of Memory and Grace",
    author: "Anshuman Koushik",
    authorBio: "Anshuman Koushik is a narrative poet and filmmaker whose writing revolves around grief, seasonal change, and endurance.",
    genre: "Poetry",
    price: 350,
    compareAtPrice: 450,
    rating: 4.9,
    reviewsCount: 110,
    frontCover: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/9789376666621_front.jpg",
    backCover: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/9789376666621_back.jpg",
    fallbackCover: "/images/bookleaf/hope-between-the-lines.jpg",
    isbn: "9789376666621",
    pages: 184,
    language: "English",
    format: "Paperback",
    publisher: "BookLeaf Publishing",
    publicationDate: "May 2024",
    dimensions: "5.5 x 0.44 x 8.5 inches",
    weight: "230 grams",
    synopsis: "April is a poetry collection exploring love, longing, memory, trauma, and loss, while finding quiet beauty in patience and hope. Written and shaped over five years, the collection traces life's difficult seasons.",
    fullDescription: [
      "Named after its protagonist's birth month, each chapter enters a different kind of heartbreak and reflects on the resilience it takes to endure.",
      "An evocative masterpiece exploring how time softens sharp edges without erasing the truth of what was lived."
    ],
    keyHighlights: [
      "Five-Year Retrospective Collection",
      "Fine Art Photography Inside",
      "Collector's Heavyweight Matte Edition"
    ],
    reviews: [
      {
        author: "Nalini Krishnan",
        rating: 5,
        date: "September 05, 2024",
        verified: true,
        title: "Hauntingly beautiful",
        content: "Anshuman's writing is visual and visceral. You can smell the wet earth and feel the cooling breeze through these pages."
      }
    ]
  },
  {
    id: "9789375106715",
    slug: "it-stayed",
    title: "It Stayed",
    subtitle: "Poems on What Remains",
    author: "Himanshu Chopra",
    authorBio: "Himanshu Chopra writes about relationships, urban solitudes, and small unspoken gestures.",
    genre: "Contemporary Fiction",
    price: 210,
    compareAtPrice: 280,
    rating: 4.8,
    reviewsCount: 175,
    frontCover: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/image-1_9d8a6d9f-4d13-416f-85a9-acadecbdf5e4.png",
    backCover: "https://cdn.shopify.com/s/files/1/0860/3648/0312/files/image-1_f75574dd-b80e-4b89-9ec9-fc2551577067.png",
    fallbackCover: "/images/bookleaf/the-language-of-us.png",
    isbn: "9789375106715",
    pages: 152,
    language: "English",
    format: "Paperback",
    publisher: "BookLeaf Publishing",
    publicationDate: "April 2024",
    dimensions: "5.5 x 0.36 x 8.5 inches",
    weight: "190 grams",
    synopsis: "This book isn't about grand gestures. It's about the small things that stay after conversations fade, after meetings end, after someone starts to matter more than they should.",
    fullDescription: [
      "Across these poems, a relationship forms the way most real ones do: slowly, unevenly, without clear labels.",
      "Curiosity turns into habit. Habit becomes care. Care grows into something heavier — something that doesn't always get a name."
    ],
    keyHighlights: [
      "Contemporary Relational Poetry",
      "Velvet Finish Soft Cover",
      "Pocketbook Format"
    ],
    reviews: [
      {
        author: "Rahul Batra",
        rating: 5,
        date: "August 18, 2024",
        verified: true,
        title: "Hits too close to home",
        content: "If you've ever had someone you couldn't put into words, this book is for you."
      }
    ]
  }
];

export function getBookByIdOrSlug(identifier: string): OfficialBook | undefined {
  const clean = identifier.toLowerCase().trim();
  return OFFICIAL_BOOKSTORE_CATALOG.find(
    (b) =>
      b.id.toLowerCase() === clean ||
      b.slug.toLowerCase() === clean ||
      b.isbn.toLowerCase() === clean
  );
}
