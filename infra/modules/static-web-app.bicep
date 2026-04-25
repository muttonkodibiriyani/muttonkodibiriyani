param name string
param location string
param aadClientId string
param apimGatewayUrl string
param appInsightsConnectionString string
param tags object
resource swa 'Microsoft.Web/staticSites@2023-12-01' = { name:name location:location tags:tags sku:{ name:'Standard' tier:'Standard' } properties:{ repositoryUrl:'' branch:'main' buildProperties:{ appLocation:'/' outputLocation:'/' apiLocation:'' } } }
output defaultHostname string = swa.properties.defaultHostname
