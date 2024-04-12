import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthDto } from './dto'
import { Response } from 'express'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto)
  }

  @Get('users')
  findAll() {
    return this.authService.getAllUsers()
  }
}
