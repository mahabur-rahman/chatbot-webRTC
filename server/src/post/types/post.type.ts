import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class PostType {
  @Field(() => ID)
  id: string; // PostgreSQL UUID

  @Field()
  title: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  banner?: string; // optional if you add banner field

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
