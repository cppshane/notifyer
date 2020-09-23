let compareItems = [];
let currentWordItems = [];

var docObserver = new MutationObserver(function (mutations, me) {
    var divItems = document.getElementsByClassName('CNusmb');

    newWordItems = [];
    itemsChanged = false;
    indexer = 0;

    for (let divItem of divItems) {
        let content = divItem.innerHTML.replace(/[^\w\s]/gi, '').toLowerCase();
        
        for (let contentItem of content.split(' ')) {
            if (currentWordItems[indexer] === null || currentWordItems[indexer] !== content)
                itemsChanged = true;

            newWordItems.push(contentItem);
            indexer++;
        }
    }

    if (itemsChanged) {
        for (let [index, currentCCItem] of currentWordItems.entries()) {
            if (!newWordItems.includes(currentCCItem)) {
                currentWordItems.splice(index, 1);
            }
        }

        for (let newCCItem of newWordItems) {
            if (compareItems.includes(newCCItem) && !currentWordItems.includes(newCCItem)) {
                chrome.extension.sendMessage({ platform: 'Google Meet', item: newCCItem }, function(response) { });
                currentWordItems.push(newCCItem);
            }
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

        for (let wordItem of request.WordItems) {
            if (wordItem.state === '') {
                resultList.push(wordItem.content.toLowerCase());
            }
        }

        compareItems = resultList;

        sendResponse();

        return true;
    });

chrome.storage.sync.get(['WordItems'], 
    function(result) {
        let resultList = [];

        for (let wordItem of result.WordItems) {
            if (wordItem.state === '') {
                resultList.push(wordItem.content);
            }
        }

        compareItems = resultList;

        return true;
    });