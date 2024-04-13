import { Injectable, Query } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async getCategoryById(categoryId: Types.ObjectId) {
    const category = await this.categoryModel.findById(categoryId);
    if (!category) {
      const err = new Error('Category not found.');
      throw err;
    }
    return category;
  }

  async getAllCategories() {
    return this.categoryModel.find();
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const category = new this.categoryModel(createCategoryDto);
    return category.save();
  }

  async updateCategory(
    categoryId: Types.ObjectId,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    await this.getCategoryById(categoryId);
    return this.categoryModel.updateOne(
      { _id: categoryId },
      {
        $set: {
          description: updateCategoryDto.description,
          title: updateCategoryDto.title,
        },
      },
    );
  }

  async deleteCategory(categoryId: Types.ObjectId) {
    await this.getCategoryById(categoryId);
    await this.categoryModel.deleteOne({ _id: categoryId });
  }

  async countCategories() {
    return this.categoryModel.countDocuments();
  }

  async getAllCategoriesAdmin(page: number, limit: number) {
    return this.categoryModel
      .find()
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
  }
}
