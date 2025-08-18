import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsIn, IsOptional, MaxLength } from 'class-validator'

export class ReportJokeDto {
  @ApiProperty({
    example: 'inappropriate',
    enum: [
      'inappropriate',
      'offensive',
      'spam',
      'harassment',
      'violence',
      'hate_speech',
      'other',
    ],
    description: 'Reason for reporting the joke',
  })
  @IsString()
  @IsIn([
    'inappropriate',
    'offensive',
    'spam',
    'harassment',
    'violence',
    'hate_speech',
    'other',
  ])
  reason: string

  @ApiProperty({
    example:
      'This joke contains inappropriate content that violates community guidelines',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string
}
