import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Types } from 'mongoose';
import { Permissions, Public } from 'src/global/custom-decorators';
import { AuthorizationGuard } from '../auth/authorization.guard';

@UseGuards(AuthorizationGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Permissions({ isEmployee: true, isAdmin: true })
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Public()
  @Get()
  async findAll() {
    return this.categoriesService.getAllCategories();
  }

  @Permissions({ isEmployee: false, isAdmin: true })
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

  @Permissions({ isEmployee: true, isAdmin: true })
  @Get(':id')
  async findOne(@Param('id') id: Types.ObjectId) {
    return this.categoriesService.getCategoryById(id);
  }

  @Permissions({ isEmployee: true, isAdmin: true })
  @Patch(':id')
  async update(
    @Param('id') id: Types.ObjectId,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, updateCategoryDto);
  }

  @Permissions({ isEmployee: true, isAdmin: true })
  @Delete(':id')
  async remove(@Param('id') id: Types.ObjectId) {
    return this.categoriesService.deleteCategory(id);
  }
}
