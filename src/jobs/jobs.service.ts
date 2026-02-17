import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {} // ← Vous avez bien "prisma"

  // Supprimez cette méthode (doublon inutile)
  // async createJob(createJobDto: CreateJobDto) {
  //   const { title, description, company, location, jobType } = createJobDto;
  //   const job = await this.prismaService.create(createJobDto); // ← ERREUR ICI
  //   return { job };
  // }

  // Gardez seulement celle-ci
  async create(createJobDto: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        title: createJobDto.title,
        description: createJobDto.description,
        location: createJobDto.location,
        type: createJobDto.jobType || 'FULL_TIME',
        company: {
        connect: { id: createJobDto.companyId }
      },
      },
    });
  }

  async findAll() {
    return this.prisma.job.findMany({
      include: {
        company: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    return this.prisma.job.update({
      where: { id },
      data: updateJobDto,
    });
  }

  async remove(id: string) {
    return this.prisma.job.delete({
      where: { id },
    });
  }
}
