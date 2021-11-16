import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types/contextTypes";

export const isAuthenticated: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error("Not logged in, please log in!");
  }
  return next();
};
