# 🧪 Guia de Testes - Sistema QR Code

## 📋 Casos de Teste Manuais

### 1. Autenticação e Perfil

#### Teste 1.1: Login com Sucesso
**Pré-condição**: Usuário cadastrado no sistema
**Passos**:
1. Acessar a aplicação
2. Clicar em "Entrar"
3. Inserir email e senha válidos
4. Clicar em "Login"

**Resultado Esperado**:
- ✅ Usuário é redirecionado para a tela correta (Analytics se admin, Generator se usuário comum)
- ✅ Toast de sucesso aparece
- ✅ Perfil é carregado e salvo em cache
- ✅ Menu de navegação aparece

#### Teste 1.2: Cache de Perfil
**Pré-condição**: Usuário já fez login uma vez
**Passos**:
1. Fazer login
2. Recarregar a página (F5)

**Resultado Esperado**:
- ✅ Perfil carrega instantaneamente do cache
- ✅ Dados são atualizados em background
- ✅ Não há delay na interface

#### Teste 1.3: Logout
**Pré-condição**: Usuário logado
**Passos**:
1. Ir para Settings
2. Clicar em "Sair do Sistema"

**Resultado Esperado**:
- ✅ Toast de "Até logo! 👋" aparece
- ✅ Cache de perfil é limpo
- ✅ Usuário é redirecionado para landing page

---

### 2. Permissões e Segurança

#### Teste 2.1: Acesso Admin - Usuário Admin
**Pré-condição**: Usuário com `is_admin = true`
**Passos**:
1. Fazer login como admin
2. Verificar menu de navegação
3. Clicar no ícone de Admin (chave)

**Resultado Esperado**:
- ✅ Menu mostra 5 opções (Analytics, Generator, Leads, Admin, Settings)
- ✅ Admin Dashboard carrega com lazy loading
- ✅ Dados globais são exibidos

#### Teste 2.2: Acesso Admin - Usuário Comum
**Pré-condição**: Usuário com `is_admin = false`
**Passos**:
1. Fazer login como usuário comum
2. Verificar menu de navegação
3. Tentar acessar `/admin` via URL (se aplicável)

**Resultado Esperado**:
- ✅ Menu mostra apenas 3 opções (Generator, Leads, Settings)
- ✅ Não há ícone de Admin
- ✅ Toast de erro "Acesso negado" se tentar acessar admin
- ✅ Redirecionado para Generator

#### Teste 2.3: Validação de Inputs
**Pré-condição**: Usuário logado
**Passos**:
1. Tentar criar QR Code com URL inválida (ex: "javascript:alert(1)")
2. Tentar criar QR Code com cor inválida (ex: "red")
3. Tentar criar QR Code com nome vazio

**Resultado Esperado**:
- ✅ Erros de validação são mostrados
- ✅ QR Code não é criado
- ✅ Mensagens de erro amigáveis aparecem

---

### 3. Performance

#### Teste 3.1: Lazy Loading do Admin
**Pré-condição**: Usuário admin logado
**Passos**:
1. Abrir DevTools (F12) → Network
2. Fazer login
3. Ir para Generator
4. Verificar que AdminDashboard não foi carregado
5. Clicar em Admin
6. Verificar que AdminDashboard é carregado agora

**Resultado Esperado**:
- ✅ AdminDashboard.tsx não é carregado no login
- ✅ AdminDashboard.tsx é carregado apenas ao acessar a página
- ✅ Skeleton loader aparece durante carregamento

#### Teste 3.2: Timeout de Queries
**Pré-condição**: Simular conexão lenta
**Passos**:
1. Abrir DevTools → Network
2. Throttle para "Slow 3G"
3. Fazer login
4. Aguardar 5 segundos

**Resultado Esperado**:
- ✅ Timeout ocorre após 5 segundos
- ✅ Perfil básico é criado
- ✅ Usuário pode continuar usando o app
- ✅ Toast de erro amigável aparece

---

### 4. UX e Mensagens

#### Teste 4.1: Mensagens de Sucesso
**Pré-condição**: Usuário logado
**Passos**:
1. Criar um QR Code
2. Capturar um Lead
3. Fazer logout

**Resultado Esperado**:
- ✅ "QR Code criado com sucesso! 🎉"
- ✅ "Lead capturado com sucesso! 📊"
- ✅ "Até logo! 👋"

#### Teste 4.2: Mensagens de Erro
**Pré-condição**: Simular erro de rede
**Passos**:
1. Desconectar internet
2. Tentar criar QR Code
3. Reconectar internet

**Resultado Esperado**:
- ✅ Mensagem de erro amigável (não técnica)
- ✅ Sugestão de ação (verificar conexão)
- ✅ Possibilidade de tentar novamente

---

### 5. Monitoramento e Logs

#### Teste 5.1: Logs Estruturados
**Pré-condição**: Ambiente de desenvolvimento
**Passos**:
1. Abrir Console (F12)
2. Fazer login
3. Criar QR Code
4. Verificar logs no console

**Resultado Esperado**:
- ✅ Logs formatados com timestamp
- ✅ Níveis de log corretos (INFO, WARN, ERROR)
- ✅ Contexto adicional nos logs

#### Teste 5.2: Analytics
**Pré-condição**: Usuário logado
**Passos**:
1. Abrir Console
2. Executar: `localStorage.getItem('neoqrc_analytics')`
3. Fazer várias ações (criar QR, capturar lead, etc.)
4. Verificar novamente

**Resultado Esperado**:
- ✅ Eventos são salvos em localStorage
- ✅ Cada evento tem timestamp, sessionId, userId
- ✅ Máximo 200 eventos salvos

---

## 🔍 Testes de Integração

### Fluxo Completo: Usuário Comum

1. **Landing** → Clicar em "Entrar"
2. **Auth** → Fazer login
3. **Generator** → Criar QR Code
4. **Analytics** → Ver estatísticas
5. **Leads** → Ver leads capturados
6. **Settings** → Atualizar perfil
7. **Logout** → Sair do sistema

**Resultado Esperado**: Fluxo completo sem erros

### Fluxo Completo: Admin

1. **Landing** → Clicar em "Entrar"
2. **Auth** → Fazer login como admin
3. **Analytics** → Ver estatísticas pessoais
4. **Admin Dashboard** → Ver dados globais
5. **Verificar** → Todos os usuários e QR codes
6. **Logout** → Sair do sistema

**Resultado Esperado**: Acesso a todas as áreas administrativas

---

## ⚠️ Testes de Segurança

### SQL Injection (Prevenido pelo Supabase)
**Teste**: Tentar inserir `'; DROP TABLE profiles; --` em campos de texto
**Resultado Esperado**: Input é sanitizado, nenhum dano ao banco

### XSS (Cross-Site Scripting)
**Teste**: Tentar inserir `<script>alert('XSS')</script>` em nome de QR Code
**Resultado Esperado**: HTML é escapado, script não executa

### CSRF (Prevenido pelo Supabase Auth)
**Teste**: Verificar tokens de autenticação
**Resultado Esperado**: Tokens são validados em cada request

---

## 📊 Checklist de Testes

### Funcionalidades Básicas
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Criar QR Code funciona
- [ ] Ver Analytics funciona
- [ ] Ver Leads funciona
- [ ] Atualizar perfil funciona

### Permissões
- [ ] Admin vê menu completo
- [ ] Usuário comum vê menu limitado
- [ ] Admin acessa dashboard
- [ ] Usuário comum não acessa dashboard

### Performance
- [ ] Cache de perfil funciona
- [ ] Lazy loading do admin funciona
- [ ] Timeout de queries funciona
- [ ] App carrega em < 3 segundos

### Segurança
- [ ] Inputs são sanitizados
- [ ] Permissões são validadas
- [ ] Rate limiting funciona (se testável)
- [ ] Erros não expõem dados sensíveis

### UX
- [ ] Mensagens de sucesso são amigáveis
- [ ] Mensagens de erro são amigáveis
- [ ] Loading states são claros
- [ ] Navegação é intuitiva

---

## 🐛 Bugs Conhecidos

*Nenhum bug conhecido no momento*

---

## 📝 Notas para Testes em Produção

1. **Monitoramento**: Integrar Sentry ou similar para rastrear erros
2. **Analytics**: Integrar Google Analytics ou Mixpanel
3. **Performance**: Usar Lighthouse para auditar performance
4. **Segurança**: Fazer pentest antes do lançamento
5. **Load Testing**: Testar com múltiplos usuários simultâneos
