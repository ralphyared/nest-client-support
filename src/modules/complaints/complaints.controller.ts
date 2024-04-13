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
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { Types } from 'mongoose';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

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

  @Get('/list')
  async getAllUserComplaints(@Query() query: any, @Req() req: any) {
    const { limit, page } = query;
    const userId = req.user._id;

    const complaintsList = await this.complaintsService.getAllUserComplaints(
      userId,
      +limit,
      +page,
    );
    const count = await this.complaintsService.countUserComplaints(userId);
    const totalPages = Math.ceil(count / +limit);
    return {
      complaintsList,
      totalPages,
    };
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
