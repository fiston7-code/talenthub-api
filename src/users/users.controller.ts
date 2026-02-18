import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users - Liste tous les utilisateurs (Route que tu appelles dans Postman)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users;
  }

  // GET /users/me - Un user voit SON profil uniquement
  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Ne JAMAIS retourner le password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // PATCH /users/me - Un user modifie SON profil uniquement
  @Patch('me')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(
      req.user.id,
      updateUserDto,
    );

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  // DELETE /users/me - Un user supprime SON compte uniquement
  @Delete('me')
  async deleteAccount(@Request() req) {
    await this.usersService.delete(req.user.id);
    return { message: 'Compte supprimé avec succès' };
  }
}
