import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Complaint } from './complaint.schema';

@Injectable()
export class CreateComplaintInterceptor implements NestInterceptor<CreateComplaintDto, any> {
  constructor(@InjectModel(Complaint.name) private complaintModel: Model<Complaint>) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const count = await this.complaintModel.countDocuments();
    request.body.title = request.body.title + `#${count + 1}`;
    request.body.createdBy = request.user._id;
    return next.handle().pipe(
      map(data => {
        return data;
      }),
    );
  }
}
