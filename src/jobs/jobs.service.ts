import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { FilterJobDto } from './dto/filter-job.dto';
import { Prisma } from '../../prisma/generated/client';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  /**
   * ✅ CRÉER UNE OFFRE
   */
  async create(createJobDto: CreateJobDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { companyProfile: true } 
    });

    if (!user?.companyProfile) {
      throw new BadRequestException(
        "Profil entreprise inexistant. Créez votre profil d'abord.",);
    }

    return this.prisma.job.create({
      data: {
        title: createJobDto.title,
        description: createJobDto.description,
        location: createJobDto.location,
        salaryMin: createJobDto.salaryMin,
        salaryMax: createJobDto.salaryMax,
        experience: createJobDto.experience,
        // On utilise le "as any" ou le casting si le DTO et Prisma ont un léger décalage de type
        type: createJobDto.type as any, 
        companyId: user.companyProfile.id,
      },
    });
  }

  /**
   * 🔍 RECHERCHER DES OFFRES (Filtres + Pagination)
   */
  async findAll(filters: FilterJobDto) {
    const { search, location, type, experience, companyId, page = 1, limit = 10 } = filters;

    const where: Prisma.JobWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (type) where.type = type as any;
    
    if (experience) {
      where.experience = { contains: experience, mode: 'insensitive' };
    }

    if (companyId) where.companyId = companyId;

    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: { id: true, companyName: true, logoUrl: true }
          }
        }
      }),
      this.prisma.job.count({ where })
    ]);

    return {
      data: jobs,
      meta: { 
        total, 
        page: Number(page), 
        limit: Number(limit), 
        totalPages: Math.ceil(total / Number(limit)) 
      }
    };
  }

  /**
   * 📋 OFFRES D'UNE ENTREPRISE SPÉCIFIQUE
   */
  async findByCompany(userId: string) {
    return this.prisma.job.findMany({
      where: {
        company: { userId: userId }
      },
      include: {
        _count: { select: { applications: true } }
      }
    });
  }

  /**
   * 📄 DÉTAIL D'UNE OFFRE
   */
  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: { 
          include: { user: { select: { id: true } } } // Pour vérifier le propriétaire
        },
        _count: { select: { applications: true } }
      }
    });

    if (!job) throw new NotFoundException(`Offre #${id} introuvable`);
    return job;
  }

  /**
   * ✏️ MODIFIER UNE OFFRE
   */
  async update(id: string, userId: string, updateJobDto: UpdateJobDto) {
    const job = await this.findOne(id);

    // Sécurité : Vérifie que l'USER qui demande est le proprio via CompanyProfile
    if (job.company.userId !== userId) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à modifier ce job");
    }

    return this.prisma.job.update({
      where: { id },
      data: updateJobDto as any,
    });
  }

  /**
   * 🗑️ SUPPRIMER UNE OFFRE
   */
  async remove(id: string, userId: string) {
    const job = await this.findOne(id);

    if (job.company.userId !== userId) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à supprimer ce job");
    }

    return this.prisma.job.delete({ where: { id } });
  }
}

// import { 
//   Injectable, 
//   NotFoundException, 
//   ForbiddenException,
//   BadRequestException 
// } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { CreateJobDto } from './dto/create-job.dto';
// import { UpdateJobDto } from './dto/update-job.dto';
// import { FilterJobDto } from './dto/filter-job.dto';
// import { Prisma } from '../../prisma/generated/client';

// @Injectable()
// export class JobsService {
//   constructor(private prisma: PrismaService) {}

//   /**
//    * ✅ CRÉER UNE OFFRE
//    */
//   async create(createJobDto: CreateJobDto, userId: string) {
//     const user = await this.prisma.user.findUnique({
//       where: { id: userId },
//       include: { companyProfile: true } 
//     });

//     if (!user?.companyProfile) {
//       throw new BadRequestException("Profil entreprise inexistant. Créez votre profil d'abord.");
//     }

//     return this.prisma.job.create({
//       data: {
//         title: createJobDto.title,
//         description: createJobDto.description,
//         location: createJobDto.location,
//         salaryMin: createJobDto.salaryMin,
//         salaryMax: createJobDto.salaryMax,
//         experience: createJobDto.experience,
//         type: createJobDto.type, // Assure-toi que c'est 'type' dans le DTO
//         companyId: user.companyProfile.id,
//       },
//     });
//   }

//   /**
//    * 🔍 RECHERCHER DES OFFRES
//    */
//   async findAll(filters: FilterJobDto) {
//     const { search, location, type, experience, companyId, page = 1, limit = 10 } = filters;

//     const where: Prisma.JobWhereInput = {};

//     if (search) {
//       where.OR = [
//         { title: { contains: search, mode: 'insensitive' } },
//         { description: { contains: search, mode: 'insensitive' } },
//       ];
//     }

//     if (location) {
//       where.location = { contains: location, mode: 'insensitive' };
//     }

//     if (type) where.type = type;
    
//     // Filtre sur string
//     if (experience) {
//       where.experience = { contains: experience, mode: 'insensitive' };
//     }

//     if (companyId) where.companyId = companyId;

//     const skip = (Number(page) - 1) * Number(limit);

//     const [jobs, total] = await Promise.all([
//       this.prisma.job.findMany({
//         where,
//         skip,
//         take: Number(limit),
//         orderBy: { createdAt: 'desc' },
//         include: {
//           company: {
//             select: { id: true, companyName: true, logoUrl: true }
//           }
//         }
//       }),
//       this.prisma.job.count({ where })
//     ]);

//     return {
//       data: jobs,
//       meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) }
//     };
//   }

//   /**
//    * 📄 DÉTAIL D'UNE OFFRE
//    */
//   async findOne(id: string) {
//     const job = await this.prisma.job.findUnique({
//       where: { id },
//       include: {
//         company: { select: { id: true, companyName: true, logoUrl: true, description: true } },
//         _count: { select: { applications: true } }
//       }
//     });

//     if (!job) throw new NotFoundException(`Offre #${id} introuvable`);
//     return job;
//   }
// }
