import { Module } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { ComplaintsController } from './complaints.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Complaint, ComplaintSchema } from './complaint.schema';
import { SocketModule } from '../socket/socket.module';
import { AuthModule } from '../auth/auth.module';
import { CreateComplaintInterceptor } from './complaints.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Complaint.name, schema: ComplaintSchema },
    ]),
    SocketModule,
    AuthModule,
  ],
  controllers: [ComplaintsController],
  providers: [ComplaintsService, CreateComplaintInterceptor],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
