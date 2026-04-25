param accountName string
param databaseName string
param location string
param secondaryLocation string
param keyVaultName string
param tags object
resource account 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = { name:accountName location:location tags:tags kind:'GlobalDocumentDB' properties:{ databaseAccountOfferType:'Standard' publicNetworkAccess:'Disabled' locations:[{ locationName:location failoverPriority:0 isZoneRedundant:true },{ locationName:secondaryLocation failoverPriority:1 isZoneRedundant:false }] backupPolicy:{ type:'Continuous' continuousModeProperties:{ tier:'Continuous30Days' } } consistencyPolicy:{ defaultConsistencyLevel:'Session' } } }
resource db 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = { parent:account name:databaseName properties:{ resource:{ id:databaseName } } }
var containers=[{n:'investment_briefs',pk:'/domain',ttl:-1},{n:'council_evaluations',pk:'/initiativeId',ttl:-1},{n:'shark_verdicts',pk:'/initiativeId',ttl:-1},{n:'measurement_plans',pk:'/initiativeId',ttl:-1},{n:'stage_gates',pk:'/initiativeId',ttl:-1},{n:'benefits_actuals',pk:'/initiativeId',ttl:-1},{n:'portfolio_snapshots',pk:'/snapshotDate',ttl:7776000},{n:'market_intelligence',pk:'/domain',ttl:-1},{n:'audit_log',pk:'/sessionId',ttl:7776000},{n:'portal_users',pk:'/role',ttl:-1}]
resource c 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = [for x in containers: { parent:db name:x.n properties:{ resource:{ id:x.n defaultTtl:x.ttl partitionKey:{ paths:[x.pk] kind:'Hash' } uniqueKeyPolicy: x.n == 'portal_users' ? { uniqueKeys:[{ paths:['/email'] }] } : { uniqueKeys:[] } } } }]
resource kv 'Microsoft.KeyVault/vaults@2023-07-01' existing = { name:keyVaultName }
resource keySecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = { parent:kv name:'cosmos-primary-key' properties:{ value:account.listKeys().primaryMasterKey } }
output endpoint string = account.properties.documentEndpoint
output id string = account.id
