function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var accountModel = args.account;
var reportList   = args.reportList || {};
var siteModel = args.site;
var refreshIntervalInMs = 45000;

$.countdown.init(parseInt(refreshIntervalInMs / 1000));

var piwikLiveVisitors = Alloy.createCollection('piwikLiveVisitors');

if (OS_IOS) {
    $.pullToRefresh.init($.liveTable);
}

function doOpenVisitor(event)
{
    if (!event || !event.rowData || !event.rowData.visitor) {
        return;
    }

    var params  = {visitor: event.rowData.visitor};
    var visitor = Alloy.createController('visitor', params);
    visitor.open();
}

function render(account, counter30Min, counter24Hours, visitorDetails)
{
    $.countdown.start();
    showReportContent();

    var rows = [];

    counter30Min.title = String.format(L('Live_LastMinutes'), '30');
    var last30minutes = Alloy.createController('livecounter', counter30Min);
    rows.push(last30minutes.getView());

    counter24Hours.title = String.format(L('Live_LastHours'), '24');
    var last24hours = Alloy.createController('livecounter', counter24Hours);
    rows.push(last24hours.getView());

    _.forEach(visitorDetails, function (visitorDetail) {
        var params = {account: account, visitor: visitorDetail};
        var visitorOverview = Alloy.createController('visitoroverview', params);
        var visitorRow = visitorOverview.getView()
        visitorRow.visitor = visitorDetail;
        rows.push(visitorRow);
        visitorRow = null;
    });

    $.liveTable.setData(rows);
    rows = null;
}

function doChooseReport()
{
    reportList.open();
}

function showReportContent()
{
    if (OS_IOS) {
        $.pullToRefresh.refreshDone();
    } 

    $.loadingindicator.hide();
}

function showLoadingMessage()
{
    if (OS_IOS) {
        $.pullToRefresh.refresh();
    } 

    $.loadingindicator.show();
    $.countdown.stop();
}

function onFetchError()
{
    console.log('error fetching data');
}

function doRefresh()
{
    showLoadingMessage();
    piwikLiveVisitors.fetchVisitors(accountModel, siteModel.id, render, onFetchError);
}

exports.refresh = doRefresh;