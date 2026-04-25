param name string
param location string
param tags object
resource ws 'Microsoft.OperationalInsights/workspaces@2023-09-01' = { name:name location:location tags:tags properties:{ retentionInDays:90 sku:{ name:'PerGB2018' } } }
output workspaceId string = ws.id
