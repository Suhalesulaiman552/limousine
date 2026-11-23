const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const password = process.env.OWNER_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error('Owner password must be at least 12 characters.');
  }

  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.findUnique({
      where: { name: 'suhail' },
    });

    if (!user) {
      throw new Error('Existing owner account not found.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('Owner account updated successfully.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});