const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const existing = await prisma.user.findUnique({ where: { id: 'test-user' } });
    if (existing) {
      console.log('User already exists');
      return;
    }
    await prisma.user.create({
      data: { id: 'test-user', email: 'test-user@example.com', name: 'Test User' }
    });
    console.log('Test user created');
  } catch (e) {
    console.error('Error creating test user', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
