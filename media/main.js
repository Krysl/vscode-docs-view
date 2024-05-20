//@ts-check

(function () {
    const vscode = acquireVsCodeApi();

    const main = document.getElementById('main');

    // const startingState = vscode.getState();

    // if (startingState) {
    //     if (startingState.body) {
    //         updateContent(startingState.body);
    //     } else if (startingState.noContent) {
    //         setNoContent(startingState.noContent);
    //     }
    // }
    function getColors() {
        vscode.postMessage(Object.values(document.getElementsByTagName('html')[0].style).map(
            (rv) => {
                return {
                    [rv]: document
                        .getElementsByTagName('html')[0]
                        .style.getPropertyValue(rv),
                };
            }
        ));
    }

    getColors();

    let hasUpdated = false;

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'update':
                {
                    updateContent(message.body);
                    hasUpdated = true;
                    break;
                }
            case 'noContent':
                {
                    if (!hasUpdated || message.updateMode === 'live') {
                        setNoContent(message.body);
                    }
                    hasUpdated = true;
                    break;
                }
            case 'getColors':
                {
                    getColors();
                    break;
                }
        }
    });

    /**
     * @param {string} contents
     */
    function updateContent(contents) {
        main.innerHTML = contents;
        // vscode.setState({ body: contents });
    }

    /**
     * @param {string} message
     */
    function setNoContent(message) {
        main.innerHTML = `<p class="no-content">${message}</p>`;
        // vscode.setState({ noContent: message });
    }
}());
