import { PartialType, ApiProperty } from '@nestjs/swagger'
import { CreateJokeDto } from './create-joke.dto'

export class UpdateJokeDto extends PartialType(CreateJokeDto) {
  @ApiProperty({
    example: 'Why did the chicken cross the road? To get to the other side!',
    required: false,
    maxLength: 500,
  })
  content?: string

  @ApiProperty({
    example: 'en',
    enum: ['en', 'es', 'fr'],
    required: false,
    description: 'Language of the joke',
  })
  language?: string
}
