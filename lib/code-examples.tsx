"use client"

export interface CodeExample {
  title: string
  language: string
  description: string
  category: "validation" | "mask" | "database" | "form" | "api"
  before: string
  after: string
  explanation: string
}

export const codeExamples: CodeExample[] = [
  {
    title: "Validação JavaScript",
    language: "JavaScript",
    description: "Validar CNPJ alfanumérico em JavaScript",
    category: "validation",
    before: `function validateCNPJ(cnpj) {
  // Validação apenas numérica
  const cleaned = cnpj.replace(/[^\\d]/g, '');
  if (cleaned.length !== 14) return false;
  
  // Cálculo dos dígitos verificadores
  // usando módulo 11
  return true;
}`,
    after: `function validateCNPJ(cnpj) {
  // Validação alfanumérica (0-9 e A-Z)
  const cleaned = cnpj.replace(/[.\\-/]/g, '').toUpperCase();
  if (cleaned.length !== 14) return false;
  
  // Verificar se todos os caracteres são válidos
  const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (const char of cleaned) {
    if (!validChars.includes(char)) return false;
  }
  
  // Cálculo dos dígitos verificadores
  // usando módulo 36
  return true;
}`,
    explanation:
      "O novo formato aceita caracteres alfanuméricos (0-9 e A-Z) e usa módulo 36 para calcular os dígitos verificadores.",
  },
  {
    title: "Validação TypeScript",
    language: "TypeScript",
    description: "Validar CNPJ alfanumérico em TypeScript com tipos",
    category: "validation",
    before: `function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/[^\\d]/g, '');
  return cleaned.length === 14;
}`,
    after: `function validateCNPJ(cnpj: string): boolean {
  const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const cleaned = cnpj.replace(/[.\\-/]/g, '').toUpperCase();
  
  if (cleaned.length !== 14) return false;
  
  return [...cleaned].every(char => validChars.includes(char));
}`,
    explanation: "TypeScript permite tipagem forte e validação mais segura do CNPJ alfanumérico.",
  },
  {
    title: "Máscara de Input React",
    language: "React",
    description: "Máscara para input de CNPJ em React",
    category: "mask",
    before: `function CNPJInput({ value, onChange }) {
  const mask = (v) => {
    return v
      .replace(/\\D/g, '')
      .replace(/(\\d{2})(\\d)/, '$1.$2')
      .replace(/(\\d{3})(\\d)/, '$1.$2')
      .replace(/(\\d{3})(\\d)/, '$1/$2')
      .replace(/(\\d{4})(\\d)/, '$1-$2')
      .slice(0, 18);
  };
  
  return <input value={mask(value)} onChange={e => onChange(mask(e.target.value))} />;
}`,
    after: `function CNPJInput({ value, onChange }) {
  const mask = (v) => {
    return v
      .toUpperCase()
      .replace(/[^0-9A-Z]/g, '')
      .replace(/([0-9A-Z]{2})([0-9A-Z])/, '$1.$2')
      .replace(/([0-9A-Z]{3})([0-9A-Z])/, '$1.$2')
      .replace(/([0-9A-Z]{3})([0-9A-Z])/, '$1/$2')
      .replace(/([0-9A-Z]{4})([0-9A-Z])/, '$1-$2')
      .slice(0, 18);
  };
  
  return <input value={mask(value)} onChange={e => onChange(mask(e.target.value))} />;
}`,
    explanation: "A máscara agora aceita letras maiúsculas além de números, mantendo o mesmo formato visual.",
  },
  {
    title: "SQL Server - Alteração de Coluna",
    language: "SQL Server",
    description: "Alterar coluna CNPJ de numérico para alfanumérico",
    category: "database",
    before: `-- Coluna apenas numérica
ALTER TABLE clientes
ALTER COLUMN cnpj VARCHAR(14);

-- Constraint apenas números
ALTER TABLE clientes
ADD CONSTRAINT chk_cnpj_numerico
CHECK (cnpj NOT LIKE '%[^0-9]%');`,
    after: `-- Coluna alfanumérica (20 caracteres formatado)
ALTER TABLE clientes
ALTER COLUMN cnpj VARCHAR(20);

-- Constraint alfanumérica (0-9 e A-Z)
ALTER TABLE clientes
DROP CONSTRAINT chk_cnpj_numerico;

ALTER TABLE clientes
ADD CONSTRAINT chk_cnpj_alfanumerico
CHECK (cnpj NOT LIKE '%[^0-9A-Z./-]%');`,
    explanation:
      "A coluna deve ser expandida para 20 caracteres (formato com pontuação) e a constraint deve aceitar letras.",
  },
  {
    title: "Oracle - Alteração de Coluna",
    language: "Oracle",
    description: "Alterar coluna CNPJ de numérico para alfanumérico no Oracle",
    category: "database",
    before: `-- Coluna apenas numérica
ALTER TABLE clientes
MODIFY cnpj VARCHAR2(14);

-- Constraint apenas números
ALTER TABLE clientes
ADD CONSTRAINT chk_cnpj_numerico
CHECK (REGEXP_LIKE(cnpj, '^[0-9]+$'));`,
    after: `-- Coluna alfanumérica (20 caracteres formatado)
ALTER TABLE clientes
MODIFY cnpj VARCHAR2(20);

-- Constraint alfanumérica (0-9 e A-Z)
ALTER TABLE clientes
DROP CONSTRAINT chk_cnpj_numerico;

ALTER TABLE clientes
ADD CONSTRAINT chk_cnpj_alfanumerico
CHECK (REGEXP_LIKE(cnpj, '^[0-9A-Z./-]+$'));`,
    explanation: "No Oracle, usamos REGEXP_LIKE para validar o formato alfanumérico do CNPJ.",
  },
  {
    title: "Validação Python",
    language: "Python",
    description: "Validar CNPJ alfanumérico em Python",
    category: "validation",
    before: `def validate_cnpj(cnpj: str) -> bool:
    cleaned = ''.join(c for c in cnpj if c.isdigit())
    return len(cleaned) == 14`,
    after: `def validate_cnpj(cnpj: str) -> bool:
    import re
    cleaned = re.sub(r'[.\\-/]', '', cnpj).upper()
    if len(cleaned) != 14:
        return False
    valid_chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return all(c in valid_chars for c in cleaned)`,
    explanation: "Python usa expressões regulares para limpar e validar o CNPJ alfanumérico.",
  },
  {
    title: "Validação Java",
    language: "Java",
    description: "Validar CNPJ alfanumérico em Java",
    category: "validation",
    before: `public boolean validateCNPJ(String cnpj) {
    String cleaned = cnpj.replaceAll("[^\\\\d]", "");
    return cleaned.length() == 14;
}`,
    after: `public boolean validateCNPJ(String cnpj) {
    String cleaned = cnpj.replaceAll("[.\\\\-/]", "").toUpperCase();
    if (cleaned.length() != 14) return false;
    
    String validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (char c : cleaned.toCharArray()) {
        if (validChars.indexOf(c) == -1) return false;
    }
    return true;
}`,
    explanation: "Java requer tratamento explícito de caracteres para validar o formato alfanumérico.",
  },
  {
    title: "Validação C#",
    language: "C#",
    description: "Validar CNPJ alfanumérico em C#",
    category: "validation",
    before: `public bool ValidateCNPJ(string cnpj) {
    var cleaned = Regex.Replace(cnpj, @"[^\\d]", "");
    return cleaned.Length == 14;
}`,
    after: `public bool ValidateCNPJ(string cnpj) {
    var cleaned = Regex.Replace(cnpj, @"[.\\-/]", "").ToUpper();
    if (cleaned.Length != 14) return false;
    
    const string validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return cleaned.All(c => validChars.Contains(c));
}`,
    explanation: "C# usa LINQ para validação elegante do CNPJ alfanumérico.",
  },
  {
    title: "Validação PHP",
    language: "PHP",
    description: "Validar CNPJ alfanumérico em PHP",
    category: "validation",
    before: `function validateCNPJ($cnpj) {
    $cleaned = preg_replace('/[^0-9]/', '', $cnpj);
    return strlen($cleaned) === 14;
}`,
    after: `function validateCNPJ($cnpj) {
    $cleaned = strtoupper(preg_replace('/[.\\-\\/]/', '', $cnpj));
    if (strlen($cleaned) !== 14) return false;
    
    return preg_match('/^[0-9A-Z]+$/', $cleaned) === 1;
}`,
    explanation: "PHP usa preg_match para validar o padrão alfanumérico do CNPJ.",
  },
  {
    title: "Validação Go",
    language: "Go",
    description: "Validar CNPJ alfanumérico em Go",
    category: "validation",
    before: `func validateCNPJ(cnpj string) bool {
    re := regexp.MustCompile("[^0-9]")
    cleaned := re.ReplaceAllString(cnpj, "")
    return len(cleaned) == 14
}`,
    after: `func validateCNPJ(cnpj string) bool {
    re := regexp.MustCompile("[.\\\\-/]")
    cleaned := strings.ToUpper(re.ReplaceAllString(cnpj, ""))
    if len(cleaned) != 14 {
        return false
    }
    
    validChars := "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    for _, c := range cleaned {
        if !strings.ContainsRune(validChars, c) {
            return false
        }
    }
    return true
}`,
    explanation: "Go usa o pacote strings e regexp para validação eficiente do CNPJ alfanumérico.",
  },
]

export function getAllLanguages(): string[] {
  const languages = new Set(codeExamples.map((ex) => ex.language))
  return Array.from(languages).sort()
}

export function getExamplesByLanguage(language: string): CodeExample[] {
  return codeExamples.filter((ex) => ex.language === language)
}

export function getExamplesByCategory(category: CodeExample["category"]): CodeExample[] {
  return codeExamples.filter((ex) => ex.category === category)
}
