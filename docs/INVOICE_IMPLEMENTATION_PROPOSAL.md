# Invoice Generation System - Implementation Proposal

## 📋 Análise do Estado Atual

### Situação Atual
- **Jobs** são criados e têm `totalPrice` e `cost` calculados automaticamente
- **Finance.tsx** mostra apenas jobs completados (`status === "completed"`) para calcular receita
- **Não existe sistema de invoices** - apenas visualização financeira baseada em jobs individuais
- Cada cliente tem `pricePerHour` usado para calcular o `totalPrice` do job

### Necessidade
Implementar um sistema onde cada cliente pode ter sua própria configuração de como/quando invoices são geradas, permitindo:
- Agrupar jobs completados em invoices
- Configurar frequência de geração (mensal, semanal, por job, etc.)
- Manter histórico de invoices geradas
- Flexibilidade para diferentes necessidades por cliente

## 🎯 Proposta de Implementação

### Opção 1: Configuração Simples no Client (RECOMENDADA)

**Vantagens:**
- ✅ Mudanças mínimas no código existente
- ✅ Fácil de implementar
- ✅ Compatível com a estrutura atual
- ✅ Não quebra funcionalidades existentes

**Estrutura:**

#### 1. Adicionar campos de configuração no Client Schema

```typescript
// In src/lib/schemas.ts

export const InvoiceFrequencyEnum = z.enum([
  "per_job",      // Invoice generated automatically when job is completed
  "weekly",       // Weekly invoice (all completed jobs in the week)
  "biweekly",     // Biweekly invoice
  "monthly",      // Monthly invoice (most common default)
  "manual"        // Invoice generated manually only
]);

export const clientSchema = z.object({
  // ... existing fields ...
  
  // New invoice configuration
  invoiceFrequency: InvoiceFrequencyEnum.default("monthly"),
  invoiceDayOfMonth: z.number().min(1).max(31).optional(), // Day of month to generate (e.g., day 5)
  invoiceDayOfWeek: z.number().min(0).max(6).optional(),  // Day of week (0=Sunday, 6=Saturday)
  autoGenerateInvoice: z.boolean().default(true),          // Generate automatically or manually
  invoiceNotes: z.string().optional(),                     // Default notes for invoices from this client
});
```

#### 2. Criar Schema de Invoice

```typescript
// In src/lib/schemas.ts

export const InvoiceStatusEnum = z.enum([
  "draft",        // Draft (can still add jobs)
  "pending",      // Sent, awaiting payment
  "paid",         // Paid
  "overdue",      // Overdue
  "cancelled"     // Cancelled
]);

export const invoiceSchema = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string().uuid(),
  invoiceNumber: z.string(),                    // E.g.: "INV-2025-001"
  periodStart: z.date(),                        // Start of billing period
  periodEnd: z.date(),                          // End of billing period
  issueDate: z.date(),                          // Issue date
  dueDate: z.date(),                            // Due date
  status: InvoiceStatusEnum.default("draft"),
  subtotal: z.number(),                         // Sum of totalPrice from jobs
  tax: z.number().default(0),                    // Tax/VAT (if applicable)
  total: z.number(),                             // subtotal + tax
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const invoiceJobSchema = z.object({
  id: z.string().uuid().optional(),
  invoiceId: z.string().uuid(),
  jobId: z.string().uuid(),
  createdAt: z.date().optional(),
});

// Types
export type Invoice = z.infer<typeof invoiceSchema> & { 
  id: string; 
  createdAt: Date;
  updatedAt: Date;
};

export type InvoiceJob = z.infer<typeof invoiceJobSchema> & {
  id: string;
  createdAt: Date;
};
```

#### 3. Estrutura de Dados no Banco (Supabase)

```sql
-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice <-> Jobs relationship table
CREATE TABLE invoice_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(invoice_id, job_id) -- A job can only be in one invoice
);

-- Add configuration fields to clients table
ALTER TABLE clients ADD COLUMN invoice_frequency VARCHAR(20) DEFAULT 'monthly';
ALTER TABLE clients ADD COLUMN invoice_day_of_month INTEGER CHECK (invoice_day_of_month >= 1 AND invoice_day_of_month <= 31);
ALTER TABLE clients ADD COLUMN invoice_day_of_week INTEGER CHECK (invoice_day_of_week >= 0 AND invoice_day_of_week <= 6);
ALTER TABLE clients ADD COLUMN auto_generate_invoice BOOLEAN DEFAULT true;
ALTER TABLE clients ADD COLUMN invoice_notes TEXT;

-- Performance indexes
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_period ON invoices(period_start, period_end);
CREATE INDEX idx_invoice_jobs_invoice_id ON invoice_jobs(invoice_id);
CREATE INDEX idx_invoice_jobs_job_id ON invoice_jobs(job_id);
```

#### 4. Lógica de Geração de Invoice

**Automatic Generation Flow:**

1. **When a job is completed** (`status === "completed"`):
   - Check client configuration (`invoiceFrequency`)
   - If `per_job`: Create invoice immediately with only this job
   - If `weekly/biweekly/monthly`: Add job to a "draft" invoice for the current period, or create new one if it doesn't exist

2. **Period grouping process:**
   - Find "draft" invoice for the current period for the client
   - If it doesn't exist, create new invoice
   - Add job to invoice
   - Recalculate `subtotal` and `total`

3. **Scheduled generation** (for `weekly/monthly`):
   - Create function that runs periodically (cron job or scheduled function)
   - For each client with `autoGenerateInvoice = true`:
     - Check if there are completed unfactored jobs
     - If generation date has arrived (e.g., day 5 of the month), create invoice and close previous period

#### 5. Mudanças Necessárias no Código

**Arquivos a modificar:**

1. **`src/lib/schemas.ts`**:
   - Adicionar `InvoiceFrequencyEnum`
   - Adicionar campos de invoice no `clientSchema`
   - Criar `invoiceSchema` e `invoiceJobSchema`

2. **`src/services/api.ts`**:
   - Adicionar métodos CRUD para invoices:
     - `getInvoices(clientId?: string)`
     - `getInvoice(id: string)`
     - `createInvoice(invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">)`
     - `updateInvoice(id: string, updates: Partial<Invoice>)`
     - `deleteInvoice(id: string)`
     - `addJobToInvoice(invoiceId: string, jobId: string)`
     - `removeJobFromInvoice(invoiceId: string, jobId: string)`
     - `generateInvoiceForClient(clientId: string, periodStart: Date, periodEnd: Date)`
   - Modificar `updateJob` para verificar se job foi completado e gerar invoice se necessário

3. **`src/hooks/useInvoices.ts`** (NOVO):
   - `useInvoices(clientId?: string)`
   - `useInvoice(id: string)`
   - `useCreateInvoice()`
   - `useUpdateInvoice()`
   - `useDeleteInvoice()`
   - `useGenerateInvoice()`

4. **`src/components/clients/ClientDialog.tsx`**:
   - Adicionar campos de configuração de invoice no formulário

5. **`src/pages/Finance.tsx`** ou criar **`src/pages/Invoices.tsx`**:
   - Nova página para listar e gerenciar invoices
   - Visualizar invoices por cliente
   - Ver detalhes de cada invoice (jobs incluídos)

### Opção 2: Tabela Separada de Configuração de Invoice

**Vantagens:**
- ✅ Separação de responsabilidades
- ✅ Mais flexível para configurações complexas

**Desvantagens:**
- ❌ Mais complexo de implementar
- ❌ Overhead desnecessário para casos simples

**Quando usar:** Se você precisar de configurações muito complexas ou múltiplas regras de invoice por cliente.

## 🔄 Compatibilidade e Impacto

### ✅ O que NÃO quebra:
- Página Finance continua funcionando (baseada em jobs)
- Criação/edição de jobs continua igual
- Criação/edição de clientes continua igual (apenas adiciona campos opcionais)

### ⚠️ Mudanças necessárias:
- Migração de dados: Adicionar valores padrão para campos de invoice nos clientes existentes
- Atualizar tipos TypeScript
- Criar nova página/componente para gerenciar invoices

### 📊 Complexidade de Implementação

**Nível: BAIXO-MÉDIO** ✅

**Razões:**
- Mudanças são principalmente aditivas (adicionar campos, não modificar existentes)
- Lógica de geração pode ser implementada incrementalmente
- Código existente continua funcionando durante a implementação

## 🚀 Plano de Implementação Sugerido

### Fase 1: Preparação (1-2 horas)
1. Adicionar schemas de Invoice no `schemas.ts`
2. Adicionar campos de configuração no `clientSchema`
3. Atualizar tipos TypeScript

### Fase 2: Backend/Service (2-3 horas)
1. Adicionar métodos CRUD de invoices no `api.ts`
2. Implementar lógica de geração automática
3. Implementar função de agrupamento de jobs por período

### Fase 3: Frontend - Configuração (1-2 horas)
1. Adicionar campos de invoice no `ClientDialog.tsx`
2. Criar componente de seleção de frequência

### Fase 4: Frontend - Visualização (2-3 horas)
1. Criar página `Invoices.tsx`
2. Criar componente `InvoiceList.tsx`
3. Criar componente `InvoiceDetail.tsx` (mostra jobs incluídos)

### Fase 5: Integração (1-2 horas)
1. Conectar geração automática quando job é completado
2. Testar fluxo completo
3. Adicionar validações

**Tempo Total Estimado: 7-12 horas**

## 💡 Recomendações

1. **Começar simples**: Implementar primeiro `monthly` e `manual`, depois adicionar outras frequências
2. **Valores padrão**: Todos os clientes existentes recebem `invoiceFrequency: "monthly"` e `autoGenerateInvoice: true`
3. **Número de invoice**: Gerar automaticamente seguindo padrão `INV-YYYY-NNN` (ex: INV-2025-001)
4. **Data de vencimento**: Calcular automaticamente baseado em `issueDate + 30 dias` (ou configurável)
5. **Jobs não faturados**: Manter flag `isInvoiced` no Job ou verificar via `invoice_jobs` table

## ❓ Decisões a Tomar

1. **Taxa/Imposto**: Precisa calcular tax (VAT, etc.) ou sempre será 0?
2. **Múltiplas invoices por período**: Permitir ou sempre agrupar em uma única invoice?
3. **Edição de invoice fechada**: Permitir editar invoice com status `pending` ou `paid`?
4. **Cancelamento de job**: O que acontece se um job já incluído em invoice for cancelado?
5. **Exportação**: Precisa exportar invoices em PDF/Excel?

---

## ✅ Conclusão

**A implementação é TRANQUILA** porque:
- ✅ Mudanças são principalmente aditivas
- ✅ Não quebra código existente
- ✅ Pode ser implementada incrementalmente
- ✅ Estrutura atual suporta bem a adição de invoices

**Recomendação:** Seguir com **Opção 1** (configuração simples no Client) pois é a mais direta e atende a maioria dos casos de uso.
