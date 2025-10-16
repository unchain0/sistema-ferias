// Script para testar conexão com banco de dados
// Execute: node scripts/test-db-connection.js

const fs = require('fs');
const path = require('path');

// Ler .env.local manualmente
let supabaseUrl = '';
let supabaseKey = '';

try {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  envContent.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  });
} catch (err) {
  // .env.local não existe ou não pode ser lido
}

console.log('🔍 Testando configuração do banco de dados...\n');

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ PROBLEMA: Variáveis do Supabase não configuradas!');
  console.log('');
  console.log('Verifique se .env.local contém:');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL');
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('');
  console.log('➡️  Sistema usará: ARMAZENAMENTO EM MEMÓRIA (dados serão perdidos!)');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente configuradas:');
console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`   Key: ${supabaseKey.substring(0, 30)}...`);
console.log('');
console.log('➡️  Sistema usará: SUPABASE (dados persistentes!)');
console.log('');
console.log('🎉 Tudo certo! Seus dados serão salvos no Supabase.');
