import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

export class GetJokesDto {
  @ApiPropertyOptional({
    example: 'en',
    enum: ['en', 'es', 'fr'],
    description: 'Filter jokes by language',
  })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'es', 'fr'])
  language?: string

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    minimum: 1,
    description: 'Page number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 50,
    description: 'Number of jokes per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number
}
