// =============================================================================
// Alshaya Investment Council (AIC) — Root deployment (subscription scope)
// Deploys: RG, Log Analytics, App Insights, Key Vault, Storage,
//          Cosmos DB, API Management, Static Web App, Monitor alerts
// =============================================================================

targetScope = 'subscription'

@description('Deployment environment (production | staging | development)')
@allowed([ 'production', 'staging', 'development' ])
param environment string = 'production'

@description('Primary Azure region')
param location string = 'uaenorth'

@description('Secondary region for Cosmos DB geo-redundancy')
param secondaryLocation string = 'uaecentral'

@description('Short project identifier used in resource naming')
param projectName string = 'aic'

@description('Microsoft Entra (Azure AD) tenant ID')
param tenantId string

@description('Azure AD app registration client ID for the SWA + APIM JWT audience')
param aadClientId string

@description('Email address for Monitor alerts')
param alertEmail string

@description('Optional list of CIDR ranges allowed through APIM')
param allowedIpRanges array = []

@description('Common resource tags')
param tags object = {
  project:     'AlshayaInvestmentCouncil'
  environment: environment
  costCenter:  'TechStrategy'
  dataClass:   'INTERNAL-CONFIDENTIAL'
  deployedBy:  'GitHub-Actions'
}

// -----------------------------------------------------------------------------
// Naming
// -----------------------------------------------------------------------------
var suffix      = uniqueString(subscription().id, projectName, environment)
var shortSuffix = substring(suffix, 0, 6)
var rgName      = 'rg-${projectName}-${environment}'
var isProd      = environment == 'production'

var names = {
  staticWebApp:  'swa-${projectName}-${environment}'
  cosmosAccount: 'cosmos-${projectName}-${environment}-${shortSuffix}'
  cosmosDb:      'aic-portal'
  keyVault:      'kv-${projectName}-${shortSuffix}'
  apim:          'apim-${projectName}-${environment}'
  logAnalytics:  'log-${projectName}-${environment}'
  appInsights:   'ai-${projectName}-${environment}'
  storage:       'st${projectName}${shortSuffix}'
  actionGroup:   'ag-${projectName}-${environment}'
}

// -----------------------------------------------------------------------------
// Resource Group
// -----------------------------------------------------------------------------
resource rg 'Microsoft.Resources/resourceGroups@2023-07-01' = {
  name:     rgName
  location: location
  tags:     tags
}

// -----------------------------------------------------------------------------
// Modules
// -----------------------------------------------------------------------------
module logAnalytics 'modules/log-analytics.bicep' = {
  name:  'logAnalytics'
  scope: rg
  params: {
    name:     names.logAnalytics
    location: location
    tags:     tags
  }
}

module appInsights 'modules/app-insights.bicep' = {
  name:  'appInsights'
  scope: rg
  params: {
    name:               names.appInsights
    location:           location
    tags:               tags
    workspaceResourceId: logAnalytics.outputs.id
  }
}

module keyVault 'modules/key-vault.bicep' = {
  name:  'keyVault'
  scope: rg
  params: {
    name:     names.keyVault
    location: location
    tenantId: tenantId
    tags:     tags
  }
}

module storage 'modules/storage.bicep' = {
  name:  'storage'
  scope: rg
  params: {
    name:     names.storage
    location: location
    tags:     tags
    workspaceResourceId: logAnalytics.outputs.id
  }
}

module cosmosDb 'modules/cosmos-db.bicep' = {
  name:  'cosmosDb'
  scope: rg
  params: {
    accountName:       names.cosmosAccount
    databaseName:      names.cosmosDb
    location:          location
    secondaryLocation: secondaryLocation
    isProd:            isProd
    tags:              tags
    keyVaultName:      keyVault.outputs.name
    workspaceResourceId: logAnalytics.outputs.id
  }
  dependsOn: [ keyVault ]
}

module apim 'modules/api-management.bicep' = {
  name:  'apim'
  scope: rg
  params: {
    name:                names.apim
    location:            location
    tags:                tags
    publisherEmail:      alertEmail
    tenantId:            tenantId
    aadClientId:         aadClientId
    cosmosAccountName:   cosmosDb.outputs.accountName
    keyVaultName:        keyVault.outputs.name
    appInsightsName:     appInsights.outputs.name
    workspaceResourceId: logAnalytics.outputs.id
    allowedIpRanges:     allowedIpRanges
    isProd:              isProd
  }
  dependsOn: [ cosmosDb, keyVault, appInsights ]
}

module staticWebApp 'modules/static-web-app.bicep' = {
  name:  'staticWebApp'
  scope: rg
  params: {
    name:        names.staticWebApp
    location:    location
    tags:        tags
    aadClientId: aadClientId
    apimUrl:     apim.outputs.gatewayUrl
    appInsightsConnectionString: appInsights.outputs.connectionString
  }
  dependsOn: [ apim, appInsights ]
}

module alerts 'modules/alerts.bicep' = if (isProd) {
  name:  'alerts'
  scope: rg
  params: {
    actionGroupName:  names.actionGroup
    location:         location
    alertEmail:       alertEmail
    apimResourceId:   apim.outputs.resourceId
    cosmosResourceId: cosmosDb.outputs.resourceId
    appInsightsId:    appInsights.outputs.id
    tags:             tags
  }
}

// -----------------------------------------------------------------------------
// Outputs
// -----------------------------------------------------------------------------
output resourceGroupName     string = rg.name
output staticWebAppUrl       string = staticWebApp.outputs.defaultHostname
output staticWebAppName      string = staticWebApp.outputs.name
output cosmosAccountName     string = cosmosDb.outputs.accountName
output apimGatewayUrl        string = apim.outputs.gatewayUrl
output apimName              string = apim.outputs.name
output keyVaultUri           string = keyVault.outputs.uri
output appInsightsConnString string = appInsights.outputs.connectionString
output appInsightsAppId      string = appInsights.outputs.id
