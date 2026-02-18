import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto'; // Vérifie le nom de ton fichier
import { LoginDto } from './dto/login.dto'; // Vérifie le nom de ton fichier
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Inscription (SignUp)
  async register(registerDto: RegisterDto) {
    const { email, password, role } = registerDto;

    // 1. Vérifier si l'utilisateur existe déjà
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // 2. Hasher le mot de passe (Sécurité !)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Créer l'utilisateur via le UsersService
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      role,
    });

    // 4. Générer le token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      access_token: token,
    };
  }

  // Connexion (SignIn/Login)
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Trouver l'utilisateur
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // 2. Comparer le mot de passe envoyé avec le hash en base
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // 3. Retourner le token et les infos
    const token = this.generateToken(user.id, user.email, user.role);
    return {
  user: {
    id: user.id,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,           
  },
  access_token: token,
};
  }

  // Méthode privée pour centraliser la création du JWT
  private generateToken(userId: string, email: string, role: string): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }

  // Utilisé par la JwtStrategy pour valider l'utilisateur à chaque requête
  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }
}