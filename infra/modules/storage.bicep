param name string
param location string
param tags object
resource st 'Microsoft.Storage/storageAccounts@2023-01-01' = { name:name location:location tags:tags sku:{ name:'Standard_GRS' } kind:'StorageV2' properties:{ allowBlobPublicAccess:false minimumTlsVersion:'TLS1_2' supportsHttpsTrafficOnly:true } }
resource audit 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = { name:'${st.name}/default/audit-exports' properties:{ publicAccess:'None' } }
output id string = st.id
