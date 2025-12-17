export class CNPJValidator {
  private static readonly VALID_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  private static readonly CHAR_VALUES: Record<string, number> = {}

  static {
    for (let i = 0; i < this.VALID_CHARS.length; i++) {
      this.CHAR_VALUES[this.VALID_CHARS[i]] = i
    }
  }

  static validateAlphanumeric(cnpj: string): { valid: boolean; message: string } {
    // Remove formatting
    const cleaned = cnpj.replace(/[.\-/]/g, "").toUpperCase()

    // Check length
    if (cleaned.length !== 14) {
      return { valid: false, message: "CNPJ deve ter 14 caracteres" }
    }

    // Check if all characters are valid
    for (const char of cleaned) {
      if (!this.VALID_CHARS.includes(char)) {
        return { valid: false, message: `Caractere inválido: ${char}` }
      }
    }

    // Extract base and check digits
    const base = cleaned.substring(0, 12)
    const providedDV1 = cleaned[12]
    const providedDV2 = cleaned[13]

    // Calculate check digits
    const calculatedDV1 = this.calculateCheckDigit(base, false)
    const calculatedDV2 = this.calculateCheckDigit(base + calculatedDV1, true)

    if (providedDV1 !== calculatedDV1 || providedDV2 !== calculatedDV2) {
      return {
        valid: false,
        message: `Dígitos verificadores inválidos. Esperado: ${calculatedDV1}${calculatedDV2}, Recebido: ${providedDV1}${providedDV2}`,
      }
    }

    return { valid: true, message: "CNPJ alfanumérico válido" }
  }

  static calculateCheckDigit(base: string, isSecondDigit: boolean): string {
    // For first digit: weights for 12 positions [6,7,8,9,2,3,4,5,6,7,8,9]
    // For second digit: weights for 13 positions [5,6,7,8,9,2,3,4,5,6,7,8,9]
    const weights = isSecondDigit ? [5, 6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9] : [6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9]

    let sum = 0

    for (let i = 0; i < base.length; i++) {
      const charValue = this.CHAR_VALUES[base[i]]
      sum += charValue * weights[i]
    }

    const remainder = sum % 36
    const checkDigit = remainder < 2 ? 0 : 36 - remainder

    return this.VALID_CHARS[checkDigit]
  }

  static generate(): string {
    let base = ""
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * this.VALID_CHARS.length)
      base += this.VALID_CHARS[randomIndex]
    }

    const dv1 = this.calculateCheckDigit(base, false)
    const dv2 = this.calculateCheckDigit(base + dv1, true)

    return base + dv1 + dv2
  }

  static format(cnpj: string): string {
    const cleaned = cnpj.replace(/[.\-/]/g, "").toUpperCase()
    if (cleaned.length !== 14) return cnpj

    return `${cleaned.substring(0, 2)}.${cleaned.substring(2, 5)}.${cleaned.substring(5, 8)}/${cleaned.substring(8, 12)}-${cleaned.substring(12, 14)}`
  }

  static validateNumeric(cnpj: string): { valid: boolean; message: string } {
    const cleaned = cnpj.replace(/[.\-/]/g, "")

    if (cleaned.length !== 14) {
      return { valid: false, message: "CNPJ deve ter 14 dígitos" }
    }

    if (!/^\d+$/.test(cleaned)) {
      return { valid: false, message: "CNPJ numérico deve conter apenas dígitos" }
    }

    // Check for known invalid patterns
    const invalidPatterns = [
      "00000000000000",
      "11111111111111",
      "22222222222222",
      "33333333333333",
      "44444444444444",
      "55555555555555",
      "66666666666666",
      "77777777777777",
      "88888888888888",
      "99999999999999",
    ]

    if (invalidPatterns.includes(cleaned)) {
      return { valid: false, message: "CNPJ inválido" }
    }

    // Calculate check digits for numeric CNPJ
    const base = cleaned.substring(0, 12)
    const dv1 = this.calculateNumericCheckDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
    const dv2 = this.calculateNumericCheckDigit(base + dv1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])

    if (cleaned[12] !== dv1 || cleaned[13] !== dv2) {
      return { valid: false, message: "Dígitos verificadores inválidos" }
    }

    return { valid: true, message: "CNPJ numérico válido" }
  }

  private static calculateNumericCheckDigit(base: string, weights: number[]): string {
    let sum = 0
    for (let i = 0; i < base.length; i++) {
      sum += Number.parseInt(base[i]) * weights[i]
    }
    const remainder = sum % 11
    return remainder < 2 ? "0" : String(11 - remainder)
  }
}
