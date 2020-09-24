let wordItems = [];

document.getElementById('submit-container').addEventListener('click', function() {
    let newWordContent = document.getElementById('submit-input').value;

    if (addWordItem(newWordContent))
        document.getElementById('submit-input').value = '';
});

document.getElementById('submit-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        let newWordContent = document.getElementById('submit-input').value;

        if (addWordItem(newWordContent))
            document.getElementById('submit-input').value = '';
    }
});

function generateList() {
    chrome.storage.sync.get(['WordItems'], function(result) {
        wordItems = result.WordItems;
        
        if (wordItems)
            for (let wordItem of wordItems)
                addItemToList(wordItem);
    });
};

function addItemToList(wordItem) {
    let liNode = document.createElement('li');
    liNode.setAttribute('class', 'hvr-sweep-to-right');

    let checkImgNode = document.createElement('img');
    checkImgNode.setAttribute('class', 'check-image ' + wordItem.state);
    checkImgNode.setAttribute('src', 'img/check.png');

    let deleteContainerDivNode = document.createElement('div');
    deleteContainerDivNode.setAttribute('class', 'delete-container');

    let deleteImgNode = document.createElement('img');
    deleteImgNode.setAttribute('src', 'img/delete.png');

    let pNode = document.createElement('p');
    pNode.innerHTML = wordItem.content;

    deleteContainerDivNode.appendChild(deleteImgNode);
    deleteContainerDivNode.addEventListener('click', function() {
        removeWordItem(wordItem.content);
    });

    liNode.addEventListener('click', function() {
        if (wordItem.state === '')
            wordItem.state = 'hidden';
        else
            wordItem.state = '';

        checkImgNode.setAttribute('class', 'check-image ' + wordItem.state);

        // Update storage
        chrome.storage.sync.set({WordItems: wordItems}, function() { });

        // Update content scripts
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {WordItems: wordItems}, function(response) {});  
        });
    });

    liNode.appendChild(checkImgNode);
    liNode.appendChild(deleteContainerDivNode);
    liNode.appendChild(pNode);

    document.getElementById('word-list-container').children[0].appendChild(liNode);
}

function removeItemFromList(wordItemContent) {
    let contentElements = document.getElementsByTagName('p');

    for (let element of contentElements) {
        if (element.innerHTML === wordItemContent) {
            element.parentElement.remove();
        }
    }
}

function addWordItem(wordItemContent) {
    if (wordItems)
        for (let wordItem of wordItems)
            if (wordItem.content === wordItemContent)
                return;

    let newWordItem = {state: '', content: wordItemContent};

    // Add to local list
    if (!wordItems)
        wordItems = [];
    wordItems.push(newWordItem);

    // Add to UI list
    addItemToList(newWordItem);

    // Update storage
    chrome.storage.sync.set({WordItems: wordItems}, function() { });

    // Update content scripts
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {WordItems: wordItems}, function(response) {});  
    });

    return true;
}

function removeWordItem(wordItemContent) {
    for (let [index, item] of wordItems.entries()) {
        if (wordItemContent === item.content) {

            // Remove from local list
            wordItems.splice(index, 1);

            // Remove from UI list
            removeItemFromList(wordItemContent);

            // Update storage
            chrome.storage.sync.set({WordItems: wordItems}, function() { });
            
            // Update content scripts
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {WordItems: wordItems}, function(response) {});  
            });

            return;
        }
    }
}

generateList();