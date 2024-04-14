import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { Types } from 'mongoose';
import { Permissions } from 'src/global/custom-decorators';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Permissions({ isEmployee: true, isAdmin: true })
  @Patch('/status/:id')
  async updateComplaintStatus(
    @Param('id') id: Types.ObjectId,
    @Body('status') status: string,
  ) {
    await this.complaintsService.updateComplaintStatus(id, status);
  }

  @Post()
  async submitComplaint(
    @Body() createComplaintDto: CreateComplaintDto,
    @Req() req: any,
  ) {
    return this.complaintsService.submitComplaint(
      createComplaintDto,
      req.user._id,
    );
  }

  @Permissions({ isEmployee: true, isAdmin: true })
  @Get('/all')
  async getAllComplaintsFiltered(@Query() query: any) {
    const { page, limit, userId, status } = query;
    const complaintsList =
      await this.complaintsService.getAllComplaintsFiltered(
        +page,
        +limit,
        userId,
        status,
      );

    const count = await this.complaintsService.countUserComplaints(userId);
    return {
      complaintsList,
      totalPages: Math.ceil(count / +limit),
    };
  }

  @Get('/status')
  async getUserComplaintsGroupedStatus(@Req() req: any) {
    const userId = req.user._id;
    return this.complaintsService.getUserComplaintsGroupedStatus(userId);
  }

  @Get('/list')
  async getAllUserComplaints(@Query() query: any, @Req() req: any) {
    const { limit, page } = query;
    const userId = req.user._id;

    return this.complaintsService.getAllUserComplaints(userId, +limit, +page);
  }

  @Get(':id')
  async getUserComplaint(@Param('id') id: Types.ObjectId, @Req() req: any) {
    return this.complaintsService.getUserComplaint(req.user._id, id);
  }

  @Delete(':id')
  async deleteUserComplaint(@Param('id') id: Types.ObjectId, @Req() req: any) {
    return this.complaintsService.deleteUserComplaint(req.user._id, id);
  }
}
