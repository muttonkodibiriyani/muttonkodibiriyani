targetScope = 'subscription'
param environment string = 'production'
param location string = 'uaenorth'
param secondaryLocation string = 'uaecentral'
param projectName string = 'aic'
param tenantId string
param aadClientId string
param alertEmail string
param allowedIpRanges array = []
param tags object = { project: 'AlshayaInvestmentCouncil' environment: environment costCenter: 'TechStrategy' dataClass: 'INTERNAL-CONFIDENTIAL' deployedBy: 'GitHub-Actions' }
var suffix = uniqueString(subscription().id, projectName, environment)
var shortSuffix = substring(suffix, 0, 6)
var rgName = 'rg-${projectName}-${environment}'
var isProd = environment == 'production'
var names = { staticWebApp:'swa-${projectName}-${environment}' cosmosAccount:'cosmos-${projectName}-${environment}-${shortSuffix}' cosmosDb:'aic-portal' keyVault:'kv-${projectName}-${shortSuffix}' apim:'apim-${projectName}-${environment}' logAnalytics:'log-${projectName}-${environment}' appInsights:'ai-${projectName}-${environment}' storage:'st${projectName}${shortSuffix}' actionGroup:'ag-${projectName}-${environment}' }
resource rg 'Microsoft.Resources/resourceGroups@2023-07-01' = { name: rgName location: location tags: tags }
module logAnalytics 'modules/log-analytics.bicep' = { name:'logAnalytics' scope:rg params:{ name:names.logAnalytics location:location tags:tags } }
module appInsights 'modules/app-insights.bicep' = { name:'appInsights' scope:rg params:{ name:names.appInsights location:location workspaceId:logAnalytics.outputs.workspaceId tags:tags } }
module keyVault 'modules/key-vault.bicep' = { name:'keyVault' scope:rg params:{ name:names.keyVault location:location tenantId:tenantId tags:tags } }
module storage 'modules/storage.bicep' = { name:'storage' scope:rg params:{ name:names.storage location:location tags:tags } }
module cosmosDb 'modules/cosmos-db.bicep' = { name:'cosmosDb' scope:rg params:{ accountName:names.cosmosAccount databaseName:names.cosmosDb location:location secondaryLocation:secondaryLocation keyVaultName:names.keyVault tags:tags } dependsOn:[keyVault] }
module apim 'modules/api-management.bicep' = { name:'apim' scope:rg params:{ name:names.apim location:location tenantId:tenantId aadClientId:aadClientId keyVaultName:names.keyVault cosmosEndpoint:cosmosDb.outputs.endpoint appInsightsInstrumentationKey:appInsights.outputs.instrumentationKey allowedIpRanges:allowedIpRanges tags:tags } }
module staticWebApp 'modules/static-web-app.bicep' = { name:'staticWebApp' scope:rg params:{ name:names.staticWebApp location:location aadClientId:aadClientId apimGatewayUrl:apim.outputs.gatewayUrl appInsightsConnectionString:appInsights.outputs.connectionString tags:tags } }
module alerts 'modules/alerts.bicep' = if (isProd) { name:'alerts' scope:rg params:{ actionGroupName:names.actionGroup location:location alertEmail:alertEmail appInsightsId:appInsights.outputs.id cosmosAccountId:cosmosDb.outputs.id apimId:apim.outputs.id tags:tags } }
output resourceGroupName string = rg.name
output staticWebAppUrl string = staticWebApp.outputs.defaultHostname
output cosmosAccountName string = names.cosmosAccount
output apimGatewayUrl string = apim.outputs.gatewayUrl
output keyVaultUri string = keyVault.outputs.vaultUri
output appInsightsConnStr string = appInsights.outputs.connectionString
