import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm'
import { User } from '../../users/entities/user.entity'
// Might extend the application and include them
// import { JokeReport } from './joke-report.entity'
// import { JokeRating } from './joke-rating.entity'
import { JokeSource, JokeStatus, Language } from 'src/util/enums'

@Entity('jokes')
export class Joke {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text')
  content: string

  @Column({
    type: 'enum',
    enum: Language,
    default: Language.EN,
  })
  language: Language

  @Column({
    type: 'enum',
    enum: JokeSource,
    default: JokeSource.USER,
  })
  source: JokeSource

  @Column({
    type: 'enum',
    enum: JokeStatus,
    default: JokeStatus.PENDING,
  })
  status: JokeStatus

  @Column({ nullable: true })
  apiId: string

  // @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  // averageRating: number

  // @Column({ type: 'int', default: 0 })
  // totalRatings: number

  // @Column({ type: 'int', default: 0 })
  // reportCount: number

  @Column({ type: 'text', nullable: true })
  moderationNotes: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ nullable: true })
  userId: string

  @ManyToOne(() => User, user => user.jokes, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User

  @DeleteDateColumn()
  deletedAt: Date

  // @OneToMany(() => JokeReport, report => report.joke)
  // reports: JokeReport[]

  // @OneToMany(() => JokeRating, rating => rating.joke)
  // ratings: JokeRating[]
}
