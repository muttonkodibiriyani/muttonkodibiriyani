using '../main.bicep'

param environment       = 'staging'
param location          = 'uaenorth'
param secondaryLocation = 'uaecentral'
param projectName       = 'aic'
param tenantId          = readEnvironmentVariable('AZURE_TENANT_ID', '00000000-0000-0000-0000-000000000000')
param aadClientId       = readEnvironmentVariable('AZURE_CLIENT_ID', '00000000-0000-0000-0000-000000000000')
param alertEmail        = 'aic-alerts@alshaya.com'
param allowedIpRanges   = []
param tags = {
  project:     'AlshayaInvestmentCouncil'
  environment: 'staging'
  costCenter:  'TechStrategy'
  dataClass:   'INTERNAL-CONFIDENTIAL'
  deployedBy:  'GitHub-Actions'
}
