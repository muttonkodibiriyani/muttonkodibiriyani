param actionGroupName string
param location string
param alertEmail string
param appInsightsId string
param cosmosAccountId string
param apimId string
param tags object
resource ag 'Microsoft.Insights/actionGroups@2023-01-01' = { name:actionGroupName location:'global' tags:tags properties:{ groupShortName:'aicops' enabled:true emailReceivers:[{ name:'ops' emailAddress:alertEmail useCommonAlertSchema:true }] } }
resource ex 'Microsoft.Insights/metricAlerts@2018-03-01' = { name:'aic-exceptions' location:'global' tags:tags properties:{ enabled:true severity:2 scopes:[appInsightsId] evaluationFrequency:'PT5M' windowSize:'PT5M' criteria:{ 'odata.type':'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria' allOf:[{ name:'exceptions' metricName:'exceptions/count' operator:'GreaterThan' threshold:5 timeAggregation:'Count' criterionType:'StaticThresholdCriterion' }] } actions:[{ actionGroupId:ag.id }] } }
