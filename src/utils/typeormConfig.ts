import { Message } from "../entities/Message";
import { User } from "../entities/User";
import "dotenv/config";

export const typeormConfig = {
  type: "postgres",
  url: process.env.DATABASE_URL,
  logging: true,
  // synchronize: true, // Only in dev
  entities: [User, Message],
} as any;
