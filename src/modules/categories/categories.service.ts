import { Injectable, Query } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './category.schema';
import { IdDto, PaginationDto } from 'src/global/common.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async getCategoryById(param: IdDto) {
    const { id } = param;
    const category = await this.categoryModel.findById(id);
    if (!category) {
      const err = new Error('Category not found.');
      throw err;
    }
    return category;
  }

  async getAllCategories() {
    return this.categoryModel.find();
  }

  async createCategory(body: CreateCategoryDto) {
    const category = new this.categoryModel(body);
    return category.save();
  }

  async updateCategory(param: IdDto, body: UpdateCategoryDto) {
    const { id } = param;
    const { description, title } = body;
    await this.categoryModel.updateOne(
      { _id: id },
      {
        $set: {
          description,
          title,
        },
      },
    );
  }

  async deleteCategory(param: IdDto) {
    const { id } = param;
    await this.categoryModel.deleteOne({ _id: id });
  }

  async countCategories() {
    return this.categoryModel.countDocuments();
  }

  async getAllCategoriesAdmin(query: PaginationDto) {
    const { limit, page } = query;
    const categoriesList = await this.categoryModel
      .find()
      .limit(+limit)
      .skip((+page - 1) * +limit)
      .sort({ createdAt: -1 });

    const count = await this.countCategories();
    const totalPages = Math.ceil(count / +limit);
    return {
      categoriesList,
      totalPages,
    };
  }
}
