interface Finding {
  is_input: boolean
  is_output: boolean
  is_database: boolean
  is_validation: boolean
}

interface DatabaseFinding {
  table_name: string
  column_name: string
}

export function estimateEffort(codeFindings: Finding[], dbFindings: DatabaseFinding[]): number {
  let totalHours = 0

  // Base hours per type of change
  const HOURS_PER_INPUT = 0.5 // 30 minutes per input field
  const HOURS_PER_OUTPUT = 0.25 // 15 minutes per output field
  const HOURS_PER_VALIDATION = 1.0 // 1 hour per validation logic
  const HOURS_PER_DB_COLUMN = 0.5 // 30 minutes per database column
  const TESTING_MULTIPLIER = 1.3 // Add 30% for testing

  // Count different types of findings
  const inputCount = codeFindings.filter((f) => f.is_input).length
  const outputCount = codeFindings.filter((f) => f.is_output).length
  const validationCount = codeFindings.filter((f) => f.is_validation).length

  // Calculate effort
  totalHours += inputCount * HOURS_PER_INPUT
  totalHours += outputCount * HOURS_PER_OUTPUT
  totalHours += validationCount * HOURS_PER_VALIDATION
  totalHours += dbFindings.length * HOURS_PER_DB_COLUMN

  // Add testing time
  totalHours *= TESTING_MULTIPLIER

  // Round to 2 decimal places
  return Math.round(totalHours * 100) / 100
}
