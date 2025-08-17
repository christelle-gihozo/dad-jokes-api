import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ResetPasswordDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  @IsString()
  token: string

  @ApiProperty({
    example: 'flow@123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string
}
