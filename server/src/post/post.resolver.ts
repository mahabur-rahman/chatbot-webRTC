import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PostService } from './post.service';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Query(() => [Post])
  async posts() {
    return this.postService.findAll();
  }

  @Query(() => Post, { nullable: true })
  async post(@Args('id') id: string) {
    return this.postService.findOne(id);
  }

  @Mutation(() => Post)
  async createPost(@Args('input') input: CreatePostDto) {
    return this.postService.create(input);
  }
}
