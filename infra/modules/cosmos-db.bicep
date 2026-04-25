// Cosmos DB SQL API — 10 containers with correct partition keys
// Geo-redundant in production. Master key stored in Key Vault — never sent to browser.

param accountName string
param databaseName string
param location string
param secondaryLocation string
param isProd bool
param tags object
param keyVaultName string
param workspaceResourceId string

var locations = isProd ? [
  { locationName: location,          failoverPriority: 0, isZoneRedundant: true }
  { locationName: secondaryLocation, failoverPriority: 1, isZoneRedundant: true }
] : [
  { locationName: location, failoverPriority: 0, isZoneRedundant: false }
]

resource cosmos 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name:     accountName
  location: location
  tags:     tags
  kind:     'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType:    'Standard'
    enableAutomaticFailover:     isProd
    enableMultipleWriteLocations: false
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
      maxIntervalInSeconds:    5
      maxStalenessPrefix:      100
    }
    locations:                  locations
    publicNetworkAccess:        'Enabled'
    disableKeyBasedMetadataWriteAccess: false
    networkAclBypass:           'AzureServices'
    minimalTlsVersion:          'Tls12'
    backupPolicy: isProd ? {
      type: 'Continuous'
      continuousModeProperties: { tier: 'Continuous30Days' }
    } : {
      type: 'Periodic'
      periodicModeProperties: {
        backupIntervalInMinutes: 240
        backupRetentionIntervalInHours: 168
        backupStorageRedundancy: 'Local'
      }
    }
    capabilities: []
  }
}

resource db 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = {
  parent: cosmos
  name:   databaseName
  properties: {
    resource: { id: databaseName }
    options:  { autoscaleSettings: { maxThroughput: 4000 } }
  }
}

var containerSpecs = [
  { name: 'investment_briefs',     pk: '/domain',        ttl: -1 }
  { name: 'council_evaluations',   pk: '/initiativeId',  ttl: -1 }
  { name: 'shark_verdicts',        pk: '/initiativeId',  ttl: -1 }
  { name: 'measurement_plans',     pk: '/initiativeId',  ttl: -1 }
  { name: 'stage_gates',           pk: '/initiativeId',  ttl: -1 }
  { name: 'benefits_actuals',      pk: '/initiativeId',  ttl: -1 }
  { name: 'portfolio_snapshots',   pk: '/snapshotDate',  ttl: 7776000 }   // 90 days
  { name: 'market_intelligence',   pk: '/domain',        ttl: -1 }
  { name: 'audit_log',             pk: '/sessionId',     ttl: 7776000 }   // 90 days, PDPL
  { name: 'portal_users',          pk: '/role',          ttl: -1 }
]

resource containers 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = [for c in containerSpecs: {
  parent: db
  name:   c.name
  properties: {
    resource: {
      id: c.name
      partitionKey: {
        paths: [ c.pk ]
        kind: 'Hash'
        version: 2
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic:    true
        includedPaths: [ { path: '/*' } ]
        excludedPaths: [ { path: '/"_etag"/?' } ]
      }
      defaultTtl: c.ttl
      uniqueKeyPolicy: c.name == 'portal_users' ? {
        uniqueKeys: [ { paths: [ '/email' ] } ]
      } : null
    }
  }
}]

// Stash the primary master key in Key Vault — APIM reads it from here.
resource kv 'Microsoft.KeyVault/vaults@2023-07-01' existing = { name: keyVaultName }
resource cosmosKeySecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: kv
  name:   'cosmos-primary-key'
  properties: {
    value:       cosmos.listKeys().primaryMasterKey
    contentType: 'cosmos-master-key'
  }
}

resource diag 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  scope: cosmos
  name:  'cosmos-diag'
  properties: {
    workspaceId: workspaceResourceId
    logs: [
      { category: 'DataPlaneRequests',     enabled: true }
      { category: 'QueryRuntimeStatistics', enabled: true }
      { category: 'PartitionKeyStatistics', enabled: true }
      { category: 'ControlPlaneRequests',  enabled: true }
    ]
    metrics: [ { category: 'Requests', enabled: true } ]
  }
}

output accountName string = cosmos.name
output resourceId  string = cosmos.id
output endpoint    string = cosmos.properties.documentEndpoint
