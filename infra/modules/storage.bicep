// Storage account — audit log blob exports
param name string
param location string
param tags object
param workspaceResourceId string

resource sa 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name:     name
  location: location
  tags:     tags
  sku:  { name: 'Standard_GRS' }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess:    false
    allowSharedKeyAccess:     false
    minimumTlsVersion:        'TLS1_2'
    supportsHttpsTrafficOnly: true
    publicNetworkAccess:      'Enabled'
    networkAcls: { defaultAction: 'Allow', bypass: 'AzureServices' }
    encryption: {
      services: {
        blob: { enabled: true }
        file: { enabled: true }
      }
      keySource: 'Microsoft.Storage'
    }
  }
}

resource blobSvc 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: sa
  name:   'default'
  properties: {
    deleteRetentionPolicy:          { enabled: true, days: 90 }
    containerDeleteRetentionPolicy: { enabled: true, days: 90 }
  }
}

resource auditContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobSvc
  name:   'audit-exports'
  properties: { publicAccess: 'None' }
}

resource diag 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  scope: sa
  name:  'audit'
  properties: {
    workspaceId: workspaceResourceId
    metrics: [ { category: 'Transaction', enabled: true } ]
  }
}

output id   string = sa.id
output name string = sa.name
