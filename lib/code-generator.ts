export interface CodeFix {
  original: string
  fixed: string
  explanation: string
  language: string
}

export class CodeGenerator {
  async generateFix(
    code: string,
    language: string,
    fieldName: string,
    type: "field" | "validation" | "mask" | "database",
  ): Promise<CodeFix> {
    try {
      console.log("[v0] Using pattern-based code generation (AI disabled to avoid rate limits)")
      return this.fallbackGeneration(code, language, type, fieldName)
    } catch (error) {
      console.error("[v0] Code generation error:", error)
      return this.fallbackGeneration(code, language, type, fieldName)
    }
  }

  private fallbackGeneration(
    code: string,
    language: string,
    type: "field" | "validation" | "mask" | "database",
    fieldName: string,
  ): CodeFix {
    let fixed = code
    let explanation = ""

    if (type === "database") {
      fixed = code.replace(/VARCHAR$$(\d+)$$/gi, "VARCHAR(14)").replace(/CHAR$$(\d+)$$/gi, "VARCHAR(14)")
      explanation = "Alterado tipo de coluna para VARCHAR(14) para suportar caracteres alfanuméricos"
    } else if (type === "validation") {
      fixed = code.replace(/\d{14}/g, "[A-Z0-9]{14}").replace(/\\d/g, "[A-Z0-9]")
      explanation = "Atualizada regex para aceitar letras (A-Z) além de números (0-9)"
    } else if (type === "mask") {
      fixed = code.replace(/[0-9]/g, "[A-Z0-9]")
      explanation = "Atualizada máscara para aceitar caracteres alfanuméricos"
    } else {
      fixed = code.replace(/type="number"/g, 'type="text"').replace(/pattern="\\d+"/g, 'pattern="[A-Z0-9]+"')
      explanation = "Alterado campo para aceitar entrada alfanumérica"
    }

    return {
      original: code,
      fixed,
      explanation,
      language,
    }
  }

  generateDatabaseMigration(
    findings: Array<{ table: string; column: string; type: string; database: string }>,
  ): string {
    const migrations: string[] = []

    findings.forEach((finding) => {
      if (finding.database === "SQL Server") {
        migrations.push(`ALTER TABLE ${finding.table} ALTER COLUMN ${finding.column} VARCHAR(14);`)
      } else if (finding.database === "MySQL" || finding.database === "PostgreSQL") {
        migrations.push(`ALTER TABLE ${finding.table} MODIFY COLUMN ${finding.column} VARCHAR(14);`)
      } else if (finding.database === "Oracle") {
        migrations.push(`ALTER TABLE ${finding.table} MODIFY ${finding.column} VARCHAR2(14);`)
      }
    })

    return migrations.join("\n")
  }

  generateValidationFunction(language: string): string {
    const templates: Record<string, string> = {
      JavaScript: `function validateCNPJAlphanumeric(cnpj) {
  const cleaned = cnpj.replace(/[.\\-\\/]/g, '').toUpperCase();
  
  if (cleaned.length !== 14) return false;
  if (!/^[A-Z0-9]{14}$/.test(cleaned)) return false;
  
  // Implement check digit validation here
  return true;
}`,
      TypeScript: `function validateCNPJAlphanumeric(cnpj: string): boolean {
  const cleaned = cnpj.replace(/[.\\-\\/]/g, '').toUpperCase();
  
  if (cleaned.length !== 14) return false;
  if (!/^[A-Z0-9]{14}$/.test(cleaned)) return false;
  
  // Implement check digit validation here
  return true;
}`,
      Java: `public boolean validateCNPJAlphanumeric(String cnpj) {
    String cleaned = cnpj.replaceAll("[.\\\\-/]", "").toUpperCase();
    
    if (cleaned.length() != 14) return false;
    if (!cleaned.matches("^[A-Z0-9]{14}$")) return false;
    
    // Implement check digit validation here
    return true;
}`,
      "C#": `public bool ValidateCNPJAlphanumeric(string cnpj) {
    string cleaned = Regex.Replace(cnpj, @"[.\-/]", "").ToUpper();
    
    if (cleaned.Length != 14) return false;
    if (!Regex.IsMatch(cleaned, @"^[A-Z0-9]{14}$")) return false;
    
    // Implement check digit validation here
    return true;
}`,
      PHP: `function validateCNPJAlphanumeric($cnpj) {
    $cleaned = strtoupper(preg_replace('/[.\\-\\/]/', '', $cnpj));
    
    if (strlen($cleaned) !== 14) return false;
    if (!preg_match('/^[A-Z0-9]{14}$/', $cleaned)) return false;
    
    // Implement check digit validation here
    return true;
}`,
      Python: `def validate_cnpj_alphanumeric(cnpj: str) -> bool:
    import re
    cleaned = re.sub(r'[.\\-/]', '', cnpj).upper()
    
    if len(cleaned) != 14:
        return False
    if not re.match(r'^[A-Z0-9]{14}$', cleaned):
        return False
    
    # Implement check digit validation here
    return True`,
    }

    return templates[language] || templates["JavaScript"]
  }
}
