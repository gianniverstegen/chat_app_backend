import { Message } from "../entities/Message";
import { User } from "../entities/User";

export const typeormConfig = {
  type: "postgres",
  database: "babel_session",
  username: "gianni",
  logging: true,
  synchronize: true,
  entities: [User, Message],
} as any;
