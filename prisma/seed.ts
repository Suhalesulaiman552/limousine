import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Vehicles
  const camry = await prisma.vehicle.create({
    data: { plateNumber: 'A-12345', model: 'Toyota Camry' },
  });
  const corolla = await prisma.vehicle.create({
    data: { plateNumber: 'B-67890', model: 'Toyota Corolla' },
  });

  // Create Drivers
  const mariyam = await prisma.driver.create({
    data: { name: 'Mariyam', vehicles: { connect: { id: camry.id } } },
  });
  const jaona = await prisma.driver.create({
    data: { name: 'Jaona', vehicles: { connect: { id: corolla.id } } },
  });

  // Create Users (Manager & Drivers)
  await prisma.user.create({
    data: { username: 'mother', password: 'admin123', role: 'MANAGER' },
  });
  await prisma.user.create({
    data: { username: 'mariyam', password: 'driver123', role: 'DRIVER', driverId: mariyam.id },
  });
  await prisma.user.create({
    data: { username: 'jaona', password: 'driver123', role: 'DRIVER', driverId: jaona.id },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });