const hashToTest = 'Qmaisz6NMhDB51cCvNWa1GMS7LU1pAxdF4Ld6Ft9kZEP2a'
const hashString = 'Hello from IPFS Gateway Checker'
let hashToLink = hashToTest;
if (window.location.search && window.location.search.split("?").length > 1) {
    hashToLink = window.location.search.split("?")[1];
}
setTitle(hashToLink);

const $results = document.querySelector('#results')

function returnHtmlLink(gateway) {
    let gatewayTitle = gateway.split(hashToTest)[0]
    return '<a title="' + gatewayTitle + '" href="' + gateway + '">' + gateway + '</a>'
}

function addNode(gateway, online, status, roundtripInMs) {
    const gatewayAndHash = gateway.replace(':hash', hashToLink)
    const para = document.createElement('div')
    let node
    if (online) {
        node = document.createElement('strong')
        node.innerHTML = '✅ - Online : ' + returnHtmlLink(gatewayAndHash)
        node.innerHTML += ' (' + roundtripInMs + 'ms)'
        // now warm up the cache...
        fetch(gatewayAndHash);
    } else {
        node = document.createElement('div')
        node.innerText = '❌ - Offline - ' + gatewayAndHash
    }
    node.setAttribute('title', status)
    para.appendChild(node)
    $results.appendChild(para)
}

function updateStats(total, checked) {
    document.getElementById('stats').innerText = checked + '/' + total + ' gateways checked'
}

function setTitle(hash) {
    document.getElementById('title').innerText = "Public IPFS Gateways for " + hash;
}

function checkGateways(gateways) {
    const total = gateways.length
    let checked = 0
    gateways.forEach((gateway) => {
        const gatewayAndHash = gateway.replace(':hash', hashToTest)
        // opt-out from gateway redirects done by browser extension
        const testUrl = gatewayAndHash + '#x-ipfs-companion-no-redirect'
        const start = performance.now()
        fetch(testUrl)
            .then(res => res.text())
            .then((text) => {
                const matched = text.trim() === hashString.trim()
                const status = matched ? 'All good' : 'Output did not match expected output'
                const ms = performance.now() - start
                addNode(gateway, matched, status, ms);
                checked++
                updateStats(total, checked)
            }).catch((err) => {
                window.err = err
                addNode(gateway, false, err)
                checked++
                updateStats(total, checked)
            })
    })
}

fetch('./gateways.json')
    .then(res => res.json())
    .then(gateways => checkGateways(gateways))
