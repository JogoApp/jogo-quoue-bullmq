import {
  Controller,
  Post,
  Request,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthStrategy } from './auth.strategy';

@Controller('auth')
export class AuthController {
  constructor(private authStrategy: JwtAuthStrategy) {}

  @Post('/login')
  async loginForm(@Request() req: any, @Res() res: Response) {
    const token = await this.authStrategy.login(
      req.body.username,
      req.body.password,
    );
    if (!token) {
      throw new BadRequestException('Bad Request');
    }

    res.cookie('session', token);

    return res.send({
      sessionToken: token,
    });
  }
}
