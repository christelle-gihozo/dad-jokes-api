import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

// Define the expected JWT payload type
export interface JwtPayload {
  id: number
  email: string
  role: string[] | string
  fullName?: string
  timeZone?: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set')
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    })
  }

  async validate(payload: JwtPayload) {
    return {
      id: payload.id,
      email: payload.email,
      roles: payload.role,
      fullName: payload.fullName,
      timeZone: payload.timeZone,
    }
  }
}
