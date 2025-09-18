import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class Post {
  @Field(() => ID)
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  content: string;
}
