import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostType } from './types/post.type';

@Resolver(() => PostType)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Query(() => [PostType])
  posts(): Promise<PostType[]> {
    return this.postService.findAll();
  }

  @Mutation(() => PostType)
  createPost(@Args('input') input: CreatePostDto): Promise<PostType> {
    return this.postService.create(input);
  }
}
