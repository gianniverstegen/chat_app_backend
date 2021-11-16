import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class errorMessage {
  @Field(() => String)
  field: string;
  @Field(() => String)
  message: string;
}

@ObjectType()
export class UserRegistrationLoginResult {
  @Field(() => String)
  succesFlag: boolean;
  @Field(() => errorMessage, { nullable: true })
  errors?: errorMessage;
}
