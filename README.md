# Azure Serverless Microservices Architecture

![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen) ![Terraform](https://img.shields.io/badge/IaC-Terraform-purple) ![Azure](https://img.shields.io/badge/Cloud-Azure-blue)

## 📖 Project Overview
This project demonstrates a fully serverless web application architecture deployed on **Microsoft Azure**. The primary goal was to architect a scalable, cost-effective solution using **Infrastructure as Code (IaC)** principles.

While the application features a functional frontend (React) and backend (Node.js), the focus of this repository is the **automated infrastructure provisioning, security integration, and CI/CD pipelines.**

## 🏗️ Architecture
<p align="center">
  <img width="2848" height="1504" alt="architecture-login" src="https://github.com/user-attachments/assets/01ed7929-3f88-45e2-a049-1089cccee7c9" />

</p>

The infrastructure is designed around a Microservices pattern using Azure Serverless technologies:

* **Frontend:** Hosted on **Azure Static Web Apps** for global distribution and low latency.
* **Backend:** Event-driven microservices running on **Azure Functions** (Linux Consumption Plan) to handle API requests (Login, Register, Visitor Counter).
* **Database:** **Azure Cosmos DB** (Mongo API) for a schemaless, horizontally scalable database layer.
* **Security:** **Azure Key Vault** to manage secrets, connection strings, and API keys, ensuring zero hard-coded secrets in the codebase.
* **Observability:** **Application Insights** for distributed tracing, logging, and performance monitoring.

## 🛠️ Tech Stack & DevOps Tools

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Cloud Provider** | Microsoft Azure | Hosting and PaaS services |
| **Infrastructure as Code** | Terraform | Provisioning Resource Groups, App Service Plans, DBs, and Vaults |
| **CI/CD** | GitHub Actions | Automated build, test, and deployment pipelines |
| **Backend Runtime** | Node.js v20 | Serverless function execution |
| **Database** | Azure Cosmos DB | NoSQL data storage (Sharded by ID/Email) |
| **Monitoring** | Application Insights | Real-time telemetry and failure analysis |

## 🚀 Infrastructure as Code (Terraform)
The entire Azure environment is defined in HCL (HashiCorp Configuration Language).

**Key Infrastructure Highlights:**
* **State Management:** Terraform state is managed remotely using Azure Storage to support team collaboration and prevent state locking issues.
* **Modular Design:** Resources are defined logically (Networking, Compute, Database, Security).
* **Dependency Management:** Explicit `depends_on` clauses ensure resources like Key Vault are provisioned before the Function App attempts to read secrets.

**Provisioned Resources:**
1.  **Resource Group:** Logical container for isolation.
2.  **Cosmos DB Account:** Configured with Session Consistency and Free Tier optimizations.
3.  **App Service Plan:** Y1 Linux Consumption plan for auto-scaling.
4.  **Key Vault:** Centralized secret management.

## 🔄 CI/CD Pipeline (GitHub Actions)
The project utilizes GitHub Actions for continuous delivery. The pipeline consists of two main workflows:

1.  **Infrastructure Pipeline:**
    * `terraform fmt` and `validate` to ensure code quality.
    * `terraform plan` to generate an execution plan.
    * `terraform apply` (manual trigger or on merge to main) to provision resources.

2.  **Application Pipeline:**
    * Builds the React Frontend.
    * Builds the Node.js Functions.
    * Deploys artifacts to Azure Static Web Apps and Azure Function App respectively.

## 🔐 Security & Best Practices
* **Zero Trust Secrets:** The Function App retrieves the Cosmos DB connection string directly from **Azure Key Vault** via system-assigned Managed Identity. No secrets exist in `local.settings.json` or Git.
* **Sharding Strategy:** The Cosmos DB collections use `email` (Users) and `id` (Visitors) as partition keys to optimize for read/write heavy workloads.
* **CORS Policies:** Strict CORS rules configured on the Function App to only allow requests from the Static Web App domain.

## 📉 Observability
**Application Insights** is integrated into the backend to provide:
* Live Metrics Stream.
* Failure analysis for 4xx/5xx errors.
* End-to-end transaction tracing from Frontend -> Function -> Database.

