import "dotenv/config";
import connectRedis from "connect-redis";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import { createConnection } from "typeorm";
import { typeormConfig } from "./utils/typeormConfig";
import { __prod__ } from "./utils/consts";
import { UserResolver } from "./resolvers/userResolver";
import cors from "cors";
import { MessageResolver } from "./resolvers/MessageResolver";
// import { Message } from "./entities/Message";

const main = async () => {
  // Connect to database
  const con = await createConnection(typeormConfig);
  await con.runMigrations();

  // Create express app
  const app = express();

  // Create redis session store and client
  const RedisStore = connectRedis(session);
  const redisClient = new Redis(process.env.REDIS_URL);

  app.set("trust proxy", 1);

  // Add cors
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

  // Implement express session
  app.use(
    session({
      name: "sheesh",
      secret: process.env.SECRET!,
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf LOOK UP ON GOOGLE
        secure: __prod__,
      },
      saveUninitialized: false,
      resave: false,
    })
  );

  // apollo server set up
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, MessageResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  // activate /graphql endpoint
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(process.env.PORT, () => {
    console.log("Listening on port 4000");
  });
};

main().catch((err) => {
  console.log(err);
});
