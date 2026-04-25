// Azure API Management — Cosmos DB proxy with JWT validation, rate limiting,
// CORS, and Key Vault key injection.

param name string
param location string
param tags object
param publisherEmail string
param tenantId string
param aadClientId string
param cosmosAccountName string
param keyVaultName string
param appInsightsName string
param workspaceResourceId string
param allowedIpRanges array
param isProd bool

var skuName = isProd ? 'Standard' : 'Developer'

resource apim 'Microsoft.ApiManagement/service@2023-05-01-preview' = {
  name:     name
  location: location
  tags:     tags
  identity: { type: 'SystemAssigned' }
  sku:      { name: skuName, capacity: 1 }
  properties: {
    publisherName:           'Alshaya Group — Tech Strategy'
    publisherEmail:          publisherEmail
    publicNetworkAccess:     'Enabled'
    apiVersionConstraint:    { minApiVersion: '2021-08-01' }
    customProperties: {
      'Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Protocols.Tls10':  'false'
      'Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Protocols.Tls11':  'false'
      'Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Protocols.Ssl30':  'false'
      'Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Backend.Protocols.Tls10': 'false'
      'Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Backend.Protocols.Tls11': 'false'
    }
  }
}

resource cosmos 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' existing = { name: cosmosAccountName }

resource cosmosKeyNamedValue 'Microsoft.ApiManagement/service/namedValues@2023-05-01-preview' = {
  parent: apim
  name:   'cosmos-master-key'
  properties: {
    displayName: 'cosmos-master-key'
    secret:      true
    keyVault: {
      secretIdentifier: 'https://${keyVaultName}${az.environment().suffixes.keyvaultDns}/secrets/cosmos-primary-key'
      identityClientId: null
    }
  }
}

resource api 'Microsoft.ApiManagement/service/apis@2023-05-01-preview' = {
  parent: apim
  name:   'aic-api'
  properties: {
    displayName:          'AIC Portal API'
    path:                 'aic/v1'
    protocols:            [ 'https' ]
    serviceUrl:           cosmos.properties.documentEndpoint
    subscriptionRequired: true
    apiType:              'http'
  }
}

// Inbound policy: JWT validation, role check, rate limit, CORS, Cosmos auth header
resource apiPolicy 'Microsoft.ApiManagement/service/apis/policies@2023-05-01-preview' = {
  parent: api
  name:   'policy'
  properties: {
    format: 'rawxml'
    value: '''
<policies>
  <inbound>
    <base />
    <cors allow-credentials="true">
      <allowed-origins>
        <origin>https://*.azurestaticapps.net</origin>
        <origin>http://localhost:3000</origin>
      </allowed-origins>
      <allowed-methods><method>GET</method><method>POST</method><method>PUT</method><method>PATCH</method><method>DELETE</method><method>OPTIONS</method></allowed-methods>
      <allowed-headers><header>*</header></allowed-headers>
      <expose-headers><header>X-Request-ID</header><header>ETag</header></expose-headers>
    </cors>

    <validate-jwt header-name="Authorization" failed-validation-httpcode="401" failed-validation-error-message="Invalid or expired token" require-expiration-time="true" require-scheme="Bearer">
      <openid-config url="https://login.microsoftonline.com/${tenantId}/.well-known/openid-configuration" />
      <required-claims>
        <claim name="aud" match="any"><value>api://${aadClientId}/AIC.ReadWrite</value><value>${aadClientId}</value></claim>
        <claim name="roles" match="any">
          <value>Platform_Admin</value>
          <value>Investment_Committee</value>
          <value>Strategy_Reviewer</value>
          <value>Initiative_Submitter</value>
          <value>Portfolio_Viewer</value>
        </claim>
      </required-claims>
    </validate-jwt>

    <rate-limit-by-key calls="300" renewal-period="60" counter-key="@(context.Request.Headers.GetValueOrDefault(""Authorization"",""anon"").Split('.').Length > 2 ? context.Request.Headers.GetValueOrDefault(""Authorization"","""").Substring(0,32) : context.Request.IpAddress)" />

    <set-header name="x-ms-date" exists-action="override">
      <value>@(DateTime.UtcNow.ToString("R"))</value>
    </set-header>
    <set-header name="x-ms-version" exists-action="override">
      <value>2018-12-31</value>
    </set-header>
    <set-header name="Authorization" exists-action="override">
      <value>{{cosmos-master-key}}</value>
    </set-header>
  </inbound>

  <backend><base /></backend>

  <outbound>
    <base />
    <set-header name="x-ms-cosmos-keys" exists-action="delete" />
    <set-header name="x-ms-cosmos-quorum" exists-action="delete" />
    <set-header name="X-Frame-Options" exists-action="override"><value>DENY</value></set-header>
    <set-header name="Strict-Transport-Security" exists-action="override"><value>max-age=31536000; includeSubDomains; preload</value></set-header>
  </outbound>

  <on-error>
    <base />
    <set-header name="X-Error-ID" exists-action="override"><value>@(context.RequestId)</value></set-header>
  </on-error>
</policies>
'''
  }
  dependsOn: [ cosmosKeyNamedValue ]
}

resource ai 'Microsoft.Insights/components@2020-02-02' existing = { name: appInsightsName }

resource logger 'Microsoft.ApiManagement/service/loggers@2023-05-01-preview' = {
  parent: apim
  name:   'app-insights-logger'
  properties: {
    loggerType:  'applicationInsights'
    description: 'Send all APIM requests to App Insights'
    credentials: { instrumentationKey: ai.properties.InstrumentationKey }
    isBuffered: true
    resourceId: ai.id
  }
}

resource diag 'Microsoft.ApiManagement/service/diagnostics@2023-05-01-preview' = {
  parent: apim
  name:   'applicationinsights'
  properties: {
    alwaysLog:    'allErrors'
    loggerId:     logger.id
    sampling:     { samplingType: 'fixed', percentage: 100 }
    frontend:     { request: { headers: [ 'Content-Type', 'X-Request-ID' ] }, response: { headers: [ 'Content-Type' ] } }
    backend:      { request: { headers: [ 'Content-Type' ] }, response: { headers: [ 'Content-Type' ] } }
    httpCorrelationProtocol: 'W3C'
    verbosity:    'information'
    logClientIp:  true
  }
}

resource diagWorkspace 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  scope: apim
  name:  'apim-diag'
  properties: {
    workspaceId: workspaceResourceId
    logs: [
      { category: 'GatewayLogs',         enabled: true }
      { category: 'WebSocketConnectionLogs', enabled: true }
    ]
    metrics: [ { category: 'AllMetrics', enabled: true } ]
  }
}

output name        string = apim.name
output resourceId  string = apim.id
output gatewayUrl  string = apim.properties.gatewayUrl
output principalId string = apim.identity.principalId
