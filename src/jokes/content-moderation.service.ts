import { Injectable } from '@nestjs/common'

@Injectable()
export class ContentModerationService {
  private inappropriateWords = [
    // English inappropriate words
    'damn',
    'hell',
    'stupid',
    'idiot',
    'hate',
    'kill',
    'die',
    'death',
    'murder',
    'violence',
    'racist',
    'sexist',
    'dumb',
    'ugly',

    // Spanish inappropriate words
    'idiota',
    'estúpido',
    'odio',
    'matar',
    'muerte',
    'violencia',
    'racista',
    'sexista',
    'feo',

    // French inappropriate words
    'idiot',
    'stupide',
    'haine',
    'tuer',
    'mort',
    'violence',
    'raciste',
    'sexiste',
    'laid',
  ]

  private offensivePatterns = [
    // English patterns
    /\b(kill|murder|die)\s+(yourself|myself|himself|herself|themselves)\b/i,
    /\b(hate|despise)\s+(you|me|him|her|them)\b/i,
    /\b(stupid|dumb|idiot)\s+(person|people|man|woman)\b/i,

    // Spanish patterns
    /\b(matar|muerte|morir)\s+(a ti|a mí|a él|a ella|a ellos)\b/i,
    /\b(odio|detesto)\s+(a ti|a mí|a él|a ella|a ellos)\b/i,

    // French patterns
    /\b(tuer|mort|mourir)\s+(toi|moi|lui|elle|eux)\b/i,
    /\b(haine|déteste)\s+(toi|moi|lui|elle|eux)\b/i,
  ]

  async moderateContent(content: string): Promise<{
    isAppropriate: boolean
    flaggedWords: string[]
    severity: 'low' | 'medium' | 'high'
    suggestions?: string[]
  }> {
    const lowerContent = content.toLowerCase()
    const flaggedWords: string[] = []
    let severity: 'low' | 'medium' | 'high' = 'low'

    // Check for inappropriate words
    for (const word of this.inappropriateWords) {
      if (lowerContent.includes(word.toLowerCase())) {
        flaggedWords.push(word)
      }
    }

    const uniqueFlaggedWords = Array.from(new Set(flaggedWords))

    // Check for offensive patterns
    for (const pattern of this.offensivePatterns) {
      if (pattern.test(content)) {
        severity = 'high'
        break
      }
    }

    // Determine severity using switch instead of nested if
    switch (true) {
      case flaggedWords.length >= 3 || severity === 'high':
        severity = 'high'
        break
      case flaggedWords.length === 2:
        severity = 'medium'
        break
      case flaggedWords.length === 1:
        severity = 'low'
        break
      default:
        severity = 'low'
    }

    const isAppropriate = flaggedWords.length === 0 && severity === 'low'

    const suggestions = this.generateSuggestions(flaggedWords)

    return {
      isAppropriate,
      flaggedWords: uniqueFlaggedWords,
      severity,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    }
  }

  private generateSuggestions(flaggedWords: string[]): string[] {
    const suggestions: string[] = []

    for (const word of flaggedWords) {
      switch (word.toLowerCase()) {
        // English, Spanish, French “stupid/idiot”
        case 'stupid':
        case 'idiot':
        case 'idiota':
        case 'estúpido':
        case 'stupide':
          suggestions.push("Try using 'silly' / 'gracioso' / 'drôle' instead")
          break

        // Hate (English, Spanish, French)
        case 'hate':
        case 'odio':
        case 'haine':
          suggestions.push(
            "Try using 'dislike' / 'no me gusta' / 'je n’aime pas' instead",
          )
          break

        // Kill/violence words
        case 'kill':
        case 'murder':
        case 'violence':
        case 'matar':
        case 'muerte':
        case 'violencia':
        case 'tuer':
        case 'mort':
          suggestions.push('Consider using less violent language')
          break

        // Ugly (Spanish/French too)
        case 'ugly':
        case 'feo':
        case 'laid':
          suggestions.push(
            "Try describing in a kinder way, e.g. 'unattractive' / 'no muy lindo' / 'peu attrayant'",
          )
          break
      }
    }

    return Array.from(new Set(suggestions))
  }

  async checkSpam(content: string, userId: string): Promise<boolean> {
    const words = content.toLowerCase().split(/\s+/)
    const wordCount = new Map<string, number>()

    for (const word of words) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    }

    // Check excessive repetition
    for (const count of wordCount.values()) {
      if (count > 5) {
        return true
      }
    }

    // Check excessive capitalization
    const capitalRatio = (content.match(/[A-Z]/g) || []).length / content.length
    if (capitalRatio > 0.7 && content.length > 20) {
      return true
    }

    return false
  }
}
