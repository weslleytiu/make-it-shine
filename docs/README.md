# Documentation

This folder contains reference docs and proposals for the CRM Antigravity project.

## Available documents

### [Invoice Process](./INVOICE_PROCESS.md)
Business process for creating and managing invoices: lifecycle, when invoices are created, which jobs are included, and user actions (draft → send → paid).

### [Invoice Implementation Proposal](./INVOICE_IMPLEMENTATION_PROPOSAL.md)
Technical proposal for the invoice system (not yet implemented): schema, client configuration, automatic generation logic, and implementation roadmap.

### [Supabase Setup](./SUPABASE_SETUP.md)
Setup guide for running the app with Supabase (environment variables, running the migration, troubleshooting).

### [supabase-migration.sql](./supabase-migration.sql)
SQL for the initial database schema (clients, professionals, jobs). Use when creating a new Supabase project.

### [add_invoices_migration.sql](./add_invoices_migration.sql)
SQL for invoice tables and client invoice configuration. Run after the initial schema. Already applied on the project.

## Other references

- [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) – Coding standards and project structure (in root)
- [README.md](../README.md) – Project overview (in root)
