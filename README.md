
# dns-map

`dns-map`是一个包装过的`dns服务器`，通过设置`proxy`可以将特定请求映射到远程服务器，以便可以方便的进行`线上调试`

## Install

    npm install dns-map -g

## Usage

    [sudo] dns-map --config ./config.json

*注：dns要使用53端口，需要权限才可开启*

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
