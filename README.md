# Hello World Backend (Node.js/Express)

![pipeline status](https://gitlab.com/helloworld-nt/helloworld-express/badges/master/pipeline.svg)
![coverage report](https://gitlab.com/helloworld-nt/helloworld-express/badges/master/coverage.svg)
![dependencies](https://img.shields.io/david/naderio/helloworld-express.svg)

A boilerplate for Node.js backend built with Express, Waterline, Bull, GraphQL, ...

## Requirements

- MongoDB v4
- Redis v4

## References

- [Documentation](./docs/)

## Features

- modular setup with some convention over configuration
  - `*.model.js` for data models
  - `*.seed.js` for data seed
  - `*.job.js` for Bull' job definition
  - `*.api.js` for express' routing
- manages data with Waterline
- auto-exposes Waterline schema as GraphQL
- enables temporary (backed by Redis) and permanent (backed by MongoDB) data key-value storage
- enables one-time and repetitive/cron jobs and managed by Bull
- ...

## Usage

```sh
# install dependencies
npm install

# format code
npm run format

# lint code
npm run lint

# generate docs (jsdoc, apib, postman) in `generated` folder
npm run docs
```

### Managing Database

```sh
# clear database
npm run data:clear

# seed database
npm run data:seed
```

### Running Application

```sh
# run all application components (core, api worker, and job runner)
npm run dev

## OR

# run application core
npm run dev:core

# run application api worker
npm run dev:api

# run application job runner
npm run dev:job

# run application console
npm run dev:console
```

### Testing

```sh
# run all tests
npm run test

# run unit tests
npm run test:unit

# run integration tests
npm run test:spec

# run unit tests for specific module
npm run test -- '/post/*.test.js'

# run integration tests for specific module
npm run test -- '/post/*.spec.js'

# run specific test
npm run test -- src/module/post/post.test.js
```
