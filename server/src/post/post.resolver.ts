import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PostService } from './post.service';

import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return this.postService.findAll();
  }

  @Mutation(() => Post)
  createPost(@Args('input') input: CreatePostDto): Promise<Post> {
    return this.postService.create(input);
  }
}
