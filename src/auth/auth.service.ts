import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthDto } from './dto'
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
  constructor(
    readonly prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: AuthDto) {
    try {
      // generate the password hash
      const hash = await argon.hash(dto.password)

      // save the new user in the db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      })

      return this.signToken(user.id, user.email)
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken')
        }
      }
      throw error
    }

    // return the saved user
  }

  async login(dto: AuthDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    })
    // if user does nto exists throw exception

    if (!user) {
      throw new ForbiddenException('credentials incorrect')
    }

    // compare password
    const passwordMatches = await argon.verify(user.hash, dto.password)

    // if passowrd incorrect throw exception
    if (!passwordMatches) throw new ForbiddenException('Credentails incorrect')

    return this.signToken(user.id, user.email)
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({})

    if (!users) {
      throw new ForbiddenException('Users not found...')
    }

    return users
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = { sub: userId, email }
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    })

    return { access_token: `Bearer ${token}` }
  }
}
