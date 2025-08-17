import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JokesService } from './jokes.service'
import { JokesController } from './jokes.controller'
import { Joke } from './entities/joke.entity'
// import { JokeReport } from './entities/joke-report.entity'
// import { JokeRating } from './entities/joke-rating.entity'
import { ContentModerationService } from './content-moderation.service'
import { ExternalApiModule } from '../external-jokes-api/external-api.module'

@Module({
  imports: [TypeOrmModule.forFeature([Joke]), ExternalApiModule],
  controllers: [JokesController],
  providers: [JokesService, ContentModerationService],
  exports: [JokesService],
})
export class JokesModule {}
