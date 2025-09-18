import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class PostType {
  @Field(() => ID)
  _id: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  createdAt: Date; // Add this

  @Field()
  updatedAt: Date; // Add this
}
