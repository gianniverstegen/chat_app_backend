import { Field, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity() // Entity for the DB
@ObjectType() // ObjectType for graphQL
export class Message extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column()
  creatorId: number;

  @Field()
  @Column()
  creatorName: string;

  @Field()
  @ManyToOne(() => User, (user) => user.messages)
  creator: User;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
}
