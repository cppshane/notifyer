chrome.runtime.onInstalled.addListener(function() {
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            var opt = {
                iconUrl: "img/logo48.png",
                type: 'basic',
                title: 'Speech Detected in ' + request.platform,
                message: 'Word: ' + request.item,
                priority: 1
              };
              chrome.notifications.create('', opt, function() {  });

            return true;
        });
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostEquals: 'meet.google.com'},
            })
            ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
        });
  });
