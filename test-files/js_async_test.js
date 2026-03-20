const express = require('express');
const app = express();

// TP1: Basic await taint propagation
app.get('/async1', async (req, res) => {
    const url = req.query.url;
    const response = await fetch(url);
    const data = await response.text();
    res.send(data);
});

// TP2: .then() callback taint propagation
app.get('/async2', (req, res) => {
    const url = req.query.url;
    fetch(url).then(response => {
        res.send(response);
    });
});

// TP3: Chained .then()
app.get('/async3', (req, res) => {
    const url = req.query.url;
    fetch(url)
        .then(r => r.json())
        .then(data => {
            res.send(data.name);
        });
});

// TP4: async/await with try/catch
app.get('/async4', async (req, res) => {
    try {
        const userInput = req.body.url;
        const resp = await fetch(userInput);
        const result = await resp.json();
        res.send(result);
    } catch (e) {
        res.status(500).send('error');
    }
});

// TN1: Await on non-tainted promise
app.get('/safe1', async (req, res) => {
    const data = await fetch('https://api.example.com/data');
    const result = await data.json();
    res.send(result);
});

// TN2: Promise.all with non-tainted promises
app.get('/safe2', async (req, res) => {
    const [a, b] = await Promise.all([
        fetch('https://api.example.com/a'),
        fetch('https://api.example.com/b')
    ]);
    res.send(a);
});

// TP5: Tainted data through Promise.resolve
app.get('/async5', (req, res) => {
    const userInput = req.query.data;
    Promise.resolve(userInput).then(val => {
        res.send(val);
    });
});

// TP6: async function returning tainted data (inter-procedural)
app.get('/async6', async (req, res) => {
    const userInput = req.query.search;
    async function fetchData(query) {
        const resp = await fetch('https://api.example.com/search?q=' + query);
        return await resp.text();
    }
    const result = await fetchData(userInput);
    res.send(result);
});

// TP7: Promise constructor with tainted data
app.get('/async7', (req, res) => {
    const userInput = req.query.cmd;
    new Promise((resolve) => {
        resolve(userInput);
    }).then(val => {
        res.send(val);
    });
});

// TP8: async IIFE with tainted data
app.get('/async8', (req, res) => {
    const userInput = req.query.name;
    (async () => {
        const result = await Promise.resolve(userInput);
        res.send(result);
    })();
});

// TN3: Hardcoded string through await (should NOT be flagged)
app.get('/safe3', async (req, res) => {
    const msg = await Promise.resolve('hello world');
    res.send(msg);
});

// TP9: Tainted in Promise.all
app.get('/async9', async (req, res) => {
    const url = req.query.url;
    const [result] = await Promise.all([fetch(url)]);
    const data = await result.text();
    res.send(data);
});

// TP10: .catch() doesn't break taint chain
app.get('/async10', (req, res) => {
    const url = req.query.url;
    fetch(url)
        .then(r => r.text())
        .catch(err => 'default')
        .then(data => {
            res.send(data);
        });
});
