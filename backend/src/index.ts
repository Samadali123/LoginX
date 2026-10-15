import app from './app';
import { ENV } from './config/env';
import { getRSAKeyPair } from './config/keys';

// Initialize RSA in-transit encryption keypair on startup
getRSAKeyPair();

const PORT = ENV.PORT;

app.listen(PORT, () => {
  console.log(`backend app is working on port ${PORT}`);
});
