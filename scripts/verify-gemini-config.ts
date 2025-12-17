// Script para verificar configuração do Gemini
console.log("🔍 Verificando configuração do Gemini...")

const requiredEnvVars = ["GOOGLE_GENERATIVE_AI_API_KEY", "GOOGLE_API_KEY", "GEMINI_API_KEY"]

let foundKey = false

for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} encontrada`)
    foundKey = true
    break
  }
}

if (!foundKey) {
  console.log("❌ NENHUMA API KEY DO GEMINI ENCONTRADA!")
  console.log("\n📋 Para configurar:")
  console.log("1. Obtenha uma chave em: https://makersuite.google.com/app/apikey")
  console.log("2. Adicione nas variáveis de ambiente do Vercel:")
  console.log("   GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_aqui")
  console.log("\n⚠️ Sem esta chave, a análise funcionará mas SEM insights de IA")
} else {
  console.log("✅ Gemini está configurado corretamente!")
}
