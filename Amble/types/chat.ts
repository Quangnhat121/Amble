import { Restaurant } from "./restaurant";
import { BookingContext, QuickReply } from "./booking";
import { TableCard } from "@/services/ambleAI";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;

  // Restaurant search results
  restaurants?: Restaurant[];

  // Booking flow — table cards
  tableCards?: TableCard[];

  // Booking context (date/time/partySize/etc filled so far)
  bookingContext?: Partial<BookingContext>;

  // Quick reply chips
  quickReplies?: QuickReply[];

  // Session tracking (compat)
  sessionId?: string;
}