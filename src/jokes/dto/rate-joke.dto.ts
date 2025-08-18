import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min, Max } from 'class-validator'

export class RateJokeDto {
  @ApiProperty({
    example: 4,
    minimum: 1,
    maximum: 5,
    description: 'Rating from 1 to 5 stars',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number
}
