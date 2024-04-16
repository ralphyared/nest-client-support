import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { Complaint } from './complaint.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SocketService } from '../socket/socket.service';
import {
  FilteredPaginationDto,
  IdDto,
  PaginationDto,
} from 'src/global/commons.dto';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/global/types';
import { complaintNotFoundError } from 'src/global/errors/complaints.errors';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectModel(Complaint.name) private complaintModel: Model<Complaint>,
    @Inject(REQUEST) private readonly request: UserRequest,
    private socketService: SocketService,
  ) {}

  async submitComplaint(body: CreateComplaintDto) {
    const count = await this.complaintModel.countDocuments();
    const numberedTitle = body.title + `#${count + 1}`;
    const { title: _, ...rest } = body;
    const complaint = new this.complaintModel({
      ...body,
      title: numberedTitle,
      createdBy: this.request.user._id,
    });
    await complaint.save();
    return complaint._id;
  }

  async getUserComplaint(param: IdDto) {
    const userId = this.request.user._id;
    const { id } = param;
    const complaint = await this.complaintModel.findOne({
      _id: id,
      createdBy: userId,
    });
    if (complaint == null) {
      throw new NotFoundException(complaintNotFoundError);
    }
    return complaint;
  }

  async getUserComplaintsGroupedStatus() {
    const userId = this.request.user._id;
    const aggregation = [
      {
        $match: {
          createdBy: `${userId}`,
        },
      },
      {
        $group: {
          _id: '$status',
          complaints: { $push: '$$ROOT' },
          count: { $sum: 1 },
        },
      },
    ];

    return this.complaintModel.aggregate(aggregation);
  }

  async getAllUserComplaints(query: PaginationDto) {
    const userId = this.request.user._id;
    const { limit, page } = query;
    const complaintsList = await this.complaintModel
      .find({ createdBy: userId })
      .limit(+limit)
      .skip((+page - 1) * +limit)
      .sort({ createdAt: -1 });

    const count = await this.countUserComplaints(userId);
    const totalPages = Math.ceil(+count / +limit);
    return {
      complaintsList,
      totalPages,
    };
  }

  async countUserComplaints(userId?: any) {
    if (userId) {
      return this.complaintModel.countDocuments({
        createdBy: userId as string,
      });
    }
    return this.complaintModel.countDocuments();
  }

  async deleteUserComplaint(param: IdDto) {
    const userId = this.request.user._id;
    const { id } = param;
    const complaint = await this.complaintModel.findOne({
      _id: id,
      createdBy: userId,
    });

    if (complaint == null) {
      throw new ForbiddenException();
    }
    await this.complaintModel.deleteOne({ _id: id });
  }

  async updateComplaintStatus(param: IdDto, body: UpdateComplaintStatusDto) {
    const { id } = param;
    const { status } = body;
    const complaint = await this.complaintModel.findById(id);
    if (!complaint) {
      throw new NotFoundException(complaintNotFoundError);
    }

    complaint.status = status;
    const updatedComplaint = await complaint.save();
    const userId = updatedComplaint.createdBy.toString();

    this.socketService.emitEventToUser(userId, 'statusChanged', {
      id,
      status,
    });
  }

  async getAllComplaintsFiltered(query: FilteredPaginationDto) {
    const { limit, page, status, userId } = query;
    const filter: any = {};
    if (userId) filter.createdBy = userId as string;
    if (status) filter.status = (status as string).toUpperCase();

    const complaintsList = await this.complaintModel
      .find(filter)
      .limit(+limit * 1)
      .skip((+page - 1) * +limit)
      .sort({ createdAt: 1 });

    const count = await this.countUserComplaints(userId);
    return {
      complaintsList,
      totalPages: Math.ceil(count / +limit),
    };
  }

  async getComplaintById(complaintId: Types.ObjectId) {
    return this.complaintModel.findById(complaintId);
  }
}
