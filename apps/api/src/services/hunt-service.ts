import prisma from '../db/client';
import { generateShortCode } from '../lib/code-generator';
import { generateSlug } from '../lib/slug-generator';

export async function createHunt(data: { giftedName: string; welcomeMessage: string }) {
  let code: string;
  let shareSlug: string;
  let isUnique = false;

  // Generate unique code
  while (!isUnique) {
    code = generateShortCode(6);
    const existing = await prisma.hunt.findUnique({ where: { code } });
    if (!existing) isUnique = true;
  }

  isUnique = false;
  // Generate unique slug
  while (!isUnique) {
    shareSlug = generateSlug(12);
    const existing = await prisma.hunt.findUnique({ where: { shareSlug } });
    if (!existing) isUnique = true;
  }

  const hunt = await prisma.hunt.create({
    data: {
      code: code!,
      shareSlug: shareSlug!,
      giftedName: data.giftedName,
      welcomeMessage: data.welcomeMessage,
    },
  });

  // Create initial progress
  await prisma.huntProgress.create({
    data: {
      huntId: hunt.id,
    },
  });

  return hunt;
}

export async function publishHunt(huntId: string) {
  const hunt = await prisma.hunt.findUnique({
    where: { id: huntId },
    include: { postIts: { orderBy: { position: 'asc' } } },
  });

  if (!hunt) throw new Error('Hunt not found');

  if (hunt.postIts.length === 0) {
    throw new Error('Cannot publish hunt with no post-its');
  }

  // Find first post-it (lowest position)
  const firstPostIt = hunt.postIts[0];
  
  // Update progress
  await prisma.huntProgress.update({
    where: { huntId },
    data: {
      currentPostItId: firstPostIt.id,
    },
  });

  const updatedHunt = await prisma.hunt.update({
    where: { id: huntId },
    data: {
      status: 'published',
      publishedAt: new Date(),
    },
  });

  const shareUrl = `${process.env.PUBLIC_WEB_BASE_URL}/h/${updatedHunt.shareSlug}`;

  return {
    ...updatedHunt,
    shareUrl,
  };
}

export async function getHuntById(huntId: string) {
  return prisma.hunt.findUnique({
    where: { id: huntId },
    include: {
      postIts: {
        orderBy: { position: 'asc' },
        include: { options: { orderBy: { label: 'asc' } } },
      },
    },
  });
}

export async function getHuntByCode(code: string) {
  return prisma.hunt.findUnique({
    where: { code },
  });
}

export async function getHuntBySlug(shareSlug: string) {
  return prisma.hunt.findUnique({
    where: { shareSlug },
  });
}

export async function updateHunt(huntId: string, data: { giftedName?: string; welcomeMessage?: string }) {
  return prisma.hunt.update({
    where: { id: huntId },
    data,
  });
}

