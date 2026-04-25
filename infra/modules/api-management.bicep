param name string
param location string
param tenantId string
param aadClientId string
param keyVaultName string
param cosmosEndpoint string
param appInsightsInstrumentationKey string
param allowedIpRanges array = []
param tags object
resource apim 'Microsoft.ApiManagement/service@2023-09-01-preview' = { name:name location:location tags:tags sku:{ name:'Developer' capacity:1 } identity:{ type:'SystemAssigned' } properties:{ publisherEmail:'aic-support@alshaya.com' publisherName:'Alshaya Group' virtualNetworkType:'None' } }
resource logger 'Microsoft.ApiManagement/service/loggers@2023-09-01-preview' = { parent:apim name:'appinsights' properties:{ loggerType:'applicationInsights' credentials:{ instrumentationKey:appInsightsInstrumentationKey } } }
resource api 'Microsoft.ApiManagement/service/apis@2023-09-01-preview' = { parent:apim name:'aic-v1' properties:{ path:'aic/v1' protocols:['https'] displayName:'AIC Portal API' subscriptionRequired:false serviceUrl:cosmosEndpoint } }
resource policy 'Microsoft.ApiManagement/service/apis/policies@2023-09-01-preview' = { parent:api name:'policy' properties:{ format:'rawxml' value:'<policies><inbound><cors allow-credentials="true"><allowed-origins><origin>https://*.azurestaticapps.net</origin><origin>http://localhost:3000</origin></allowed-origins><allowed-methods><method>*</method></allowed-methods><allowed-headers><header>*</header></allowed-headers></cors><rate-limit-by-key calls="300" renewal-period="60" counter-key="@(context.Principal?.Claims.GetValueOrDefault(&quot;sub&quot;,&quot;anonymous&quot;))" /><validate-jwt header-name="Authorization" failed-validation-httpcode="401"><openid-config url="https://login.microsoftonline.com/${tenantId}/v2.0/.well-known/openid-configuration" /><audiences><audience>api://${aadClientId}/AIC.ReadWrite</audience></audiences><issuers><issuer>https://login.microsoftonline.com/${tenantId}/v2.0</issuer></issuers><required-claims><claim name="roles" match="any"><value>Platform_Admin</value><value>Investment_Committee</value><value>Strategy_Reviewer</value><value>Initiative_Submitter</value><value>Portfolio_Viewer</value></claim></required-claims></validate-jwt><set-header name="x-ms-date" exists-action="override"><value>@(DateTime.UtcNow.ToString(&quot;r&quot;))</value></set-header><base /></inbound><backend><base /></backend><outbound><set-header name="x-ms-request-charge" exists-action="delete" /><set-header name="x-ms-activity-id" exists-action="delete" /><base /></outbound><on-error><base /></on-error></policies>' } }
output gatewayUrl string = apim.properties.gatewayUrl
output id string = apim.id
