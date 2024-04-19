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
import { ComplaintFilter, UserRequest } from 'src/global/types';
import { complaintNotFoundError } from 'src/global/errors/complaints.errors';
import config from 'src/global/config';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectModel(Complaint.name) private complaintModel: Model<Complaint>,
    @Inject(REQUEST) private readonly request: UserRequest,
    private socketService: SocketService,
  ) {}

  async submitComplaint(body: CreateComplaintDto) {
    const complaint = new this.complaintModel({
      ...body,
    });
    await complaint.save();
    return { complaintId: complaint._id };
  }

  async getUserComplaint(param: IdDto) {
    return this.complaintModel.findOne({
      _id: param.id,
      createdBy: this.request.user._id,
    });
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
          complaints: {
            $push: {
              id: '$_id',
              title: '$title',
              body: '$body',
            },
          },
        },
      },
      {
        $project: {
          status: '$_id',
          _id: 0,
          complaints: 1,
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

  async countUserComplaints(userId?: Types.ObjectId) {
    if (userId) {
      return this.complaintModel.countDocuments({
        createdBy: userId,
      });
    }
    return this.complaintModel.countDocuments();
  }

  async deleteUserComplaint(param: IdDto) {
    await this.complaintModel.deleteOne({ _id: param.id });
  }

  async updateComplaintStatus(param: IdDto, body: UpdateComplaintStatusDto) {
    const { id } = param;
    const { status } = body;
    const complaint = await this.complaintModel.findById(id);
    if (!complaint) {
      throw new NotFoundException(complaintNotFoundError);
    }

    await this.complaintModel.updateOne({ _id: id }, { $set: { status } });

    this.socketService.emitEventToUser(
      String(complaint.createdBy),
      config().socketConfig.events.statusChanged,
      {
        id,
        status,
      },
    );
  }

  async getAllComplaintsFiltered(query: FilteredPaginationDto) {
    const { limit, page, status, userId } = query;
    const filter: ComplaintFilter = {};
    if (userId) filter.createdBy = userId;
    if (status) filter.status = status;

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
