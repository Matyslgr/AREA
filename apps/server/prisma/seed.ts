import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Resetting database...');
  await prisma.action.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.area.deleteMany();
  // await prisma.user.deleteMany();

  console.log('🌱 Creating Test User...');
  const user = await prisma.user.upsert({
    where: { email: 'dev@area.com' },
    update: {},
    create: {
      email: 'tester@area.com',
      username: 'Tester',
      password: 'hashed_password',
    },
  });

  console.log('🌱 Creating Interpolation Test AREA...');
  await prisma.area.create({
    data: {
      name: 'Timer Clean Test',
      is_active: true,
      user_id: user.id,

      action: {
        create: {
          name: 'TIMER_EVERY_X_MINUTES',
          parameters: { interval: 0.1 }, // 0.1 min = 6 secondes (pour tester vite)
          state: {} // État vide au début
        }
      },

      reactions: {
        create: {
          name: 'TIMER_LOG', // L'ID de la réaction
          parameters: {
            message: "Action déclenchée le {{date}} à {{time}}."
          }
        }
      }
    }
  });

  console.log('✅ Seed finished.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());