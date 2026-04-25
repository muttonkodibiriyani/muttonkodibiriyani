// Application Insights — workspace-based for browser + APIM telemetry
param name string
param location string
param tags object
param workspaceResourceId string

resource ai 'Microsoft.Insights/components@2020-02-02' = {
  name:     name
  location: location
  tags:     tags
  kind:     'web'
  properties: {
    Application_Type: 'web'
    Flow_Type:        'Bluefield'
    WorkspaceResourceId: workspaceResourceId
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery:     'Enabled'
    DisableLocalAuth: true
  }
}

output id                  string = ai.id
output name                string = ai.name
output instrumentationKey  string = ai.properties.InstrumentationKey
output connectionString    string = ai.properties.ConnectionString
