import type { GalleryImage, Product } from "@/types";

export const demoProducts: Product[] = [
  {
    id: "gobindobhog",
    name: "গোবিন্দভোগ আম",
    slug: "gobindobhog-mango",
    price: 540,
    packages: [
      { weight: "৫ কেজি", price: 540 },
      { weight: "১০ কেজি", price: 850, recommended: true },
      { weight: "২০ কেজি", price: 1600 }
    ],
    shortDescription: "সুগন্ধি, আঁশবিহীন ও মৌসুমের শুরুতেই পাওয়া যায়।",
    description:
      "রাজশাহী অঞ্চলের নির্বাচিত বাগান থেকে সংগ্রহ করা গোবিন্দভোগ আম। প্রাকৃতিকভাবে পরিপক্ব, মিষ্টি ঘ্রাণযুক্ত এবং পরিবারে উপহার দেওয়ার জন্য আদর্শ।",
    featured: true,
    stock: 80,
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Khirsapat%20mango%20of%20Chapainawabganj.jpg?width=1200",
      "https://upload.wikimedia.org/wikipedia/commons/a/a2/Mango_Himsagar_Asit_ftg.jpg",
      "https://images.unsplash.com/photo-1621841957884-1210fe19d66e?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "himsagar",
    name: "হিমসাগর আম",
    slug: "himsagar-mango",
    price: 620,
    packages: [
      { weight: "৫ কেজি", price: 620 },
      { weight: "১০ কেজি", price: 980, recommended: true },
      { weight: "২০ কেজি", price: 1880 }
    ],
    shortDescription: "গভীর মিষ্টতা, কম আঁশ এবং ক্রিমি টেক্সচার।",
    description:
      "প্রিমিয়াম গ্রেডের হিমসাগর আম বাছাই করা হয় রঙ, ঘ্রাণ ও পরিপক্বতার ভিত্তিতে। প্রতিটি কার্টন ফার্মে প্যাক করা হয়।",
    featured: true,
    stock: 64,
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/a/a2/Mango_Himsagar_Asit_ftg.jpg",
      "https://images.unsplash.com/photo-1519096845289-95806ee03a1a?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "langra",
    name: "ল্যাংড়া আম",
    slug: "langra-mango",
    price: 580,
    packages: [
      { weight: "৫ কেজি", price: 580 },
      { weight: "১০ কেজি", price: 920, recommended: true },
      { weight: "২০ কেজি", price: 1760 }
    ],
    shortDescription: "পুরনো দিনের জনপ্রিয় স্বাদ, ঘ্রাণে ভরপুর।",
    description:
      "রাসায়নিকমুক্ত পরিচর্যায় উৎপাদিত ল্যাংড়া আম। ঢাকার ভেতরে দ্রুত ডেলিভারি এবং সারাদেশে কুরিয়ার সুবিধা আছে।",
    featured: true,
    stock: 100,
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/1/16/Vikramshila_Agrovet_2_Langra_Mango_farm%2C_Mathurapur%2C_Bhagalpur_Bihar.JPG",
      "https://images.unsplash.com/photo-1605027990121-cbae9e0642df?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "fazli",
    name: "ফজলি আম",
    slug: "fazli-mango",
    price: 500,
    packages: [
      { weight: "৫ কেজি", price: 500 },
      { weight: "১০ কেজি", price: 800, recommended: true },
      { weight: "২০ কেজি", price: 1500 }
    ],
    shortDescription: "বড় সাইজ, রসালো এবং পরিবারের জন্য সাশ্রয়ী।",
    description:
      "পরিবার ও অফিস গিফটিংয়ের জন্য উপযুক্ত ফজলি আম। অর্ডারের পরে সংগ্রহ ও প্যাকিং করা হয়, তাই সতেজতা থাকে বেশি।",
    featured: false,
    stock: 120,
    images: [
      "https://tds-images.thedailystar.net/sites/default/files/styles/big_202/public/images/2022/05/24/fazli_mango_gi.jpg",
      "https://images.unsplash.com/photo-1591073113125-e46713c829ed?q=80&w=1200&auto=format&fit=crop"
    ]
  }
];

export const demoGallery: GalleryImage[] = [
  {
    id: "farm-1",
    title: "আম বাগানের সকাল",
    height: "tall",
    imageUrl:
      "https://images.unsplash.com/photo-1621293954908-907159247fc8?q=80&w=900&auto=format&fit=crop"
  },
  {
    id: "basket-1",
    title: "নির্বাচিত পাকা আম",
    height: "medium",
    imageUrl:
      "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=900&auto=format&fit=crop"
  },
  {
    id: "pack-1",
    title: "ফার্ম প্যাকিং",
    height: "short",
    imageUrl:
      "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?q=80&w=900&auto=format&fit=crop"
  },
  {
    id: "orchard-2",
    title: "প্রাকৃতিক পরিচর্যা",
    height: "tall",
    imageUrl:
      "https://images.unsplash.com/photo-1519096845289-95806ee03a1a?q=80&w=900&auto=format&fit=crop"
  },
  {
    id: "ripe-2",
    title: "মৌসুমের সেরা ফল",
    height: "medium",
    imageUrl:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=900&auto=format&fit=crop"
  }
];
