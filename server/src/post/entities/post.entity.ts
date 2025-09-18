import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
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

  // Automatically set when the document is created
  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  // Automatically updated when the document is updated
  @Field()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
