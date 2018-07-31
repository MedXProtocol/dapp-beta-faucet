#! /bin/sh

NODE_ENV=development node_modules/.bin/netlify-lambda -c webpack.netlify.js serve src
