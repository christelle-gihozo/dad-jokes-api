import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsIn, MaxLength, MinLength } from 'class-validator'

export class CreateJokeDto {
  @ApiProperty({
    example:
      'Why did the scarecrow win an award? Because he was outstanding in his field!',
    required: true,
    maxLength: 500,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  content: string

  @ApiProperty({
    example: 'en',
    enum: ['en', 'es', 'fr'],
    description: 'Language of the joke',
    required: true,
  })
  @IsString()
  @IsIn(['en', 'es', 'fr'])
  language: string
}
