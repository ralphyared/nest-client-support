import { Injectable } from '@nestjs/common';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { Complaint } from './complaint.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectModel(Complaint.name) private complaintModel: Model<Complaint>,
  ) {}

  async submitComplaint(
    CreateComplaintDto: CreateComplaintDto,
    createdBy: Types.ObjectId,
  ) {
    const complaint = new this.complaintModel({
      ...CreateComplaintDto,
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

  async getAllUserComplaints(
    userId: Types.ObjectId,
    limit: number,
    page: number,
  ) {
    return this.complaintModel
      .find({ createdBy: userId })
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
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

  // UpdateComplaintStatus Socket.io

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
