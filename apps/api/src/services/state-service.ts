import prisma from '../db/client';

export async function getHuntState(huntId: string) {
  const hunt = await prisma.hunt.findUnique({
    where: { id: huntId },
    include: {
      postIts: {
        orderBy: { position: 'asc' },
        include: { options: true },
      },
      progress: true,
      submissions: {
        include: { photos: true },
      },
    },
  });

  if (!hunt) throw new Error('Hunt not found');

  const currentPostItId = hunt.progress?.currentPostItId;
  const completedPostItIds = new Set(hunt.submissions.map((s) => s.postItId));

  const postIts = hunt.postIts.map((postIt: any) => {
    const completed = completedPostItIds.has(postIt.id);
    const isTimeLocked = postIt.unlockAt && new Date(postIt.unlockAt) > new Date();
    const locked = !completed && (postIt.id !== currentPostItId || isTimeLocked);

    return {
      id: postIt.id,
      position: postIt.position,
      title: postIt.title,
      prompt: postIt.prompt,
      color: postIt.color,
      type: postIt.type,
      correctAnswer: postIt.correctAnswer,
      requiresPhoto: postIt.requiresPhoto,
      allowsSkip: postIt.allowsSkip,
      options: postIt.options,
      unlockAt: postIt.unlockAt,
      locked,
      completed,
      isTimeLocked,
    };
  });

  const completedCount = completedPostItIds.size;
  const totalCount = hunt.postIts.length;

  return {
    huntId: hunt.id,
    giftedName: hunt.giftedName,
    welcomeMessage: hunt.welcomeMessage,
    status: hunt.status,
    progress: {
      completedCount,
      totalCount,
      currentPostItId: currentPostItId || null,
      completedAt: hunt.progress?.completedAt || null,
    },
    postIts,
  };
}

