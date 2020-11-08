import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

dotenv.config({
  path: `.env.${process.env.NODE_ENV}.local`,
});

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});

dotenv.config({
  path: '.env.local',
});

dotenv.config({
  path: '.env',
});

process.env.MIGRATE =
  process.env.INSTANCE_ROLE === 'core' || process.env.INSTANCE_ROLE === 'all' ? process.env.MIGRATE || 'safe' : 'safe';
