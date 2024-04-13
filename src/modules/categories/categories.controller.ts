import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Types } from 'mongoose';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Get()
  async findAll() {
    return this.categoriesService.getAllCategories();
  }

  @Get('/all')
  async getAll(@Query() query: any) {
    const { limit, page } = query;
    const categoryList = await this.categoriesService.getAllCategoriesAdmin(
      +page,
      +limit,
    );
    const count = await this.categoriesService.countCategories();
    const totalPages = Math.ceil(count / +limit);
    return {
      categoryList,
      totalPages,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: Types.ObjectId) {
    return this.categoriesService.getCategoryById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: Types.ObjectId,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, updateCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: Types.ObjectId) {
    return this.categoriesService.deleteCategory(id);
  }
}
