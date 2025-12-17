"use client"

export interface CodeExample {
  title: string
  description: string
  language: string
  category: "validation" | "mask" | "database" | "form" | "api"
  before: string
  after: string
  explanation: string
}

export const codeExamples: CodeExample[] = [
  {
    title: "Validação JavaScript",
    description: "Validar CNPJ alfanumérico em JavaScript",
    language: "JavaScript",
    category: "validation",
    before: `function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\\d]/g, '');
  if (cnpj.length !== 14) return false;
  
  // Validação apenas numérica
  return /^\\d{14}$/.test(cnpj);
}`,
    after: `function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/[.\\-\\/]/g, '').toUpperCase();
  if (cnpj.length !== 14) return false;
  
  // Aceita alfanumérico (A-Z, 0-9)
  if (!/^[A-Z0-9]{14}$/.test(cnpj)) return false;
  
  // Validar dígitos verificadores
  return validarDigitosVerificadores(cnpj);
}

function validarDigitosVerificadores(cnpj) {
  const base = cnpj.substring(0, 12);
  const dv1 = calcularDV(base);
  const dv2 = calcularDV(base + dv1);
  return cnpj[12] === dv1 && cnpj[13] === dv2;
}`,
    explanation:
      "Alterado para aceitar letras A-Z além de números. Adicionada validação de dígitos verificadores usando módulo 36.",
  },
  {
    title: "Campo de Formulário React",
    description: "Input para CNPJ alfanumérico em React",
    language: "TypeScript",
    category: "form",
    before: `<input
  type="text"
  maxLength={18}
  pattern="\\d{2}\\.\\d{3}\\.\\d{3}\\/\\d{4}\\-\\d{2}"
  placeholder="00.000.000/0000-00"
/>`,
    after: `<input
  type="text"
  maxLength={18}
  pattern="[A-Z0-9]{2}\\.[A-Z0-9]{3}\\.[A-Z0-9]{3}\\/[A-Z0-9]{4}\\-[A-Z0-9]{2}"
  placeholder="AB.C12.345/0001-XY"
  style={{ textTransform: 'uppercase' }}
  onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()}
/>`,
    explanation:
      "Pattern atualizado para aceitar A-Z e 0-9. Adicionado textTransform e onInput para converter automaticamente para maiúsculas.",
  },
  {
    title: "Máscara JavaScript",
    description: "Aplicar máscara em CNPJ alfanumérico",
    language: "JavaScript",
    category: "mask",
    before: `function mascaraCNPJ(valor) {
  return valor
    .replace(/\\D/g, '')
    .replace(/(\\d{2})(\\d)/, '$1.$2')
    .replace(/(\\d{3})(\\d)/, '$1.$2')
    .replace(/(\\d{3})(\\d)/, '$1/$2')
    .replace(/(\\d{4})(\\d)/, '$1-$2')
    .substring(0, 18);
}`,
    after: `function mascaraCNPJ(valor) {
  return valor
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
    .replace(/^([A-Z0-9]{2})([A-Z0-9])/, '$1.$2')
    .replace(/^([A-Z0-9]{2}\\.[A-Z0-9]{3})([A-Z0-9])/, '$1.$2')
    .replace(/^([A-Z0-9]{2}\\.[A-Z0-9]{3}\\.[A-Z0-9]{3})([A-Z0-9])/, '$1/$2')
    .replace(/^([A-Z0-9]{2}\\.[A-Z0-9]{3}\\.[A-Z0-9]{3}\\/[A-Z0-9]{4})([A-Z0-9])/, '$1-$2')
    .substring(0, 18);
}`,
    explanation: "Regex atualizado para aceitar letras e números. Adicionado toUpperCase() para padronizar entrada.",
  },
  {
    title: "Migration SQL Server",
    description: "Alterar coluna para suportar alfanumérico",
    language: "SQL Server",
    category: "database",
    before: `CREATE TABLE empresas (
  id INT PRIMARY KEY,
  cnpj CHAR(14) NOT NULL,
  razao_social VARCHAR(200)
);`,
    after: `-- Alterar coluna existente
ALTER TABLE empresas 
ALTER COLUMN cnpj VARCHAR(14) NOT NULL;

-- Adicionar constraint para validar formato
ALTER TABLE empresas
ADD CONSTRAINT chk_cnpj_format 
CHECK (cnpj LIKE '[A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9]');`,
    explanation:
      "Alterado de CHAR para VARCHAR para suportar caracteres alfanuméricos. Adicionada constraint para garantir formato correto.",
  },
  {
    title: "Validação Java",
    description: "Validar CNPJ alfanumérico em Java",
    language: "Java",
    category: "validation",
    before: `public boolean validarCNPJ(String cnpj) {
    cnpj = cnpj.replaceAll("[^0-9]", "");
    if (cnpj.length() != 14) return false;
    return cnpj.matches("\\\\d{14}");
}`,
    after: `public boolean validarCNPJ(String cnpj) {
    cnpj = cnpj.replaceAll("[.\\\\-/]", "").toUpperCase();
    if (cnpj.length() != 14) return false;
    
    if (!cnpj.matches("^[A-Z0-9]{14}$")) return false;
    
    // Validar dígitos verificadores
    String base = cnpj.substring(0, 12);
    char dv1 = calcularDV(base);
    char dv2 = calcularDV(base + dv1);
    
    return cnpj.charAt(12) == dv1 && cnpj.charAt(13) == dv2;
}

private char calcularDV(String base) {
    String chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    int[] pesos = {6,7,8,9,2,3,4,5,6,7,8,9};
    int soma = 0;
    
    for (int i = 0; i < base.length(); i++) {
        soma += chars.indexOf(base.charAt(i)) * pesos[i];
    }
    
    int resto = soma % 36;
    int dv = resto < 2 ? 0 : 36 - resto;
    return chars.charAt(dv);
}`,
    explanation:
      "Implementada validação completa com cálculo de dígitos verificadores usando módulo 36 conforme especificação da Receita Federal.",
  },
  {
    title: "API REST C#",
    description: "Endpoint para validar CNPJ alfanumérico",
    language: "C#",
    category: "api",
    before: `[HttpPost("validar-cnpj")]
public IActionResult ValidarCNPJ([FromBody] string cnpj)
{
    var limpo = Regex.Replace(cnpj, @"[^0-9]", "");
    var valido = limpo.Length == 14 && Regex.IsMatch(limpo, @"^\\d{14}$");
    
    return Ok(new { valido });
}`,
    after: `[HttpPost("validar-cnpj")]
public IActionResult ValidarCNPJ([FromBody] CnpjRequest request)
{
    var limpo = Regex.Replace(request.Cnpj, @"[.\\-/]", "").ToUpper();
    
    if (limpo.Length != 14)
        return BadRequest(new { erro = "CNPJ deve ter 14 caracteres" });
    
    if (!Regex.IsMatch(limpo, @"^[A-Z0-9]{14}$"))
        return BadRequest(new { erro = "CNPJ deve conter apenas letras e números" });
    
    var valido = ValidarDigitosVerificadores(limpo);
    
    return Ok(new { 
        cnpj = limpo,
        formatado = FormatarCNPJ(limpo),
        valido,
        formato = "alfanumerico"
    });
}

private bool ValidarDigitosVerificadores(string cnpj)
{
    var base = cnpj.Substring(0, 12);
    var dv1 = CalcularDV(base);
    var dv2 = CalcularDV(base + dv1);
    return cnpj[12] == dv1 && cnpj[13] == dv2;
}

private char CalcularDV(string base)
{
    string chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    int[] pesos = {6,7,8,9,2,3,4,5,6,7,8,9};
    int soma = 0;
    
    for (int i = 0; i < base.Length; i++) {
        soma += chars.IndexOf(base[i]) * pesos[i];
    }
    
    int resto = soma % 36;
    int dv = resto < 2 ? 0 : 36 - resto;
    return chars[dv];
}

private string FormatarCNPJ(string cnpj)
{
    return $"{cnpj.Substring(0,2)}.{cnpj.Substring(2,3)}.{cnpj.Substring(5,3)}/{cnpj.Substring(8,4)}-{cnpj.Substring(12,2)}";
}`,
    explanation:
      "API atualizada para aceitar e validar CNPJ alfanumérico com resposta detalhada incluindo formato e validação de DV.",
  },
  {
    title: "Validação PHP",
    description: "Função PHP para validar CNPJ alfanumérico",
    language: "PHP",
    category: "validation",
    before: `function validarCNPJ($cnpj) {
    $cnpj = preg_replace('/[^0-9]/', '', $cnpj);
    if (strlen($cnpj) != 14) return false;
    return preg_match('/^\\d{14}$/', $cnpj);
}`,
    after: `function validarCNPJ($cnpj) {
    $cnpj = strtoupper(preg_replace('/[.\\-\\/]/', '', $cnpj));
    
    if (strlen($cnpj) !== 14) return false;
    if (!preg_match('/^[A-Z0-9]{14}$/', $cnpj)) return false;
    
    // Validar dígitos verificadores
    $base = substr($cnpj, 0, 12);
    $dv1 = calcularDV($base);
    $dv2 = calcularDV($base . $dv1);
    
    return $cnpj[12] === $dv1 && $cnpj[13] === $dv2;
}

function calcularDV($base) {
    $chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $pesos = [6,7,8,9,2,3,4,5,6,7,8,9];
    $soma = 0;
    
    for ($i = 0; $i < strlen($base); $i++) {
        $soma += strpos($chars, $base[$i]) * $pesos[$i];
    }
    
    $resto = $soma % 36;
    $dv = $resto < 2 ? 0 : 36 - $resto;
    return $chars[$dv];
}`,
    explanation:
      "Implementação completa em PHP com validação de dígitos verificadores usando algoritmo oficial da Receita Federal.",
  },
  {
    title: "Model Python Django",
    description: "Campo de modelo Django para CNPJ alfanumérico",
    language: "Python",
    category: "database",
    before: `class Empresa(models.Model):
    cnpj = models.CharField(
        max_length=14,
        validators=[RegexValidator(r'^\\d{14}$')]
    )
    razao_social = models.CharField(max_length=200)`,
    after: `import re
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError

def validar_cnpj_alfanumerico(value):
    limpo = re.sub(r'[.\\-/]', '', value).upper()
    if len(limpo) != 14:
        raise ValidationError('CNPJ deve ter 14 caracteres')
    if not re.match(r'^[A-Z0-9]{14}$', limpo):
        raise ValidationError('CNPJ deve conter apenas letras e números')
    # Adicionar validação de DV aqui

class Empresa(models.Model):
    cnpj = models.CharField(
        max_length=14,
        validators=[validar_cnpj_alfanumerico]
    )
    razao_social = models.CharField(max_length=200)
    
    def save(self, *args, **kwargs):
        self.cnpj = self.cnpj.upper()
        super().save(*args, **kwargs)`,
    explanation:
      "Criado validador customizado para aceitar CNPJ alfanumérico. Adicionado método save para converter automaticamente para maiúsculas.",
  },
  {
    title: "Hook de Validação React",
    description: "Custom hook para validar CNPJ em componentes React",
    language: "React",
    category: "form",
    before: `// Hook para CNPJ numérico
import { useState } from 'react';

function useCNPJValidator() {
  const [cnpj, setCNPJ] = useState('');
  const [isValid, setIsValid] = useState(false);
  
  const validate = (value: string) => {
    const cleaned = value.replace(/[^\\d]/g, '');
    const valid = cleaned.length === 14 && /^\\d{14}$/.test(cleaned);
    setIsValid(valid);
    setCNPJ(value);
  };
  
  return { cnpj, isValid, validate };
}`,
    after: `// Hook para CNPJ alfanumérico
import { useState, useCallback } from 'react';

interface CNPJValidation {
  cnpj: string;
  isValid: boolean;
  error: string | null;
  formatted: string;
}

function useCNPJValidator() {
  const [state, setState] = useState<CNPJValidation>({
    cnpj: '',
    isValid: false,
    error: null,
    formatted: ''
  });
  
  const validate = useCallback((value: string) => {
    const cleaned = value.replace(/[.\\-\\/]/g, '').toUpperCase();
    
    if (cleaned.length !== 14) {
      setState({ cnpj: value, isValid: false, error: 'Deve ter 14 caracteres', formatted: '' });
      return;
    }
    
    if (!/^[0-9A-Z]{14}$/.test(cleaned)) {
      setState({ cnpj: value, isValid: false, error: 'Caracteres inválidos', formatted: '' });
      return;
    }
    
    const isValid = validateAlphanumericCNPJ(cleaned);
    const formatted = \`\${cleaned.slice(0,2)}.\${cleaned.slice(2,5)}.\${cleaned.slice(5,8)}/\${cleaned.slice(8,12)}-\${cleaned.slice(12,14)}\`;
    
    setState({ 
      cnpj: value, 
      isValid, 
      error: isValid ? null : 'CNPJ inválido',
      formatted: isValid ? formatted : ''
    });
  }, []);
  
  return { ...state, validate };
}`,
    explanation:
      "O hook React gerencia o estado da validação, aceita caracteres alfanuméricos e retorna feedback em tempo real com mensagens de erro e formatação automática.",
  },
  {
    title: "Validador Angular Reactive Forms",
    description: "Custom validator para formulários reativos do Angular",
    language: "Angular",
    category: "form",
    before: `// Validador numérico Angular
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function cnpjValidator(control: AbstractControl): ValidationErrors | null {
  const cnpj = control.value?.replace(/[^\\d]/g, '');
  
  if (!cnpj || cnpj.length !== 14) {
    return { cnpjInvalid: true };
  }
  
  if (!/^\\d{14}$/.test(cnpj)) {
    return { cnpjInvalid: true };
  }
  
  return null;
}`,
    after: `// Validador alfanumérico Angular
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cnpjAlphanumericValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }
    
    const cleaned = value.replace(/[.\\-\\/]/g, '').toUpperCase();
    
    if (cleaned.length !== 14) {
      return { cnpjLength: { requiredLength: 14, actualLength: cleaned.length } };
    }
    
    if (!/^[0-9A-Z]{14}$/.test(cleaned)) {
      return { cnpjInvalidChars: true };
    }
    
    if (!validateCheckDigits(cleaned)) {
      return { cnpjInvalidCheckDigits: true };
    }
    
    return null;
  };
}`,
    explanation:
      "O validador Angular retorna erros específicos para cada tipo de problema, permitindo mensagens de erro personalizadas no template.",
  },
  {
    title: "Composable Vue 3",
    description: "Composable para validação de CNPJ no Vue 3",
    language: "Vue",
    category: "form",
    before: `// Composable para CNPJ numérico
import { ref, computed } from 'vue';

export function useCNPJValidator() {
  const cnpj = ref('');
  
  const isValid = computed(() => {
    const cleaned = cnpj.value.replace(/[^\\d]/g, '');
    return cleaned.length === 14 && /^\\d{14}$/.test(cleaned);
  });
  
  return { cnpj, isValid };
}`,
    after: `// Composable para CNPJ alfanumérico
import { ref, computed } from 'vue';

export function useCNPJValidator() {
  const cnpj = ref('');
  const error = ref<string | null>(null);
  
  const cleaned = computed(() => 
    cnpj.value.replace(/[.\\-\\/]/g, '').toUpperCase()
  );
  
  const formatted = computed(() => {
    const c = cleaned.value;
    if (c.length !== 14) return cnpj.value;
    return \`\${c.slice(0,2)}.\${c.slice(2,5)}.\${c.slice(5,8)}/\${c.slice(8,12)}-\${c.slice(12,14)}\`;
  });
  
  const isValid = computed(() => {
    const c = cleaned.value;
    
    if (c.length !== 14) {
      error.value = 'CNPJ deve ter 14 caracteres';
      return false;
    }
    
    if (!/^[0-9A-Z]{14}$/.test(c)) {
      error.value = 'CNPJ contém caracteres inválidos';
      return false;
    }
    
    const valid = validateAlphanumericCNPJ(c);
    error.value = valid ? null : 'CNPJ inválido';
    return valid;
  });
  
  return { cnpj, isValid, error, formatted, cleaned };
}`,
    explanation:
      "O composable Vue 3 usa computed properties para validação reativa, formatação automática e mensagens de erro.",
  },
  {
    title: "Validador Flutter/Dart",
    description: "Classe validadora para aplicativos Flutter",
    language: "Flutter",
    category: "validation",
    before: `// Validador numérico Flutter
class CNPJValidator {
  static bool validate(String cnpj) {
    final cleaned = cnpj.replaceAll(RegExp(r'[^\\d]'), '');
    
    if (cleaned.length != 14) return false;
    if (!RegExp(r'^\\d{14}$').hasMatch(cleaned)) return false;
    
    return true;
  }
}`,
    after: `// Validador alfanumérico Flutter
class CNPJValidator {
  static const String _chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  static const List<int> _weights1 = [6,7,8,9,2,3,4,5,6,7,8,9];
  static const List<int> _weights2 = [5,6,7,8,9,2,3,4,5,6,7,8,9];
  
  static bool validate(String cnpj) {
    final cleaned = cnpj
        .replaceAll(RegExp(r'[.\\-\\/]'), '')
        .toUpperCase();
    
    if (cleaned.length != 14) return false;
    if (!RegExp(r'^[0-9A-Z]{14}$').hasMatch(cleaned)) return false;
    
    // Valida primeiro dígito
    int sum = 0;
    for (int i = 0; i < 12; i++) {
      sum += _chars.indexOf(cleaned[i]) * _weights1[i];
    }
    final digit1 = sum % 36 < 2 ? 0 : 36 - (sum % 36);
    if (_chars[digit1] != cleaned[12]) return false;
    
    // Valida segundo dígito
    sum = 0;
    for (int i = 0; i < 13; i++) {
      sum += _chars.indexOf(cleaned[i]) * _weights2[i];
    }
    final digit2 = sum % 36 < 2 ? 0 : 36 - (sum % 36);
    return _chars[digit2] == cleaned[13];
  }
  
  static String format(String cnpj) {
    final cleaned = cnpj.replaceAll(RegExp(r'[.\\-\\/]'), '').toUpperCase();
    if (cleaned.length != 14) return cnpj;
    return '\${cleaned.substring(0,2)}.\${cleaned.substring(2,5)}.\${cleaned.substring(5,8)}/\${cleaned.substring(8,12)}-\${cleaned.substring(12,14)}';
  }
}`,
    explanation:
      "A classe Flutter implementa validação alfanumérica completa com constantes para os pesos e caracteres válidos.",
  },
  {
    title: "Validador em Go",
    description: "Pacote Go para validação de CNPJ",
    language: "Go",
    category: "validation",
    before: `// Validador numérico Go
package cnpj

import "regexp"

func Validate(cnpj string) bool {
    cleaned := regexp.MustCompile("[^\\d]").ReplaceAllString(cnpj, "")
    
    if len(cleaned) != 14 {
        return false
    }
    
    return regexp.MustCompile("^\\d{14}$").MatchString(cleaned)
}`,
    after: `// Validador alfanumérico Go
package cnpj

import (
    "regexp"
    "strings"
)

const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

var (
    weights1 = []int{6,7,8,9,2,3,4,5,6,7,8,9}
    weights2 = []int{5,6,7,8,9,2,3,4,5,6,7,8,9}
)

func Validate(cnpj string) bool {
    cleaned := strings.ToUpper(
        regexp.MustCompile("[.\\-\\/]").ReplaceAllString(cnpj, ""),
    )
    
    if len(cleaned) != 14 {
        return false
    }
    
    if !regexp.MustCompile("^[0-9A-Z]{14}$").MatchString(cleaned) {
        return false
    }
    
    // Valida primeiro dígito
    sum := 0
    for i := 0; i < 12; i++ {
        sum += strings.IndexByte(chars, cleaned[i]) * weights1[i]
    }
    digit1 := sum % 36
    if digit1 < 2 {
        digit1 = 0
    } else {
        digit1 = 36 - digit1
    }
    if chars[digit1] != cleaned[12] {
        return false
    }
    
    // Valida segundo dígito
    sum = 0
    for i := 0; i < 13; i++ {
        sum += strings.IndexByte(chars, cleaned[i]) * weights2[i]
    }
    digit2 := sum % 36
    if digit2 < 2 {
        digit2 = 0
    } else {
        digit2 = 36 - digit2
    }
    return chars[digit2] == cleaned[13]
}`,
    explanation:
      "O pacote Go implementa validação eficiente usando slices para os pesos e strings.IndexByte para busca rápida.",
  },
  {
    title: "Módulo Node.js",
    description: "Módulo para validação no backend Node.js",
    language: "Node.js",
    category: "api",
    before: `// Módulo Node.js numérico
function validarCNPJ(cnpj) {
  const cleaned = cnpj.replace(/[^\\d]/g, '');
  
  if (cleaned.length !== 14) return false;
  if (!/^\\d{14}$/.test(cleaned)) return false;
  
  return true;
}

module.exports = { validarCNPJ };`,
    after: `// Módulo Node.js alfanumérico
const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const WEIGHTS_1 = [6,7,8,9,2,3,4,5,6,7,8,9];
const WEIGHTS_2 = [5,6,7,8,9,2,3,4,5,6,7,8,9];

function validarCNPJ(cnpj) {
  const cleaned = cnpj.replace(/[.\\-\\/]/g, '').toUpperCase();
  
  if (cleaned.length !== 14) {
    return { valid: false, error: 'CNPJ deve ter 14 caracteres' };
  }
  
  if (!/^[0-9A-Z]{14}$/.test(cleaned)) {
    return { valid: false, error: 'CNPJ contém caracteres inválidos' };
  }
  
  // Valida primeiro dígito
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += CHARS.indexOf(cleaned[i]) * WEIGHTS_1[i];
  }
  const digit1 = sum % 36 < 2 ? 0 : 36 - (sum % 36);
  if (CHARS[digit1] !== cleaned[12]) {
    return { valid: false, error: 'Primeiro dígito verificador inválido' };
  }
  
  // Valida segundo dígito
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += CHARS.indexOf(cleaned[i]) * WEIGHTS_2[i];
  }
  const digit2 = sum % 36 < 2 ? 0 : 36 - (sum % 36);
  if (CHARS[digit2] !== cleaned[13]) {
    return { valid: false, error: 'Segundo dígito verificador inválido' };
  }
  
  const formatted = \`\${cleaned.slice(0,2)}.\${cleaned.slice(2,5)}.\${cleaned.slice(5,8)}/\${cleaned.slice(8,12)}-\${cleaned.slice(12,14)}\`;
  return { valid: true, cnpj: formatted };
}

module.exports = { validarCNPJ };`,
    explanation:
      "O módulo Node.js retorna objetos estruturados com status de validação e mensagens de erro detalhadas.",
  },
  {
    title: "Validador ASP.NET Core",
    description: "Classe C# para validação em aplicações .NET",
    language: "ASP.NET",
    category: "validation",
    before: `// Validador numérico C#
using System.Text.RegularExpressions;

public class CNPJValidator
{
    public static bool Validate(string cnpj)
    {
        var cleaned = Regex.Replace(cnpj, @"[^\\d]", "");
        
        if (cleaned.Length != 14) return false;
        if (!Regex.IsMatch(cleaned, @"^\\d{14}$")) return false;
        
        return true;
    }
}`,
    after: `// Validador alfanumérico C#
using System;
using System.Text.RegularExpressions;

public class CNPJValidator
{
    private const string Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static readonly int[] Weights1 = { 6,7,8,9,2,3,4,5,6,7,8,9 };
    private static readonly int[] Weights2 = { 5,6,7,8,9,2,3,4,5,6,7,8,9 };
    
    public static ValidationResult Validate(string cnpj)
    {
        var cleaned = Regex.Replace(cnpj, @"[.\\-\\/]", "").ToUpper();
        
        if (cleaned.Length != 14)
        {
            return new ValidationResult 
            { 
                IsValid = false, 
                Error = "CNPJ deve ter 14 caracteres" 
            };
        }
        
        if (!Regex.IsMatch(cleaned, @"^[0-9A-Z]{14}$"))
        {
            return new ValidationResult 
            { 
                IsValid = false, 
                Error = "CNPJ contém caracteres inválidos" 
            };
        }
        
        // Valida primeiro dígito
        int sum = 0;
        for (int i = 0; i < 12; i++)
        {
            sum += Chars.IndexOf(cleaned[i]) * Weights1[i];
        }
        int digit1 = sum % 36 < 2 ? 0 : 36 - (sum % 36);
        if (Chars[digit1] != cleaned[12])
        {
            return new ValidationResult 
            { 
                IsValid = false, 
                Error = "Primeiro dígito verificador inválido" 
            };
        }
        
        // Valida segundo dígito
        sum = 0;
        for (int i = 0; i < 13; i++)
        {
            sum += Chars.IndexOf(cleaned[i]) * Weights2[i];
        }
        int digit2 = sum % 36 < 2 ? 0 : 36 - (sum % 36);
        if (Chars[digit2] != cleaned[13])
        {
            return new ValidationResult 
            { 
                IsValid = false, 
                Error = "Segundo dígito verificador inválido" 
            };
        }
        
        var formatted = $"{cleaned.Substring(0,2)}.{cleaned.Substring(2,3)}.{cleaned.Substring(5,3)}/{cleaned.Substring(8,4)}-{cleaned.Substring(12,2)}";
        return new ValidationResult 
        { 
            IsValid = true, 
            FormattedCNPJ = formatted 
        };
    }
    
    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public string? Error { get; set; }
        public string? FormattedCNPJ { get; set; }
    }
}`,
    explanation:
      "A classe C# usa tipos fortemente tipados e retorna um objeto ValidationResult com propriedades nullable.",
  },
  {
    title: "Migration Oracle",
    description: "Alterar coluna Oracle para suportar alfanumérico",
    language: "Oracle",
    category: "database",
    before: `CREATE TABLE empresas (
  id NUMBER PRIMARY KEY,
  cnpj CHAR(14) NOT NULL,
  razao_social VARCHAR2(200)
);`,
    after: `-- Alterar coluna existente
ALTER TABLE empresas 
MODIFY cnpj VARCHAR2(14) NOT NULL;

-- Adicionar constraint para validar formato
ALTER TABLE empresas
ADD CONSTRAINT chk_cnpj_format 
CHECK (REGEXP_LIKE(cnpj, '^[A-Z0-9]{14}$'));

-- Criar índice para melhor performance
CREATE INDEX idx_empresas_cnpj ON empresas(cnpj);

-- Trigger para converter automaticamente para maiúsculas
CREATE OR REPLACE TRIGGER trg_cnpj_uppercase
BEFORE INSERT OR UPDATE ON empresas
FOR EACH ROW
BEGIN
  :NEW.cnpj := UPPER(:NEW.cnpj);
END;`,
    explanation:
      "Alterado de CHAR para VARCHAR2 para suportar alfanuméricos. Adicionada constraint com REGEXP_LIKE, índice para performance e trigger para conversão automática para maiúsculas.",
  },
]

export function getExamplesByLanguage(language: string): CodeExample[] {
  return codeExamples.filter((ex) => ex.language === language)
}

export function getExamplesByCategory(category: CodeExample["category"]): CodeExample[] {
  return codeExamples.filter((ex) => ex.category === category)
}

export function getAllLanguages(): string[] {
  return Array.from(new Set(codeExamples.map((ex) => ex.language)))
}
