import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostType } from './types/post.type';
import { ObjectType, Field, InputType } from '@nestjs/graphql';

/** CMS PostBanner Type */
@ObjectType()
class PostBannerType {
  @Field()
  title: string;

  @Field()
  desc: string;

  @Field()
  image: string;
}

/** Input for updating PostBanner */
@InputType()
class UpdatePostBannerInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  desc?: string;

  @Field({ nullable: true })
  image?: string;
}

@Resolver(() => PostType)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  /** -------- DB CRUD -------- */
  @Query(() => [PostType])
  posts(): Promise<PostType[]> {
    return this.postService.findAll();
  }

  @Mutation(() => PostType)
  createPost(@Args('input') input: CreatePostDto): Promise<PostType> {
    return this.postService.create(input);
  }

  /** -------- CMS PostBanner -------- */
  @Query(() => PostBannerType)
  postBanner() {
    return this.postService.getPostBanner();
  }

  @Mutation(() => PostBannerType)
  updatePostBanner(@Args('input') input: UpdatePostBannerInput) {
    return this.postService.updatePostBanner(input);
  }
}
