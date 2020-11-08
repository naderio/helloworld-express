process.env.INSTANCE_ID =
  process.env.INSTANCE_ID || `${process.env.INSTANCE_ROLE}-${process.env.NODE_APP_INSTANCE || '0'}`;
