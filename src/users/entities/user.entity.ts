import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserRole, Language } from 'src/util/enums'
import { Exclude } from 'class-transformer'
import { Joke } from 'src/jokes/entities/joke.entity'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  fullName: string

  @Column({ unique: true })
  email: string

  @Column()
  @Exclude()
  password: string

  @Column()
  roles: UserRole

  @Column({
    type: 'enum',
    enum: Language,
    default: Language.EN,
  })
  language: Language

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @OneToMany(() => Joke, joke => joke.user)
  jokes: Joke[]
}
