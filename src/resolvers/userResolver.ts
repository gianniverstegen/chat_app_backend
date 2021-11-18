import { User } from "../entities/User";
import {
  Arg,
  Query,
  Mutation,
  Resolver,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import { getRepository } from "typeorm";
import { UserRegistrationLoginResult } from "../utils/types/userResolverTypes";
import argon2 from "argon2";
import { MyContext } from "../utils/types/contextTypes";
import { isAuthenticated } from "../utils/middleware/isAuth";

declare module "express-session" {
  interface Session {
    userId: any;
    username: any;
  }
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<User | null> {
    if (!req.session.id) {
      return null;
    }
    const user = await User.findOne({ where: { id: req.session.userId } });
    if (!user) {
      return null;
    }
    return user;
  }
  @Query(() => String)
  @UseMiddleware(isAuthenticated)
  hello() {
    return "hello world";
  }

  @Query(() => [User])
  async viewUsers(): Promise<User[]> {
    return User.find();
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext) {
    if (!req.session.userId) {
      return false;
    }
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie("sheesh");
        if (err) {
          resolve(false);
          console.log(err);
        }
        resolve(true);
      })
    );
  }

  @Mutation(() => UserRegistrationLoginResult)
  async login(
    @Ctx() { req }: MyContext,
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string
  ): Promise<UserRegistrationLoginResult> {
    // Find user with username
    let user = undefined;
    if (usernameOrEmail.includes("@")) {
      user = await getRepository(User)
        .createQueryBuilder("user")
        .where("user.email = :email", {
          email: usernameOrEmail,
        })
        .select(["id", "username", "email", "password"])
        .getRawOne();
    } else {
      user = await getRepository(User)
        .createQueryBuilder("user")
        .where("user.username = :username", {
          username: usernameOrEmail,
        })
        .select(["id", "username", "email", "password"])
        .getRawOne();
    }
    // If no user found we return false
    console.log(user);

    if (!user) {
      return {
        succesFlag: false,
        errors: { field: "username", message: "user not found" },
      };
    }

    // Check for password
    const loginResult = await argon2.verify(user.password, password);

    // If incorrect password return false
    if (!loginResult) {
      return {
        succesFlag: false,
        errors: { field: "password", message: "incorrect password" },
      };
    }

    // Save userId in session store
    req.session.userId = user.id;
    req.session.username = user.username;

    // Return true because username and pw are correct
    // and userId is stored in session store
    return { succesFlag: true };
  }

  @Mutation(() => UserRegistrationLoginResult)
  async register(
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Arg("email", { nullable: true }) email?: string
  ): Promise<UserRegistrationLoginResult> {
    // Check username length
    if (username.length < 4) {
      return {
        succesFlag: false,
        errors: {
          field: "username",
          message: "username must be longer than 3 characters",
        },
      };
    }

    if (!/^[a-zA-Z_]+$/.test(username)) {
      return {
        succesFlag: false,
        errors: {
          field: "username",
          message: "Special characters are not allowed",
        },
      };
    }

    if (email) {
      if (!email.includes("@")) {
        return {
          succesFlag: false,
          errors: {
            field: "email",
            message: "Please enter a valid email",
          },
        };
      }
      if (email.length < 6) {
        return {
          succesFlag: false,
          errors: {
            field: "email",
            message: "Please enter a valid email",
          },
        };
      }
      if (!/^[a-zA-Z@.]+$/.test(email)) {
        return {
          succesFlag: false,
          errors: {
            field: "email",
            message: "Please enter a valid email",
          },
        };
      }
    }

    // Check password length
    if (password.length < 9) {
      return {
        succesFlag: false,
        errors: {
          field: "password",
          message: "password must be longer than 9 characters",
        },
      };
    }

    // Hash password
    const hashedPW = await argon2.hash(password);

    // Insert into database
    try {
      await User.create({
        username: username,
        password: hashedPW,
        email: !!email ? email : undefined,
      }).save();
    } catch (err) {
      // Catch if username already exists
      if (err.detail.includes("already exists")) {
        return {
          succesFlag: false,
          errors: { field: "username", message: "username already taken" },
        };
      } else {
        // Else we only return the succesflag as false
        return {
          succesFlag: false,
        };
      }
    }
    return { succesFlag: true };
  }

  @Mutation(() => Boolean)
  async registerOneTimeUser(@Ctx() { req }: MyContext): Promise<boolean> {
    const randomUserId = makeid();
    const randomPassWord = makePassword();

    const hashedPW = await argon2.hash(randomPassWord);

    let user;

    try {
      user = await User.create({
        username: randomUserId,
        password: hashedPW,
      }).save();
    } catch (err) {
      // Catch if username already exists
      return false;
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    return true;
  }
}

function makeid() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return "User-" + result;
}

function makePassword() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 20; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return "User-" + result;
}
