# Overview

This application is designed with robustness, modularity and salability in mind.

## Folder Structure

```
app
├── common
├── lib
├── shared
│   └── data
│   └── job
├── module
│   └── post
│       ├── post.api.js
│       ├── Post.model.js
│       ├── post.job.js
│       ├── post.script.js
│       ├── post.seed.js
│       ├── post.spec.js
│       ├── post.test.js
│       └── utils.js
└── test
    └── setup.js
```

- `src/common/` : contains shared configurations and utilities
- `src/shared/data/` : contains shared data models
- `src/shared/job/` : contains shared job
- `src/module/<MODULE>` contains data models, routes, jobs, tests, ... for a given module
- `src/test/` contains test utils and global tests

## Components

This application consists of th following components:

### Application Core (`app-core`)

A singular central component for initialisation and coordination.

- should run in a single instance

### Application API (`app-api`)

A scalable components for running API

- able to run on multiple instances behind load balancer

### Application Job (`app-job`)

A scalable components for running jobs

- able to run on multiple instances behind load balancer

### Application Console (`app-console`)

A console to access and communicate with other application components

## Data (DAL/ORM)

Data is managed by [waterline](http://waterlinejs.org/).

- a data models is defined in `*.model.js` file within a module or under `src/shared/data`
- every reference field must be prefixed with `_`

**References**

- [Waterline](http://waterlinejs.org/)
- [Waterline Repository](https://github.com/balderdashy/waterline) (check the code for proper documentation)
- [Sails/Waterline Docs](https://sailsjs.com/documentation/concepts/models-and-orm) ()
- [Sails/Waterline Reference](https://sailsjs.com/documentation/reference/waterline-orm)
- [sails-mongo ](https://github.com/balderdashy/sails-mongo)

## Jobs / Queues

Jobs are managed by [Bull](https://github.com/OptimalBits/bull)

- a job is defined in a `*.job.js` file within a module or under `src/shared/job`. it should export a `queue` instance, a `process` function
- a job runs within `app-job` component
- a job is initiated from any components using on of the following methods

  ```javascript
  import * as Job from '~/common/job';

  Job.queues.JOB_NAME.add({
    /* ... */
  });
  ```

  or

  ```javascript
  import * as JOB_NAME from './JOB_NAME.job';

  JOB_NAME.queue.add({
    /* ... */
  });
  ```

**References**

- [Bull](https://github.com/OptimalBits/bull)
- [Bull Guide](https://optimalbits.github.io/bull/)
- [Bull Reference](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md)
- [Bull Patterns](https://github.com/OptimalBits/bull/blob/master/PATTERNS.md)

## Testing

Both unit and integration testing use [Jest](https://jestjs.io/).

- a unit test suite id defined in a `*.test.js` file within a module
- an integration test suite id defined in a `*.spec.js` file within a module

**References**

- [Jest](https://jestjs.io/)
