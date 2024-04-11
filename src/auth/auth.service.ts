import { Injectable } from '@nestjs/common'

@Injectable()
export class AuthService {
  register() {
    return { message: 'registered' }
  }

  login() {
    return { message: 'logged in' }
  }
}
