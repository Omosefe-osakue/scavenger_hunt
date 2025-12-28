// Example seed script - run with: tsx src/seed.ts
import prisma from './db/client';
import { generateShortCode } from './lib/code-generator';
import { generateSlug } from './lib/slug-generator';

async function main() {
  console.log('🌱 Seeding database...');

  // Create a sample hunt
  const code = generateShortCode(6);
  const shareSlug = generateSlug(12);

  const hunt = await prisma.hunt.create({
    data: {
      code,
      shareSlug,
      giftedName: 'Alex',
      welcomeMessage: 'Welcome to your scavenger hunt! Have fun exploring!',
      status: 'draft',
      postIts: {
        create: [
          {
            position: 0,
            title: 'First Clue',
            prompt: 'What is the answer to life, the universe, and everything?',
            color: 'yellow',
            type: 'riddle',
            correctAnswer: '42',
            requiresPhoto: false,
            allowsSkip: false,
          },
          {
            position: 1,
            title: 'Photo Challenge',
            prompt: 'Take a photo of something beautiful!',
            color: 'blue',
            type: 'photo',
            requiresPhoto: true,
            allowsSkip: true,
          },
        ],
      },
    },
  });

  console.log(`✅ Created hunt: ${hunt.id}`);
  console.log(`   Code: ${hunt.code}`);
  console.log(`   Slug: ${hunt.shareSlug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

