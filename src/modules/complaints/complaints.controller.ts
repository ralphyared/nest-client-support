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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { Types } from 'mongoose';
import { Roles } from 'src/global/custom-decorators';
import { AuthorizationGuard } from '../auth/authorization.guard';
import { UserRole } from 'src/global/enums';
import {
  FilteredPaginationDto,
  IdDto,
  PaginationDto,
} from 'src/global/commons.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { CreateComplaintInterceptor } from './complaints.interceptor';

@UseGuards(AuthorizationGuard)
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Roles(UserRole.ADMIN)
  @Patch('/status/:id')
  async updateComplaintStatus(
    @Param() param: IdDto,
    @Body() body: UpdateComplaintStatusDto,
  ) {
    return this.complaintsService.updateComplaintStatus(param, body);
  }

  @Post()
  @UseInterceptors(CreateComplaintInterceptor)
  async submitComplaint(@Body() body: CreateComplaintDto) {
    return this.complaintsService.submitComplaint(body);
  }

  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Get('/all')
  async getAllComplaintsFiltered(@Query() query: FilteredPaginationDto) {
    return this.complaintsService.getAllComplaintsFiltered(query);
  }

  @Get('/status')
  async getUserComplaintsGroupedStatus() {
    return this.complaintsService.getUserComplaintsGroupedStatus();
  }

  @Get('/list')
  async getAllUserComplaints(@Query() query: PaginationDto) {
    return this.complaintsService.getAllUserComplaints(query);
  }

  @Get(':id')
  async getUserComplaint(@Param() param: IdDto) {
    return this.complaintsService.getUserComplaint(param);
  }

  @Delete(':id')
  async deleteUserComplaint(@Param() param: IdDto) {
    return this.complaintsService.deleteUserComplaint(param);
  }
}
