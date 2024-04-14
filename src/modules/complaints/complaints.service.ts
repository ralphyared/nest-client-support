import { Injectable } from '@nestjs/common';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { Complaint } from './complaint.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SocketService } from '../socket/socket.service';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectModel(Complaint.name) private complaintModel: Model<Complaint>,
    private socketService: SocketService,
  ) {}

  async submitComplaint(
    CreateComplaintDto: CreateComplaintDto,
    createdBy: Types.ObjectId,
  ) {
    const count = await this.complaintModel.countDocuments();
    const numberedTitle = CreateComplaintDto.title + `#${count + 1}`;
    const { title: _, ...rest } = CreateComplaintDto;
    const complaint = new this.complaintModel({
      ...CreateComplaintDto,
      title: numberedTitle,
      createdBy,
    });
    await complaint.save();
    return complaint._id;
  }

  async getUserComplaint(userId: Types.ObjectId, complaintId: Types.ObjectId) {
    const complaint = await this.complaintModel.findOne({
      _id: complaintId,
      createdBy: userId,
    });
    if (complaint == null) {
      const err = new Error('Complaints not found.');
      throw err;
    }
    return complaint;
  }

  async getUserComplaintsGroupedStatus(userId: Types.ObjectId) {
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

  async getAllUserComplaints(
    userId: Types.ObjectId,
    limit: number,
    page: number,
  ) {
    const complaintsList = await this.complaintModel
      .find({ createdBy: userId })
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await this.countUserComplaints(userId);
    const totalPages = Math.ceil(count / limit);
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

  async deleteUserComplaint(
    userId: Types.ObjectId,
    complaintId: Types.ObjectId,
  ) {
    const complaint = await this.complaintModel.findOne({
      _id: complaintId,
      createdBy: userId,
    });

    if (complaint == null) {
      const err = new Error('Not authorized to delete.');
      throw err;
    }
    return this.complaintModel.deleteOne({ _id: complaintId });
  }

  async updateComplaintStatus(complaintId: Types.ObjectId, status: string) {
    const complaint = await this.complaintModel.findById(complaintId);
    if (!complaint) {
      const err = new Error('Complaint not found.');
      throw err;
    }

    complaint.status = status.toUpperCase();
    const updatedComplaint = await complaint.save();
    const userId = updatedComplaint.createdBy.toString();

    this.socketService.emitEventToUser(userId, 'statusChanged', {
      complaintId,
      status,
    });
  }

  async getAllComplaintsFiltered(
    page: number,
    limit: number,
    userId?: string,
    status?: string,
  ) {
    const filter: any = {};
    if (userId) filter.createdBy = userId as string;
    if (status) filter.status = (status as string).toUpperCase();

    return this.complaintModel
      .find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: 1 });
  }

  async getComplaintById(complaintId: Types.ObjectId) {
    return this.complaintModel.findById(complaintId);
  }
}
