import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'christellegihozo@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string
}
