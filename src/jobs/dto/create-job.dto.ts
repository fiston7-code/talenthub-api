import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { JobType } from 'prisma/generated/enums';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNumber()
  @IsOptional()
  salaryMin: number;

  @IsNumber()
  @IsOptional()
  salaryMax: number;

  @IsString()
  @IsOptional()
  experience: string;

  @IsEnum(JobType)
  @IsOptional()
  type?: JobType;
}
