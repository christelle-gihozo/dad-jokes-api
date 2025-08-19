import { Injectable } from '@nestjs/common'
import axios from 'axios'

interface ExternalJoke {
  id: string
  content: string
  language: string
}

@Injectable()
export class ExternalApiService {
  private readonly jokeApiUrl = 'https://v2.jokeapi.dev/joke'

  async fetchJokes(language: string, count = 5): Promise<ExternalJoke[]> {
    try {
      // Map our language codes to JokeAPI language codes
      const langMap = {
        en: 'en',
        es: 'es',
        fr: 'fr',
      }

      const apiLang = langMap[language] || 'es  '

      const response = await axios.get(`${this.jokeApiUrl}/Any`, {
        params: {
          lang: 'fr',
          amount: 7,
          type: 'twopart', // Only two-part jokes
        },
      })

      const data = response.data as {
        jokes?: unknown[]
        [key: string]: unknown
      }
      const jokes = data.jokes || [data]

      return jokes
        .filter(
          (joke: { type?: string; joke?: string }) =>
            joke.type === 'single' && joke.joke,
        )
        .map((joke: { id?: string; joke?: string }) => ({
          id: joke.id ? joke.id.toString() : '',
          content: joke.joke ?? '',
          language,
        }))
    } catch (error) {
      // Return fallback jokes if API fails
      return this.getFallbackJokes(language, count)
    }
  }

  private getFallbackJokes(language: string, count: number): ExternalJoke[] {
    const fallbackJokes = {
      en: [
        "Why don't scientists trust atoms? Because they make up everything!",
        'I told my wife she was drawing her eyebrows too high. She looked surprised.',
        'Why did the scarecrow win an award? Because he was outstanding in his field!',
        "I'm reading a book about anti-gravity. It's impossible to put down!",
        "Why don't eggs tell jokes? They'd crack each other up!",
      ],
      es: [
        '¿Qué es un terapeuta? 1024 Gigapeutas',
        '¿¿Qué le dice un .GIF a un .JPEG? Anímate viejo.',
        '¿Qué es el hardware? El que recibe los golpes cuando falla el software.',
        '¿Por qué C consigue todas las chicas y Java no tiene ninguna? Porque C no las trata como objetos.',
        '¿Qué hace una abeja en el gimnasio? ¡Zum-ba!',
      ],
      fr: [
        "Quel est le comble pour un dentiste? C'est d'habiter dans un palais.",
        "Qu'est-ce qu'un chou au milieu de l'océan? Un chou marin.",
        "Qu'est-ce qui est transparent et qui sent la carotte? Un pet de lapin.",
        'Quel est le comble pour une orange? Être toujours pressée.',
        "Qu'est-ce qui est vert et qui nique? Véronique.",
      ],
    }

    const jokes = fallbackJokes[language] || fallbackJokes.en

    return jokes.slice(0, count).map((content, index) => ({
      id: `fallback-${language}-${index}`,
      content,
      language,
    }))
  }
}
