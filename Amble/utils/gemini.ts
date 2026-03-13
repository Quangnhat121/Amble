// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { restaurantApi } from "@/services/restaurantApi";
// import { Restaurant } from "@/types/restaurant";

// const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;


// const getSmartResponse = (
//   message: string,
//   restaurants: Restaurant[]
// ): string => {
//   const msg = message.toLowerCase();

//   if (msg.includes("hello") || msg.includes("hi")) {
//     return ` Hey! I'm **Amble AI**.

// I can help you find the perfect place to eat in Vietnam.

// Try asking:
// • Romantic restaurant for a date
// • Local Vietnamese food near me
// • Sushi restaurant
// • Rooftop dinner with view

// Where do you want to go today? 🍽️`;
//   }

//   if (msg.includes("date") || msg.includes("romantic")) {
//     const picks = restaurants.slice(0, 2);

//     return `✨ Perfect restaurants for a **romantic date**:

// ${picks
//   .map(
//     (r, i) => `${i + 1}. ${r.name}
// ⭐ ${r.rating}
// 📍 ${r.location}
// 🍽️ ${r.cuisine}`
//   )
//   .join("\n\n")}

// Tap a restaurant to explore tables 💛`;
//   }

//   if (msg.includes("sushi") || msg.includes("japanese")) {
//     const sushi = restaurants.filter((r) =>
//       r.cuisine.toLowerCase().includes("japanese")
//     );

//     if (sushi.length === 0)
//       return "Sorry 😢 I couldn't find sushi restaurants.";

//     return `🍣 Sushi lovers! Try these:

// ${sushi
//   .map(
//     (r, i) => `${i + 1}. ${r.name}
// ⭐ ${r.rating}
// 📍 ${r.location}`
//   )
//   .join("\n\n")}`;
//   }

//   if (msg.includes("near") || msg.includes("nearby")) {
//     return `📍 Popular restaurants near you:

// ${restaurants
//   .slice(0, 3)
//   .map(
//     (r, i) => `${i + 1}. ${r.name}
// ⭐ ${r.rating}
// 🍽️ ${r.cuisine}`
//   )
//   .join("\n\n")}

// Want me to show available tables?`;
//   }

//   return `🍽️ I found some great restaurants for you:

// ${restaurants
//   .slice(0, 3)
//   .map(
//     (r, i) => `${i + 1}. ${r.name}
// ⭐ ${r.rating}
// 📍 ${r.location}`
//   )
//   .join("\n\n")}

// Ask me things like:
// • romantic dinner
// • rooftop restaurant
// • sushi
// • Vietnamese food`;
// };

// export const geminiService = {
//   async chatWithAI(userMessage: string): Promise<string> {
//     const restaurants = await restaurantApi.getFeaturedRestaurants()

//     if (!genAI) {
//       return getSmartResponse(userMessage, restaurants);
//     }

//     const context = `
// You are Amble AI, an assistant that helps users find restaurants and book tables in Vietnam.

// Restaurants available:

// ${restaurants
//   .map(
//     (r: Restaurant) => `
// ${r.name}
// Cuisine: ${r.cuisine}
// Location: ${r.location}
// Rating: ${r.rating}
// `
//   )
//   .join("\n")}

// Respond in a friendly Gen Z tone.
// Suggest restaurants and encourage table booking.
// `;

//     const model = genAI.getGenerativeModel({
//       model: "gemini-pro",
//     });

//     const prompt = `${context}

// User: ${userMessage}
// AI:`;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;

//     return response.text();
//   },

//   getQuickReplies(): string[] {
//     return [
//       "Romantic restaurant for a date ❤️",
//       "Local Vietnamese food 🇻🇳",
//       "Best sushi in Saigon 🍣",
//       "Rooftop restaurant 🌇",
//       "Restaurants near me 📍",
//     ];
//   },
// };