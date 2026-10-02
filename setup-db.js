const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');
  
  try {
    await prisma.petrolTransaction.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.user.deleteMany();
  } catch (e) {
    console.log('Setting up fresh database tables...');
  }

  const managerPassword = await bcrypt.hash('admin123', 10);
  const driverPassword = await bcrypt.hash('driver123', 10);

  // 1. Manager (Mother)
  await prisma.user.create({
    data: { username: 'mother', passwordHash: managerPassword, role: 'MANAGER' },
  });

  // 2. Drivers
  const driverData = [
    { username: 'mariyam', name: 'Mariyam', phone: '+971501234567', vehicle: { name: 'Camry', plateNumber: 'FUJ-1111', type: 'Sedan' } },
    { username: 'jaona', name: 'Jaona', phone: '+971502345678', vehicle: { name: 'Corolla', plateNumber: 'FUJ-2222', type: 'Sedan' } },
    { username: 'aysha', name: 'Aysha', phone: '+971503456789', vehicle: { name: 'Kia Carnival', plateNumber: 'FUJ-3333', type: 'Van' } },
  ];

  for (const d of driverData) {
    const user = await prisma.user.create({
      data: { username: d.username, passwordHash: driverPassword, role: 'DRIVER' },
    });

    const driver = await prisma.driver.create({
      data: { userId: user.id, name: d.name, phone: d.phone, status: 'AVAILABLE' },
    });

    await prisma.vehicle.create({
      data: {
        name: d.vehicle.name,
        plateNumber: d.vehicle.plateNumber,
        type: d.vehicle.type,
        status: 'ACTIVE',
        driverId: driver.id,
      },
    });
  }

  console.log('✅ Database successfully created and seeded with your mother & drivers!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });