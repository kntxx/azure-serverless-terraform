terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.116"
    }
  }
}
provider "azurerm" {
  features {}
}
data "azurerm_client_config" "current" {}
resource "azurerm_resource_group" "rg" {
  name     = "kntxx-cloud-project-rg"
  location = "East Asia"
}

resource "random_string" "random" {
  length  = 4
  special = false
  upper   = false
}

resource "azurerm_static_web_app" "web" {
  name = "kenta-frontend-app-${random_string.random.result}"
  location            = azurerm_resource_group.rg.location  
  resource_group_name = azurerm_resource_group.rg.name  
}

resource "azurerm_storage_account" "storage" {
  name                     = "kentafuncstore${random_string.random.result}"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_cosmosdb_account" "db" {
  name                = "kenta-cosmos-db-${random_string.random.result}"
  location            = "Korea Central"
  resource_group_name = azurerm_resource_group.rg.name
  offer_type          = "Standard"
  kind                = "MongoDB"

  free_tier_enabled = true

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = "Korea Central"
    failover_priority = 0
  }
}
resource "azurerm_cosmosdb_mongo_collection" "users" {
  name                = "users"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.db.name
  database_name       = azurerm_cosmosdb_mongo_database.db.name

  default_ttl_seconds = -1
  shard_key           = "email" 


  index {
    keys   = ["email"]
    unique = true
  }


  index {
    keys   = ["_id"]
    unique = true
  }
}



resource "azurerm_cosmosdb_mongo_database" "db" {
  name                = "visitors-data" 
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.db.name
}

resource "azurerm_cosmosdb_mongo_collection" "visitors" {
  name                = "visitors"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.db.name
  database_name       = azurerm_cosmosdb_mongo_database.db.name

  default_ttl_seconds = -1
  shard_key           = "id"

  index {
    keys   = ["_id"]
    unique = true
  }

}
resource "azurerm_service_plan" "plan" {
  name                = "kenta-func-plan"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "Y1"
}

# 1. Create the Key Vault (CLEAN - No inline access policies)
resource "azurerm_key_vault" "kv" {
  name                        = "kenta-kv-${random_string.random.result}"
  location                    = azurerm_resource_group.rg.location
  resource_group_name         = azurerm_resource_group.rg.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false

  sku_name = "standard"
}

# 2. Access Policy for YOU (Moved to separate resource)
# This fixes the conflict error.
resource "azurerm_key_vault_access_policy" "client_policy" {
  key_vault_id = azurerm_key_vault.kv.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azurerm_client_config.current.object_id

  secret_permissions = [
    "Set",
    "Get",
    "List",
    "Delete",
    "Purge",
    "Recover"
  ]
}



# 3. Upload the Secret
resource "azurerm_key_vault_secret" "cosmos_conn" {
  name         = "cosmos-db-connection-string"
  value        = azurerm_cosmosdb_account.db.primary_mongodb_connection_string
  key_vault_id = azurerm_key_vault.kv.id
  
  # Explicitly wait for YOUR policy to be created, otherwise you can't write the secret
  depends_on = [azurerm_key_vault_access_policy.client_policy] 
}

resource "azurerm_linux_function_app" "function_app" {
  name                = "kenta-serverless-app-${random_string.random.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  storage_account_name       = azurerm_storage_account.storage.name
  storage_account_access_key = azurerm_storage_account.storage.primary_access_key
  service_plan_id            = azurerm_service_plan.plan.id
# --- NEW: Give the Function App a System Assigned Identity ---
  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    "AzureWebJobsStorage"   = azurerm_storage_account.storage.primary_connection_string
    "COSMOS_CONNECTION_STR" = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.cosmos_conn.id})"
  }


  site_config {
    application_stack {
      node_version = "20"
    }
    cors {
      allowed_origins = [
        "https://${azurerm_static_web_app.web.default_host_name}",
        "https://portal.azure.com",
        "http://localhost:5173"
        ]
    }
  }
}

# 3. Give the Function App access to read secrets from Key Vault
resource "azurerm_key_vault_access_policy" "func_policy" {
  key_vault_id = azurerm_key_vault.kv.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_linux_function_app.function_app.identity[0].principal_id

  secret_permissions = [
    "Get",
  ]
}