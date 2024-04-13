import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ComplaintsController } from './modules/complaints/complaints.controller';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { UsersController } from './modules/users/users.controller';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthController } from './modules/auth/auth.controller';
import { CategoriesModule } from './modules/categories/categories.module';
import { CategoriesController } from './modules/categories/categories.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.DB_URL),
    ComplaintsModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
  ],
  controllers: [
    ComplaintsController,
    UsersController,
    AuthController,
    CategoriesController,
  ],
  providers: [],
})
export class AppModule {}
