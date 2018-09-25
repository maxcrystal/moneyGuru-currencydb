/**
 * Fetches today fiat and crypto currency rates from coinAPI.io
 * and populates moneyGuru currency.db
 */

const https = require('https');
const moment = require('moment');
const sqlite3 = require('sqlite3').verbose();
const config = require('./config');


const options = {
  'method': 'GET',
  'hostname': 'rest.coinapi.io',
  'path': `/v1/exchangerate/CAD?filter_asset_id=${config.currencies}`,
  'headers': {'X-CoinAPI-Key': config.apiKey}
};


const insert = data => {
  const db = new sqlite3.Database(config.dbPath, err => {
    if (err) console.log(err);
  });
  for (const currency of data.rates) {
    db.run(
      `INSERT INTO rates (date, currency, rate) VALUES (?, ?, ?)`,
      [moment(new Date()).format('YYYYMMDD'), currency.asset_id_quote, 1 / currency.rate]
    );
  }
  db.close();
};

const request = https.request(options, response => {
  const chunks = [];
  response.on('data', chunk => {
    chunks.push(chunk);
  });
  response.on('end', () => {
    const data = JSON.parse(chunks.toString('utf-8'));
    insert(data);
  })
});

request.end();
