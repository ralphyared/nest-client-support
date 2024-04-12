import { Injectable } from '@nestjs/common';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { Complaint } from './complaint.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectModel(Complaint.name) private complaintModel: Model<Complaint>,
  ) {}

  async submitComplaint(CreateComplaintDto: CreateComplaintDto) {
    const complaint = new this.complaintModel(CreateComplaintDto);
    await complaint.save();
    return complaint._id;
  }

  async findAll() {
    return `This action returns all complaints`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} complaint`;
  }

  async update(id: number, updateComplaintDto: UpdateComplaintDto) {
    return `This action updates a #${id} complaint`;
  }

  async remove(id: number) {
    return `This action removes a #${id} complaint`;
  }
}
