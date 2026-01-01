# 🚀 Deploy na Hostgator - Guia Completo

## 📋 Pré-requisitos
- Hospedagem compartilhada Hostgator (cPanel)
- Acesso FTP ou File Manager
- Node.js instalado localmente

## 🔧 Passo 1 - Build do Projeto

```bash
# Entrar na pasta do projeto
cd "Qr code v9"

# Instalar dependências
npm install

# Build para produção
npm run build
```

## 📁 Estrutura Criada
Após o build, será criada a pasta `dist/`:
```
dist/
├── assets/          # Arquivos CSS, JS, imagens
├── index.html       # Página principal
└── .htaccess       # Configuração Apache
```

## 🚀 Passo 2 - Upload para Hostgator

### Opção A: Via cPanel File Manager
1. Acesse cPanel da Hostgator
2. Vá em "File Manager"
3. Navegue até `public_html/`
4. Crie uma pasta para seu projeto (ex: `qrapp`)
5. Faça upload de TODOS os arquivos da pasta `dist/`
6. **Importante:** O `.htaccess` deve ficar na raiz da pasta

### Opção B: Via FTP
1. Conecte via FTP (FileZilla, etc.)
2. Navegue até `public_html/`
3. Crie pasta do projeto
4. Faça upload dos arquivos da pasta `dist/`

## ⚙️ Passo 3 - Configurações Adicionais

### Configurar .htaccess
O arquivo `.htaccess` já está configurado para:
- ✅ React Router (SPA)
- ✅ Compressão de arquivos
- ✅ Cache otimizado
- ✅ Headers de segurança

### Verificar Permissões
- Pastas: `755`
- Arquivos: `644`

## 🌐 Passo 4 - Acessar o Site

Após upload, acesse:
```
https://seusite.com/qrapp/
```

## 🔍 Verificação

1. **Funciona o carregamento?** ✅
2. **As rotas funcionam?** (Analytics, Generator, etc.) ✅
3. **QR Codes geram?** ✅
4. **Login funciona?** ✅

## 🚨 Possíveis Problemas

### Erro 404 em rotas
- Verifique se o `.htaccess` está na pasta correta
- Confirme se o mod_rewrite está ativo na Hostgator

### Recursos não carregam
- Verifique o `base path` no `vite.config.ts`
- Confirme se os arquivos em `assets/` foram enviados

### Supabase Connection
- Verifique se as URLs do Supabase estão corretas
- Confirme se não há bloqueio CORS

## 📱 Teste em Dispositivos Móveis
- Teste em diferentes navegadores
- Verifique responsividade
- Confirme funcionalidades touch

## 🔄 Atualizações Futuras

Para atualizar o site:
1. Faça as alterações no código
2. Execute `npm run build`
3. Substitua os arquivos na Hostgator
4. Limpe cache do navegador

## 🎉 Sucesso!

Seu aplicativo QR Code está agora online na Hostgator! 🚀

## 📞 Suporte

Se tiver problemas:
1. Verifique o console do navegador (F12)
2. Confirme os logs de erro da Hostgator
3. Verifique se o `.htaccess` está funcionando
