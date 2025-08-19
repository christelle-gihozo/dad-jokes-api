import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator'
import { Language } from 'src/util/enums'

export class CreateUserDto {
  @ApiProperty({
    example: 'Christelle Gihozo',
    required: true,
  })
  @IsNotEmpty()
  fullName: string

  @ApiProperty({
    example: 'christelle@gmail.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    example: 'flow@123',
    required: true,
  })
  @MinLength(8)
  @IsNotEmpty()
  password: string

  @ApiProperty({
    example: 'en',
    enum: ['en', 'es', 'fr'],
    required: true,
  })
  @IsEnum(Language)
  language: Language
}
