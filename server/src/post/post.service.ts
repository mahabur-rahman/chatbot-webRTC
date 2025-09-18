import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PostPageJson, PostBanner } from './types/post-cms.type';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  private cmsFilePath = path.join(
    process.cwd(),
    'src',
    'post',
    'cms',
    'post-page.cms.json',
  );

  private async readJson(): Promise<PostPageJson> {
    const raw = await fs.readFile(this.cmsFilePath, 'utf-8');
    return JSON.parse(raw) as PostPageJson;
  }

  private async writeJson(obj: PostPageJson): Promise<void> {
    await fs.writeFile(this.cmsFilePath, JSON.stringify(obj, null, 2), 'utf-8');
  }

  async getPostBanner(): Promise<PostBanner> {
    const json = await this.readJson();
    return json.postBanner;
  }

  async updatePostBanner(data: Partial<PostBanner>): Promise<PostBanner> {
    const json = await this.readJson();
    json.postBanner = { ...json.postBanner, ...data };
    await this.writeJson(json);
    return json.postBanner;
  }

  // DB methods (unchanged)
  async create(createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postRepository.create(createPostDto);
    return this.postRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postRepository.find();
  }
}
