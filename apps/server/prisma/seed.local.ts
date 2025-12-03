import { PrismaClient } from '@prisma/client';
import { areaEngine } from '../src/core/area.engine';
import { serviceManager } from '../src/services/service.manager'; // <--- Import du manager
import { GoogleService } from '../src/services/impl/google/google.service'; // <--- Import du service Google
import { TimerService } from '../src/services/impl/timer/timer.service';

const prisma = new PrismaClient();

async function main() {
  // Enregistrer les services dans le manager
  serviceManager.register(GoogleService);
  serviceManager.register(TimerService);

  const myEmail = 'matyslaguerre@gmail.com';

  const user = await prisma.user.findUnique({
    where: { email: myEmail },
    include: { accounts: true }
  });

  console.log('🌱 Resetting database...');
  await prisma.action.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.area.deleteMany();
  // await prisma.user.deleteMany();

  if (!user) throw new Error("Utilisateur non trouvé ! Connecte-toi via le front d'abord.");

  const googleAccount = user.accounts.find(a => a.provider === 'google');
  if (!googleAccount) {
    console.error("❌ Error: No Google account connected for the user. Please connect your Google account first.");
    process.exit(1);
  };

  console.log('🌱 Creating Gmail Test AREA...');

  const newArea = await prisma.area.create({
    data: {
      name: 'Test Gmail Auto',
      is_active: true,
      user_id: user.id,

      action: {
        create: {
          name: 'GMAIL_NEW_MAIL',
          parameters: { filter_subject: '' },
          state: {}
        }
      },

      reactions: {
        create: {
          name: 'GMAIL_SEND_EMAIL',
          parameters: {
            to: myEmail,
            subject: 'Alerte AREA : Nouveau mail de {{from}}',
            body: 'Tu as reçu un mail !\n\nSujet : {{subject}}\nAperçu : {{snippet}}\n\nLien : {{link}}'
          }
        }
      }
    },
    include: {
      action: true,
      reactions: true,
      user: { include: { accounts: true } }
    }
  });

  console.log('🚀 Starting AREA engine to process actions...')
  await areaEngine.processArea(newArea);
  console.log('✅ Init complete. AREA is set up and engine has processed the first check.');

  const updatedAction = await prisma.action.findUnique({
    where: { id: newArea.action?.id }
  });
  console.log("📝 État sauvegardé en BDD :", updatedAction?.state);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
