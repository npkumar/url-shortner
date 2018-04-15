## url-shortner
Uses google API to convert long urls from an xlsx file to short urls 

### Usage
1. Get a valid Google API Key
2. Clone the repository and do `npm install`

```
$ node index.js -h
  Usage: index
    [options]
    Converts long URLs to short URLs
    
  Options:

    -k, --API_KEY <n>   Google API KEY
    -f, --filename <n>  Path to XLSX file to convert
    -h, --help          output usage information
```

For example, do `node index.js -k <APIKEY> -f <filename.xlsx>`
