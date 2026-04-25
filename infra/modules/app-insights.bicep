param name string
param location string
param workspaceId string
param tags object
resource ai 'Microsoft.Insights/components@2020-02-02' = { name:name location:location tags:tags kind:'web' properties:{ Application_Type:'web' WorkspaceResourceId:workspaceId IngestionMode:'LogAnalytics' } }
output id string = ai.id
output instrumentationKey string = ai.properties.InstrumentationKey
output connectionString string = ai.properties.ConnectionString
