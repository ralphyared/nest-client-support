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
import { Public, Roles } from 'src/global/custom-decorators';
import { AuthorizationGuard } from '../auth/authorization.guard';
import { UserRole } from 'src/global/enums';
import { IdDto, PaginationDto } from 'src/global/common.dto';

@UseGuards(AuthorizationGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Post()
  async create(@Body() body: CreateCategoryDto) {
    return this.categoriesService.createCategory(body);
  }

  @Public()
  @Get()
  async findAll() {
    return this.categoriesService.getAllCategories();
  }

  @Roles(UserRole.ADMIN)
  @Get('/all')
  async getAll(@Query() query: PaginationDto) {
    return this.categoriesService.getAllCategoriesAdmin(query);
  }

  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Get(':id')
  async findOne(@Param() param: IdDto) {
    return this.categoriesService.getCategoryById(param);
  }

  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Patch(':id')
  async update(@Param() param: IdDto, @Body() body: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(param, body);
  }

  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Delete(':id')
  async remove(@Param() param: IdDto) {
    return this.categoriesService.deleteCategory(param);
  }
}
