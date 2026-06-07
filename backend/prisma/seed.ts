import { seedDatabase } from '../src/seed';
import { prisma } from '../src/db';

const main = async () => {
  await seedDatabase();
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
