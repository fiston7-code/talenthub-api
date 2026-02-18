import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { FilterJobDto } from './dto/filter-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '../../prisma/generated/client';

@Controller('jobs')
@UseGuards(JwtAuthGuard, RolesGuard) // ✅ Protection globale du controller
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /**
   * ✅ CRÉER UNE OFFRE
   * Seules les COMPANY peuvent créer
   */
  @Post()
  @Roles(Role.COMPANY)
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: { id: string; role: Role },
    @Body() createJobDto: CreateJobDto
  ) {
    return this.jobsService.create(createJobDto, user.id);
  }

  /**
   * 🔍 RECHERCHER DES OFFRES (publique)
   */
  @Public()
  @Get()
  findAll(@Query() filters: FilterJobDto) {
    return this.jobsService.findAll(filters);
  }

  /**
   * 📋 MES OFFRES (entreprise connectée)
   */
  @Get('my-jobs')
  @Roles(Role.COMPANY)
  getMyJobs(@CurrentUser() user: { id: string }) {
    return this.jobsService.findByCompany(user.id);
  }

  /**
   * 📄 DÉTAIL D'UNE OFFRE (publique)
   */
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.findOne(id);
  }

  /**
   * ✏️ MODIFIER UNE OFFRE
   */
  @Patch(':id')
  @Roles(Role.COMPANY)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
    @Body() updateJobDto: UpdateJobDto
  ) {
    return this.jobsService.update(id, user.id, updateJobDto);
  }

  /**
   * 🗑️ SUPPRIMER UNE OFFRE
   */
  @Delete(':id')
  @Roles(Role.COMPANY)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string }
  ) {
    return this.jobsService.remove(id, user.id);
  }
}




// import { 
//   Controller, 
//   Get, 
//   Post, 
//   Body, 
//   Patch, 
//   Param, 
//   Delete,
//   Query,
//   UseGuards,
//   HttpCode,
//   HttpStatus,
//   ParseUUIDPipe
// } from '@nestjs/common';
// import { JobsService } from './jobs.service';
// import { CreateJobDto } from './dto/create-job.dto';
// import { UpdateJobDto } from './dto/update-job.dto';
// import { FilterJobDto } from './dto/filter-job.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';
// import { Public } from '../auth/decorators/public.decorator';
// import { Role } from '../../prisma/generated/client';

// @Controller('jobs')
// @UseGuards(JwtAuthGuard, RolesGuard) // 👈 Protection globale du controller
// export class JobsController {
//   constructor(private readonly jobsService: JobsService) {}

//   /**
//    * ✅ CRÉER UNE OFFRE
//    * Seules les COMPANY peuvent créer
//    */
//   @Post()
//   @Roles(Role.COMPANY) // 👈 Restriction au rôle COMPANY
//   @HttpCode(HttpStatus.CREATED)
//   create(
//     @CurrentUser() user: { id: string; role: Role }, // 👈 Type fort
//     @Body() createJobDto: CreateJobDto
//   ) {
//     return this.jobsService.create(createJobDto, user.id, user.role);
//   }

//   /**
//    * 🔍 RECHERCHER DES OFFRES
//    * Route publique avec filtres et pagination
//    */
//   @Public() // 👈 Accessible sans authentification
//   @Get()
//   findAll(@Query() filters: FilterJobDto) {
//     return this.jobsService.findAll(filters);
//   }

//   /**
//    * 📄 DÉTAIL D'UNE OFFRE
//    * Route publique
//    */
//   @Public()
//   @Get(':id')
//   findOne(@Param('id', ParseUUIDPipe) id: string) { // 👈 Validation UUID
//     return this.jobsService.findOne(id);
//   }

//   /**
//    * 📋 MES OFFRES
//    * Seules les COMPANY peuvent voir leurs offres
//    */
//   @Get('my-jobs')
//   @Roles(Role.COMPANY)
//   getMyJobs(@CurrentUser() user: { id: string; role: Role }) {
//     return this.jobsService.findByCompany(user.id, user.role);
//   }

//   /**
//    * ✏️ MODIFIER UNE OFFRE
//    * Seul le propriétaire peut modifier
//    */
//   @Patch(':id')
//   @Roles(Role.COMPANY)
//   update(
//     @Param('id', ParseUUIDPipe) id: string,
//     @CurrentUser() user: { id: string; role: Role },
//     @Body() updateJobDto: UpdateJobDto
//   ) {
//     return this.jobsService.update(id, user.id, user.role, updateJobDto);
//   }

//   /**
//    * 🗑️ SUPPRIMER UNE OFFRE
//    * Seul le propriétaire peut supprimer
//    */
//   @Delete(':id')
//   @Roles(Role.COMPANY)
//   @HttpCode(HttpStatus.NO_CONTENT)
//   remove(
//     @Param('id', ParseUUIDPipe) id: string,
//     @CurrentUser() user: { id: string; role: Role }
//   ) {
//     return this.jobsService.remove(id, user.id, user.role);
//   }
// }