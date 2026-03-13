export const parseIntent = (message: string) => {
  const msg = message.toLowerCase();

  if (msg.includes("romantic") || msg.includes("date")) {
    return { category: "romantic" };
  }

  if (msg.includes("sushi") || msg.includes("japanese")) {
    return { cuisine: "japanese" };
  }

  if (msg.includes("vietnamese") || msg.includes("local food")) {
    return { cuisine: "vietnamese" };
  }

  if (msg.includes("cheap") || msg.includes("budget")) {
    return { priceRange: "$" };
  }

  if (msg.includes("near")) {
    return { city: "Ho Chi Minh" };
  }

  return { search: message };
};