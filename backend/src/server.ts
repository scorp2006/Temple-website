import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { startHoldReleaseJob } from './jobs/releaseExpiredHolds';

async function main() {
  const app = createApp();

  // Start the auto-release background job for expired holds.
  startHoldReleaseJob();

  const server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`🛕  Temple API listening on http://localhost:${env.port}`);
    // eslint-disable-next-line no-console
    console.log(`   Health: http://localhost:${env.port}/api/health`);
    // eslint-disable-next-line no-console
    console.log(`   Payments mode: ${env.paymentsMode}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    // eslint-disable-next-line no-console
    console.log('\nShutting down...');
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error:', err);
  process.exit(1);
});
