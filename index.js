
const XLSX = require('xlsx');
const axios = require('axios');
const Promise = require('bluebird');
const fs = require('fs');
const json2xls = require('json2xls');
const winston = require('winston');
const program = require('commander');

let apiKey;
let filename;
const converted = [];

const toJson = (workbook) => {
  const result = {};
  workbook.SheetNames.forEach((sheetName) => {
    const roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    if (roa.length > 0) {
      result[sheetName] = roa;
    }
  });
  return result;
};

const getShortURL = longUrl => axios.post(`https://www.googleapis.com/urlshortener/v1/url?key=${apiKey}`, { longUrl })
  .then((res) => {
    if (res.data) {
      return res.data.id;
    }
    return 'COULD NOT SHORTEN';
  })
  .catch((err) => {
    winston.error(err);
  });

const createExcel = (jsonArray) => {
  const xls = json2xls(jsonArray);
  fs.writeFileSync('output.xlsx', xls, 'binary');
};

function run() {
  const workbook = XLSX.readFile(filename);
  const jsonWorkbook = toJson(workbook).Sheet1;
  const urls = jsonWorkbook.map(entry => entry.URL);

  return Promise.try(() => urls)
    .mapSeries((url) => {
      winston.info(`Converting ${url}`);
      return Promise.all([url, Promise.delay(1500).then(() => getShortURL(url))]);
    })
    .map(([long, short]) => {
      converted.push({
        long,
        short,
      });
    })
    .then(() => {
      createExcel(converted);
      winston.info('Done!');
    });
}

program
  .usage(`
    [options]
    Converts long URLs to short URLs
  `)
  .option('-k, --API_KEY <n>', 'Google API KEY')
  .option('-f, --filename <n>', 'Path to XLSX file to convert')
  .parse(process.argv);

if (!program.API_KEY || !program.filename) {
  program.help();
  process.exit(1);
} else {
  apiKey = program.API_KEY;
  filename = program.filename;

  run();
}
