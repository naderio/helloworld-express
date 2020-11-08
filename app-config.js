import glob from 'glob';

function normalize(file) {
  return file.replace(/^src\//, '~/').replace(/\.js$/, '');
}

export const MODEL_FILES = [...new Set([...glob.sync('src/**/*.model.js')])].map(normalize);

export const API_FILES = [...new Set([...glob.sync('src/**/*.api.js')])].map(normalize);

export const GRAPHQL_FILES = [...new Set([...glob.sync('src/**/*.graphql.js')])].map(normalize);

export const JOB_FILES = [...new Set([...glob.sync('src/**/*.job.js')])].map(normalize);

export const JOB_RUN_FILES = [
  ...new Set([
    ...(process.env.TARGET_JOBS || 'src/**/*.job.js')
      .split(',')
      .reduce((acc, item) => [...acc, ...(item.indexOf('*') !== -1 ? glob.sync(item) : [item])], []),
  ]),
].map(normalize);

export const BOOTSTRAP_FILES = [...new Set([...glob.sync('src/**/*.bootstrap.js')])].map(normalize);

export const SEED_FILES = [...new Set(['src/module/auth/auth.seed.js', ...glob.sync('src/**/*.seed.js')])].map(
  normalize,
);
