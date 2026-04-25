// Monitor alert rules — APIM 5xx, Cosmos throttling, exception rate
param actionGroupName string
param location string = 'global'
param alertEmail string
param apimResourceId string
param cosmosResourceId string
param appInsightsId string
param tags object

resource ag 'Microsoft.Insights/actionGroups@2023-09-01-preview' = {
  name:     actionGroupName
  location: location
  tags:     tags
  properties: {
    groupShortName: 'AICAlerts'
    enabled: true
    emailReceivers: [
      { name: 'PrimaryOnCall', emailAddress: alertEmail, useCommonAlertSchema: true }
    ]
  }
}

resource apim5xx 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name:     'apim-5xx-rate'
  location: location
  tags:     tags
  properties: {
    severity: 1
    enabled:  true
    scopes: [ apimResourceId ]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [ {
        name: 'Backend5xx'
        metricName: 'Requests'
        metricNamespace: 'Microsoft.ApiManagement/service'
        operator: 'GreaterThan'
        threshold: 5
        timeAggregation: 'Total'
        dimensions: [ {
          name: 'BackendResponseCode'
          operator: 'Include'
          values: [ '500','502','503','504' ]
        } ]
        criterionType: 'StaticThresholdCriterion'
      } ]
    }
    actions: [ { actionGroupId: ag.id } ]
  }
}

resource cosmosThrottle 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name:     'cosmos-throttling'
  location: location
  tags:     tags
  properties: {
    severity: 2
    enabled:  true
    scopes: [ cosmosResourceId ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [ {
        name: 'TotalRequestUnits'
        metricName: 'TotalRequestUnits'
        metricNamespace: 'Microsoft.DocumentDB/databaseAccounts'
        operator: 'GreaterThan'
        threshold: 8000
        timeAggregation: 'Total'
        criterionType: 'StaticThresholdCriterion'
      } ]
    }
    actions: [ { actionGroupId: ag.id } ]
  }
}

resource exceptionAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name:     'app-insights-exceptions'
  location: location
  tags:     tags
  properties: {
    severity: 1
    enabled:  true
    scopes: [ appInsightsId ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [ {
        name: 'ExceptionCount'
        metricName: 'exceptions/count'
        metricNamespace: 'Microsoft.Insights/components'
        operator: 'GreaterThan'
        threshold: 10
        timeAggregation: 'Total'
        criterionType: 'StaticThresholdCriterion'
      } ]
    }
    actions: [ { actionGroupId: ag.id } ]
  }
}
