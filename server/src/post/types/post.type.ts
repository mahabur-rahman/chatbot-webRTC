import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class PostType {
  @Field(() => ID)
  _id: string;

  @Field()
  title: string;

  @Field()
  content: string;
}
