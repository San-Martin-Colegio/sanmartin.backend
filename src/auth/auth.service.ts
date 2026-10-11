import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      return null;
    }
    const isValid = await bcrypt.compare(pass, user.password);
    if (!isValid) {
      return null;
    }
    const configuredRounds = Number(process.env.BCRYPT_ROUNDS || 12);
    if (bcrypt.getRounds(user.password) < configuredRounds) {
      await this.usersService.updatePasswordHash(
        user.id,
        await bcrypt.hash(pass, configuredRounds),
      );
    }
    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      ver: user.tokenVersion,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async logout(userId: number): Promise<void> {
    await this.usersService.revokeSessions(userId);
  }
}
