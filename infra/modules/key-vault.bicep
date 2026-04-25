param name string
param location string
param tenantId string
param tags object
resource kv 'Microsoft.KeyVault/vaults@2023-07-01' = { name:name location:location tags:tags properties:{ tenantId:tenantId sku:{ family:'A' name:'premium' } enableRbacAuthorization:true enablePurgeProtection:true enableSoftDelete:true publicNetworkAccess:'Disabled' } }
output vaultUri string = kv.properties.vaultUri
output name string = kv.name
