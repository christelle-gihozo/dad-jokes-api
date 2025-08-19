import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { Repository } from 'typeorm'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Joke } from './entities/joke.entity'
import { Language, JokeSource, JokeStatus } from '../util/enums'
// import { JokeReport, ReportReason } from './entities/joke-report.entity'
// import { JokeRating } from './entities/joke-rating.entity'
import { ExternalApiService } from '../external-jokes-api/external-api.service'
import { ContentModerationService } from './content-moderation.service'
import { CreateJokeDto } from './dto/create-joke.dto'
import { UpdateJokeDto } from './dto/update-joke.dto'
import { GetJokesDto } from './dto/get-jokes.dto'
import { SearchJokesDto } from './dto/search-jokes.dto'
import { InjectRepository } from '@nestjs/typeorm'
// import { ReportJokeDto } from './dto/report-joke.dto'
// import { RateJokeDto } from './dto/rate-joke.dto'

@Injectable()
export class JokesService {
  constructor(
    @InjectRepository(Joke)
    private readonly jokeRepository: Repository<Joke>,
    // private readonly reportRepository: Repository<JokeReport>,
    // private readonly ratingRepository: Repository<JokeRating>,
    private readonly externalApiService: ExternalApiService,
    private readonly contentModerationService: ContentModerationService,
  ) {}

  /**
   * Fetches jokes from the external API and stores them in the database for fallback use.
   * Only stores jokes that do not already exist (by apiId and source).
   */
  // async cacheExternalJokes(
  //   language: string,
  //   count: number = 20,
  // ): Promise<{ added: number; skipped: number }> {
  //   const jokes = await this.externalApiService.fetchJokes(language, count)
  //   let added = 0
  //   let skipped = 0
  //   for (const jokeData of jokes) {
  //     const existingJoke = await this.jokeRepository.findOne({
  //       where: {
  //         apiId: jokeData.id,
  //         source: JokeSource.API,
  //       },
  //     })
  //     if (existingJoke) {
  //       skipped++
  //       continue
  //     }
  //     // Moderate API jokes too
  //     const moderationResult =
  //       await this.contentModerationService.moderateContent(jokeData.content)
  //     const joke = this.jokeRepository.create({
  //       content: jokeData.content,
  //       language: language as Language,
  //       source: JokeSource.API,
  //       apiId: jokeData.id,
  //       status: moderationResult.isAppropriate
  //         ? JokeStatus.APPROVED
  //         : JokeStatus.REJECTED,
  //       moderationNotes: moderationResult.isAppropriate
  //         ? undefined
  //         : `Auto-rejected: ${moderationResult.flaggedWords.join(', ')}`,
  //     })
  //     await this.jokeRepository.save(joke)
  //     added++
  //   }
  //   return { added, skipped }
  // }

  async create(createJokeDto: CreateJokeDto, userId?: string): Promise<Joke> {
    // Content moderation check
    const moderationResult =
      await this.contentModerationService.moderateContent(createJokeDto.content)

    if (!moderationResult.isAppropriate) {
      throw new BadRequestException({
        message: 'Content contains inappropriate material',
        flaggedWords: moderationResult.flaggedWords,
        severity: moderationResult.severity,
        suggestions: moderationResult.suggestions,
      })
    }

    // Spam check
    if (userId) {
      const isSpam = await this.contentModerationService.checkSpam(
        createJokeDto.content,
        userId,
      )
      if (isSpam) {
        throw new BadRequestException('Content appears to be spam')
      }
    }

    const joke = this.jokeRepository.create({
      ...createJokeDto,
      language: createJokeDto.language as Language,
      userId,
      status: JokeStatus.APPROVED, // Auto-approve if passes moderation
    })

    return this.jokeRepository.save(joke)
  }

  async findAll(query: GetJokesDto) {
    const { language, page = 1, limit = 10 } = query
    const skip = (page - 1) * limit

    const queryBuilder = this.jokeRepository
      .createQueryBuilder('joke')
      .leftJoinAndSelect('joke.user', 'user')
      .where('joke.status = :status', { status: JokeStatus.APPROVED })
      .orderBy('joke.createdAt', 'DESC')
      .skip(skip)
      .take(limit)

    if (language) {
      queryBuilder.andWhere('joke.language = :language', { language })
    }

    const [jokes, total] = await queryBuilder.getManyAndCount()

    return {
      jokes,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    }
  }

  async searchJokes(searchDto: SearchJokesDto) {
    const { query, type, language } = searchDto

    const queryBuilder = this.jokeRepository
      .createQueryBuilder('joke')
      .leftJoinAndSelect('joke.user', 'user')
      .where('joke.status = :status', { status: JokeStatus.APPROVED })

    if (language) {
      queryBuilder.andWhere('joke.language = :language', { language })
    }

    if (type === 'content') {
      queryBuilder.andWhere('LOWER(joke.content) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
    } else if (type === 'user') {
      queryBuilder.andWhere('LOWER(user.username) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
    }

    queryBuilder.orderBy('joke.createdAt', 'DESC')

    const jokes = await queryBuilder.getMany()

    return {
      jokes,
      total: jokes.length,
      query,
      type,
    }
  }

  async findOne(id: string): Promise<Joke> {
    const joke = await this.jokeRepository.findOne({
      where: { id, status: JokeStatus.APPROVED },
      relations: ['user'],
    })

    if (!joke) {
      throw new NotFoundException('Joke not found')
    }

    return joke
  }

  async findUserJokes(userId: string) {
    const jokes = await this.jokeRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    })

    return { jokes }
  }

  async update(
    id: string,
    updateJokeDto: UpdateJokeDto,
    userId: string,
  ): Promise<Joke> {
    const joke = await this.jokeRepository.findOne({ where: { id } })

    if (!joke) {
      throw new NotFoundException('Joke not found')
    }

    if (joke.userId !== userId) {
      throw new ForbiddenException('You can only update your own jokes')
    }

    // Content moderation check for updates
    if (updateJokeDto.content) {
      const moderationResult =
        await this.contentModerationService.moderateContent(
          updateJokeDto.content,
        )

      if (!moderationResult.isAppropriate) {
        throw new BadRequestException({
          message: 'Content contains inappropriate material',
          flaggedWords: moderationResult.flaggedWords,
          severity: moderationResult.severity,
          suggestions: moderationResult.suggestions,
        })
      }
    }

    await this.jokeRepository.update(id, {
      ...updateJokeDto,
      language: updateJokeDto.language as Language,
      status: JokeStatus.APPROVED, // Re-approve after moderation check
    })

    return this.findOne(id)
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const joke = await this.jokeRepository.findOne({ where: { id } })

    if (!joke) {
      throw new NotFoundException('Joke not found')
    }

    if (joke.userId !== userId) {
      throw new ForbiddenException('You can only delete your own jokes')
    }

    await this.jokeRepository.softDelete(id)
    return { message: 'Joke deleted successfully' }
  }

  //   async reportJoke(
  //     jokeId: string,
  //     reportJokeDto: ReportJokeDto,
  //     reporterId: string,
  //   ) {
  //     const joke = await this.jokeRepository.findOne({ where: { id: jokeId } })
  //     if (!joke) {
  //       throw new NotFoundException('Joke not found')
  //     }

  //     // Check if user already reported this joke
  //     const existingReport = await this.reportRepository.findOne({
  //       where: { jokeId, reporterId },
  //     })

  //     if (existingReport) {
  //       throw new BadRequestException('You have already reported this joke')
  //     }

  //     const report = this.reportRepository.create({
  //       jokeId,
  //       reporterId,
  //       reason: reportJokeDto.reason as ReportReason,
  //       description: reportJokeDto.description,
  //     })

  //     await this.reportRepository.save(report)

  //     // Update joke report count
  //     await this.jokeRepository.update(jokeId, {
  //       reportCount: joke.reportCount + 1,
  //     })

  //     // Auto-flag joke if it has too many reports
  //     if (joke.reportCount + 1 >= 5) {
  //       await this.jokeRepository.update(jokeId, {
  //         status: JokeStatus.FLAGGED,
  //       })
  //     }

  //     return { message: 'Joke reported successfully' }
  //   }

  //   async rateJoke(jokeId: string, rateJokeDto: RateJokeDto, userId: string) {
  //     const joke = await this.jokeRepository.findOne({ where: { id: jokeId } })
  //     if (!joke) {
  //       throw new NotFoundException('Joke not found')
  //     }

  //     // Check if user already rated this joke
  //     const existingRating = await this.ratingRepository.findOne({
  //       where: { jokeId, userId },
  //     })

  //     if (existingRating) {
  //       // Update existing rating
  //       existingRating.rating = rateJokeDto.rating
  //       await this.ratingRepository.save(existingRating)
  //     } else {
  //       // Create new rating
  //       const rating = this.ratingRepository.create({
  //         jokeId,
  //         userId,
  //         rating: rateJokeDto.rating,
  //       })
  //       await this.ratingRepository.save(rating)
  //     }

  //     // Recalculate average rating
  //     const ratings = await this.ratingRepository.find({ where: { jokeId } })
  //     const totalRatings = ratings.length
  //     const averageRating =
  //       ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings

  //     await this.jokeRepository.update(jokeId, {
  //       averageRating: Number.parseFloat(averageRating.toFixed(2)),
  //       totalRatings,
  //     })

  //     return { message: 'Joke rated successfully', averageRating, totalRatings }
  //   }

  //   async getUserRating(jokeId: string, userId: string) {
  //     const rating = await this.ratingRepository.findOne({
  //       where: { jokeId, userId },
  //     })
  //     return rating ? { rating: rating.rating } : null
  //   }

  // Cron job to fetch new jokes daily
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async fetchDailyJokes() {
    console.log('🤖 Fetching daily jokes from external API...')

    const languages = ['en', 'es', 'fr']

    for (const language of languages) {
      try {
        const jokes = await this.externalApiService.fetchJokes(language, 5)

        for (const jokeData of jokes) {
          // Check if joke already exists
          const existingJoke = await this.jokeRepository.findOne({
            where: {
              apiId: jokeData.id,
              source: JokeSource.API,
            },
          })

          if (!existingJoke) {
            // Moderate API jokes too
            const moderationResult =
              await this.contentModerationService.moderateContent(
                jokeData.content,
              )

            const joke = this.jokeRepository.create({
              content: jokeData.content,
              language: language as Language,
              source: JokeSource.API,
              apiId: jokeData.id,
              status: moderationResult.isAppropriate
                ? JokeStatus.APPROVED
                : JokeStatus.REJECTED,
              moderationNotes: moderationResult.isAppropriate
                ? undefined
                : `Auto-rejected: ${moderationResult.flaggedWords.join(', ')}`,
            })
            await this.jokeRepository.save(joke)
          }
        }

        console.log(`✅ Added new ${language} jokes from API`)
      } catch (error) {
        console.error(`❌ Failed to fetch ${language} jokes:`, error.message)
      }
    }
  }

  // Manual trigger for fetching jokes (for testing)
  async fetchJokesManually() {
    const response = await this.fetchDailyJokes()
    return response
  }
}
