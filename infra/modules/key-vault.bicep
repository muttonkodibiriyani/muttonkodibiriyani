// Premium Key Vault — RBAC, purge protection, soft delete
param name string
param location string
param tenantId string
param tags object

resource kv 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name:     name
  location: location
  tags:     tags
  properties: {
    tenantId: tenantId
    sku:      { family: 'A', name: 'premium' }
    enableRbacAuthorization:    true
    enablePurgeProtection:      true
    enableSoftDelete:           true
    softDeleteRetentionInDays:  90
    publicNetworkAccess:        'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
      bypass:        'AzureServices'
    }
  }
}

output id   string = kv.id
output name string = kv.name
output uri  string = kv.properties.vaultUri
