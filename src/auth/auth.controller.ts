import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);
    response.cookie(this.cookieName(), result.accessToken, this.cookieOptions());
    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(req.user.id);
    response.clearCookie(this.cookieName(), this.cookieBaseOptions());
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: any) {
    return req.user;
  }

  private cookieName(): string {
    return this.configService.get<string>('NODE_ENV') === 'production'
      ? '__Host-smp_session'
      : 'smp_session';
  }

  private cookieOptions() {
    return {
      ...this.cookieBaseOptions(),
      maxAge: 60 * 60 * 1000,
    };
  }

  private cookieBaseOptions() {
    const production = this.configService.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: production,
      // Frontend y API están en subdominios separados de Render. En producción
      // la cookie debe admitir esa petición cruzada; CORS estricto y el header
      // anti-CSRF obligatorio evitan que otros orígenes puedan reutilizarla.
      sameSite: (production ? 'none' : 'lax') as 'none' | 'lax',
      partitioned: production,
      path: '/',
    };
  }
}
