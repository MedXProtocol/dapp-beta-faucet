#! /bin/sh

NODE_ENV=production npm i && \
NODE_ENV=production node_modules/.bin/netlify-lambda -c webpack.netlify.js build src
