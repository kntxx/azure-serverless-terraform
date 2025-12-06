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

resource "azurerm_linux_function_app" "function_app" {
  name                = "kenta-serverless-app-${random_string.random.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  storage_account_name       = azurerm_storage_account.storage.name
  storage_account_access_key = azurerm_storage_account.storage.primary_access_key
  service_plan_id            = azurerm_service_plan.plan.id


  app_settings = {
    "AzureWebJobsStorage"   = azurerm_storage_account.storage.primary_connection_string
    "COSMOS_CONNECTION_STR" = azurerm_cosmosdb_account.db.primary_mongodb_connection_string
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