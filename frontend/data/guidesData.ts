export interface GuideSection {
  heading: string;
  body: string;
}

export interface BuyingGuide {
  slug: string;
  title: string;
  category: "Guide" | "Review" | "Tips";
  summary: string;
  imageTerms: string[];
  relatedCategory: string;
  sections: GuideSection[];
}

export const guides: BuyingGuide[] = [
  {
    slug: "choose-laptop-study-work",
    title: "How to Choose the Right Laptop for Study and Work",
    category: "Guide",
    summary: "Balance performance, portability, battery life, and price without paying for hardware you will not use.",
    imageTerms: ["laptop", "macbook"],
    relatedCategory: "laptop",
    sections: [
      { heading: "Decide your main use case", body: "Office work and studying need reliability, a comfortable screen, and good battery life. Programming benefits from more memory, while editing and gaming need stronger graphics performance." },
      { heading: "Choose CPU, RAM, and storage", body: "For everyday work, 8 GB RAM is the practical minimum. Choose 16 GB for programming or heavier multitasking. SSD storage makes the system feel much faster than a hard drive." },
      { heading: "Consider battery and weight", body: "A powerful laptop is less useful if it is too heavy to carry. Students and commuters should compare battery life, charger size, and total weight." },
      { heading: "Gaming laptop or ultrabook?", body: "Choose a gaming laptop for sustained graphics performance. Choose an ultrabook when portability, quiet operation, and battery life matter more." },
    ],
  },
  { slug: "best-phones-under-20m", title: "Best Phones Under 20M", category: "Guide", summary: "How to prioritize camera, battery, display, and long-term value under 20 million VND.", imageTerms: ["phone", "iphone"], relatedCategory: "phone", sections: [{ heading: "Start with priorities", body: "Choose two priorities such as camera and battery instead of looking for a phone that claims to be best at everything." }, { heading: "Check long-term value", body: "Software support, storage, repair access, and battery health can matter more than one headline specification." }] },
  { slug: "laptop-buying-guide", title: "Laptop Buying Guide", category: "Guide", summary: "A practical checklist for choosing performance, size, memory, and storage.", imageTerms: ["laptop"], relatedCategory: "laptop", sections: [{ heading: "Match the laptop to the workload", body: "List the applications you use most and choose hardware for those tasks." }, { heading: "Avoid unnecessary upgrades", body: "Spend on memory, storage, battery, and display quality before premium features you may not use." }] },
  { slug: "tablet-vs-laptop", title: "Tablet vs Laptop", category: "Review", summary: "Understand which form factor is better for work, study, travel, and entertainment.", imageTerms: ["tablet", "ipad"], relatedCategory: "tablet", sections: [{ heading: "Choose a tablet for flexibility", body: "Tablets are excellent for reading, notes, media, and light portable work." }, { heading: "Choose a laptop for full workflows", body: "A laptop remains better for desktop software, file management, programming, and long typing sessions." }] },
  { slug: "pick-headphones", title: "How to Pick Headphones", category: "Tips", summary: "Compare comfort, isolation, battery, microphone quality, and sound.", imageTerms: ["headphone", "airpods"], relatedCategory: "audio", sections: [{ heading: "Comfort comes first", body: "A great-sounding headset is a poor choice if the fit becomes uncomfortable after an hour." }, { heading: "Match features to your environment", body: "Noise cancellation helps during travel, while microphone quality matters more for calls and classes." }] },
  { slug: "keyboard-buying-basics", title: "Keyboard Buying Basics", category: "Guide", summary: "Understand layout, switches, connectivity, and ergonomics.", imageTerms: ["keyboard"], relatedCategory: "keyboard", sections: [{ heading: "Pick the right layout", body: "Compact layouts save desk space, while full-size keyboards retain a number pad." }, { heading: "Choose switches by feel and noise", body: "Linear switches feel smooth, tactile switches provide feedback, and clicky switches are usually louder." }] },
  { slug: "best-wireless-earbuds", title: "Best Wireless Earbuds", category: "Review", summary: "Choose earbuds for music, calls, exercise, and everyday use.", imageTerms: ["airpods", "earbud"], relatedCategory: "audio", sections: [{ heading: "Fit affects everything", body: "A secure seal improves bass, isolation, and microphone consistency." }, { heading: "Check real battery needs", body: "Compare earbud runtime and charging-case capacity with your normal daily routine." }] },
  { slug: "how-much-ram", title: "How Much RAM Do You Need?", category: "Tips", summary: "Choose enough memory for browsing, office work, coding, gaming, or editing.", imageTerms: ["laptop"], relatedCategory: "laptop", sections: [{ heading: "8 GB for basic use", body: "Eight gigabytes can handle ordinary browsing and office work, but leaves less room for heavy multitasking." }, { heading: "16 GB for comfortable multitasking", body: "Sixteen gigabytes is the safer choice for programming, gaming, and longer ownership." }] },
  { slug: "choose-phone-camera", title: "How to Choose a Phone Camera", category: "Tips", summary: "Look beyond megapixels and compare stabilization, lenses, software, and low-light results.", imageTerms: ["phone", "iphone"], relatedCategory: "phone", sections: [{ heading: "Megapixels are not the whole camera", body: "Sensor size, lens quality, stabilization, and image processing strongly affect results." }, { heading: "Choose lenses you will use", body: "A good main camera and useful telephoto lens may matter more than several weak secondary cameras." }] },
];

export const findGuide = (slug: string) => guides.find((guide) => guide.slug === slug);
