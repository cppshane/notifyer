let compareItems = [];
let currentWordItems = new Map();

var docObserver = new MutationObserver(function (mutations, me) {
    CCWordFreq = [];
    newWordItems = [];
    itemsChanged = false;
    indexer = 0;

    let divItems = document.getElementsByClassName('CNusmb');
    for (let divItem of divItems) {
        let CCWords = divItem.innerHTML.replace(/[^\w\s]/gi, '').toLowerCase().split(' ');
        console.log(CCWords);
        for (let CCWord of CCWords) {
            if (CCWordFreq[CCWord])
                CCWordFreq[CCWord]++;
            else
                CCWordFreq[CCWord] = 1;
        }
    }

    for (let compareItem of compareItems) {
        if (CCWordFreq[compareItem]) {
            if (!currentWordItems[compareItem] || CCWordFreq[compareItem] > currentWordItems[compareItem])
                chrome.extension.sendMessage({ platform: 'Google Meet', item: compareItem }, function(response) { return true; });

            currentWordItems[compareItem] = CCWordFreq[compareItem];
        }
    }
});

docObserver.observe(document, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        let resultList = [];

        for (let wordItem of request.WordItems)
            if (wordItem.state === '')
                resultList.push(wordItem.content.toLowerCase());

        compareItems = resultList;
        
        return true;
    });

chrome.storage.sync.get(['WordItems'], 
    function(result) {
        let resultList = [];

        for (let wordItem of result.WordItems)
            if (wordItem.state === '')
                resultList.push(wordItem.content);

        compareItems = resultList;

        return true;
    });