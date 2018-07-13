#!/usr/bin/env bash

apm install linter-gcc
cd "$HOME/.atom/packages/linter-gcc/lib"

curl -sLO "https://raw.githubusercontent.com/nrobinson2000/linter-po-util/master/lib/main.js"
curl -sLO "https://raw.githubusercontent.com/nrobinson2000/linter-po-util/master/lib/config.js"
curl -sLO "https://raw.githubusercontent.com/nrobinson2000/linter-po-util/master/lib/utility.js"


#
