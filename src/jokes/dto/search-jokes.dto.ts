import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsIn, MaxLength } from 'class-validator'

export class SearchJokesDto {
  @ApiProperty({
    example: 'funny',
    description: 'Search query',
  })
  @IsString()
  @MaxLength(100)
  query: string

  @ApiProperty({
    example: 'content',
    enum: ['content', 'user'],
    description: 'Search type - content or user',
  })
  @IsString()
  @IsIn(['content', 'user'])
  type: 'content' | 'user'

  @ApiProperty({
    example: 'en',
    enum: ['en', 'es', 'fr'],
    description: 'Filter by language',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'es', 'fr'])
  language?: string
}
