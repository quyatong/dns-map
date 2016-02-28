# dns-map

## Install

    npm install dns-map -g

## Usage

    [sudo] dns-map --config ./config.json

## Example

`config.json`

    {
        "records": [
            {
                "name": "static",
                "domain": "xxx.com",
                "proxy": {
                    "port": 80,
                    "map": {
                        "/a": "http://static.example.com/a"
                    }
                },
                "A": []
            },
            {
                "name": "wap",
                "domain": "xxx.com",
                "A": []
            }
        ]
    }
