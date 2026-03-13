import { Restaurant } from "./restaurant";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;

  restaurants?: Restaurant[];
}