import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtAuthStrategy } from './auth.strategy';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: JwtAuthStrategy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      console.log('No token found');
      throw new BadRequestException();
    }

    const payload = await this.authService.validate(token);
    if (!payload) {
      console.log('No token valid');
      throw new BadRequestException();
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    request.user = payload;

    return true;
  }

  private getCookie(cname: string, cookie: string) {
    const name = cname + '=';
    const decodedCookie = decodeURIComponent(cookie);
    const ca = decodedCookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    const cookieHeader = request.headers?.cookie;

    if (!authHeader) {
      if (cookieHeader) {
        return this.getCookie('session', cookieHeader);
      }

      return null;
    }
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }

  async use(request: Request, res: Response, next: NextFunction) {
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      console.log('No token found');
      return res.redirect('/login');
    }

    const payload = await this.authService.validate(token);
    if (!payload) {
      console.log('No token valid');
      return res.redirect('/login');
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    request.user ??= payload;
    next();
  }
}
