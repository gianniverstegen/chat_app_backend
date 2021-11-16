import { Message } from "../entities/Message";
import {
  Query,
  Resolver,
  Mutation,
  Arg,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import { MyContext } from "../utils/types/contextTypes";
import { isAuthenticated } from "../utils/middleware/isAuth";
import { getRepository } from "typeorm";

@Resolver()
export class MessageResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuthenticated)
  async createMessage(
    @Arg("input") input: string,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    if (input.length === 0) {
      return false;
    }
    try {
      await Message.create({
        text: input,
        creatorId: req.session.userId,
        creatorName: req.session.username,
      }).save();
    } catch (err) {
      console.log(err);
      return false;
    }
    return true;
  }

  @Query(() => [Message])
  async viewMessage(): Promise<Message[]> {
    return await Message.find();
  }

  @Query(() => [Message])
  async viewTodayMessages(): Promise<Message[]> {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    const unixTime = d.getTime();
    const result = await getRepository(Message)
      .createQueryBuilder("message")
      .where("message.createdAt > :unixTime", { unixTime: new Date(unixTime) })
      .getMany();

    return result;
  }

  @Query(() => String)
  async testing() {
    return "aa";
  }
}
