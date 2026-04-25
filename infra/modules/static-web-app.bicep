// Azure Static Web App — hosts SPA, AAD auth, env config injected at build
param name string
param location string
param tags object
param aadClientId string
param apimUrl string
param appInsightsConnectionString string

resource swa 'Microsoft.Web/staticSites@2023-12-01' = {
  name:     name
  location: location
  tags:     tags
  sku: { name: 'Standard', tier: 'Standard' }
  properties: {
    repositoryUrl:  ''
    branch:         'main'
    buildProperties: {
      appLocation:        '/'
      apiLocation:        ''
      outputLocation:     ''
      skipGithubActionWorkflowGeneration: true
    }
    stagingEnvironmentPolicy:  'Enabled'
    allowConfigFileUpdates:    true
    provider:                  'GitHub'
    enterpriseGradeCdnStatus:  'Enabled'
  }
}

resource appSettings 'Microsoft.Web/staticSites/config@2023-12-01' = {
  parent: swa
  name:   'appsettings'
  properties: {
    AZURE_CLIENT_ID:                          aadClientId
    APIM_BASE_URL:                            apimUrl
    APPLICATIONINSIGHTS_CONNECTION_STRING:    appInsightsConnectionString
    AIC_PORTAL_VERSION:                       '2.1.0'
  }
}

output name             string = swa.name
output defaultHostname  string = swa.properties.defaultHostname
output id               string = swa.id
