import { restaurantApi } from "./restaurantApi";
import { parseIntent } from "./aiIntent";

export const ambleAI = {
  async askAI(message: string) {
    try {
      const intent = parseIntent(message);

      const restaurants = await restaurantApi.searchRestaurants(intent);

      if (!restaurants.length) {
        return {
          text: "Sorry I couldn't find any restaurants.",
        };
      }

      const top = restaurants.slice(0, 3);

      const text = ` Here are some great restaurants for you:

${top
  .map(
    (r: any, i: number) => `${i + 1}. ${r.name}
Rating: ${r.rating}
Location: ${r.city}
Cuisine: ${r.cuisine}`
  )
  .join("\n\n")}

Tap a restaurant to explore tables!`;

      return {
        text,
        restaurants: top,
      };
    } catch (err) {
      return {
        text: " AI service unavailable",
      };
    }
  },
};