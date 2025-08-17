import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  Req,
  Body,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JokesService } from './jokes.service'
import { CreateJokeDto } from './dto/create-joke.dto'

import { UpdateJokeDto } from './dto/update-joke.dto'
import { GetJokesDto } from './dto/get-jokes.dto'
import { SearchJokesDto } from './dto/search-jokes.dto'
// import { ReportJokeDto } from './dto/report-joke.dto'
// import { RateJokeDto } from './dto/rate-joke.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Public } from 'src/decorators/public.decorator'
import type { RequestWithUser } from 'src/auth/types/request-with-user'

@ApiTags('jokes')
@Controller('jokes')
export class JokesController {
  constructor(private readonly jokesService: JokesService) {}

  // @ApiOperation({ summary: 'Cache jokes from external API to DB' })
  // @ApiBearerAuth()
  // @Post('cache-external')
  // cacheExternalJokes(
  //   @Body('language') language: string = 'en',
  //   @Body('count') count: number = 10,
  // ) {
  //   return this.jokesService.cacheExternalJokes(language, count)
  // }

  @ApiOperation({ summary: 'Create a new joke' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/create')
  create(@Body() createDto: CreateJokeDto, @Req() req: RequestWithUser) {
    return this.jokesService.create(createDto, req.user.id)
  }

  @ApiOperation({ summary: 'Get all jokes with pagination and filtering' })
  @Public()
  @Get()
  findAll(@Query() query: GetJokesDto) {
    return this.jokesService.findAll(query)
  }

  @ApiOperation({ summary: 'Search jokes by content or user' })
  @Public()
  @Get('search')
  searchJokes(@Query() searchDto: SearchJokesDto) {
    return this.jokesService.searchJokes(searchDto)
  }

  @ApiOperation({ summary: 'Get current user jokes' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-jokes')
  findUserJokes(@Req() req: RequestWithUser) {
    return this.jokesService.findUserJokes(req.user.id)
  }

  @ApiOperation({ summary: 'Manually fetch jokes from external API' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('fetch')
  fetchJokes() {
    return this.jokesService.fetchJokesManually()
  }

  @ApiOperation({ summary: 'Get joke by ID' })
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jokesService.findOne(id)
  }

  //   @ApiOperation({ summary: 'Report a joke' })
  //   @ApiBearerAuth()
  //   @UseGuards(JwtAuthGuard)
  //   @Post(':id/report')
  //   reportJoke(
  //     @Param('id') id: string,
  //     reportJokeDto: ReportJokeDto,
  //     @Req req,
  //   ) {
  //     return this.jokesService.reportJoke(id, reportJokeDto, req.user.id)
  //   }

  //   @ApiOperation({ summary: 'Rate a joke' })
  //   @ApiBearerAuth()
  //   @UseGuards(JwtAuthGuard)
  //   @Post(':id/rate')
  //   rateJoke(@Param('id') id: string, rateJokeDto: RateJokeDto, @Req req: RequestWithUser) {
  //     return this.jokesService.rateJoke(id, rateJokeDto, req.user.id)
  //   }

  //   @ApiOperation({ summary: "Get user's rating for a joke" })
  //   @ApiBearerAuth()
  //   @UseGuards(JwtAuthGuard)
  //   @Get(':id/rating')
  //   getUserRating(@Param('id') id: string, @Req req: RequestWithUser) {
  //     return this.jokesService.getUserRating(id, req.user.id)
  //   }

  @ApiOperation({ summary: 'Update joke' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('my-jokes/:id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateJokeDto,
    @Req() req: RequestWithUser,
  ) {
    return this.jokesService.update(id, updateDto, req.user.id)
  }

  @ApiOperation({ summary: 'Delete joke' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('my-jokes/:id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.jokesService.remove(id, req.user.id)
  }
}
