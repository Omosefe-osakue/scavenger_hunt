import prisma from '../db/client';

export async function submitPostIt(
  huntId: string,
  postItId: string,
  data: {
    textAnswer?: string;
    selectedOptionValue?: string;
    photoUrls?: string[];
    wasSkipped?: boolean;
  }
) {
  const hunt = await prisma.hunt.findUnique({
    where: { id: huntId },
    include: { progress: true },
  });

  if (!hunt) throw new Error('Hunt not found');
  if (hunt.status !== 'published') throw new Error('Hunt is not published');
  if (hunt.status === 'completed') throw new Error('Hunt is already completed');

  const postIt = await prisma.postIt.findUnique({
    where: { id: postItId },
    include: { options: true },
  });

  if (!postIt) throw new Error('Post-it not found');
  if (postIt.huntId !== huntId) throw new Error('Post-it does not belong to hunt');

  // Check if post-it is unlocked
  if (hunt.progress?.currentPostItId !== postItId) {
    // Check if already completed
    const existingSubmission = await prisma.submission.findFirst({
      where: { huntId, postItId },
    });
    if (!existingSubmission) {
      throw new Error('LOCKED');
    }
  }

  // Validation
  if (data.wasSkipped) {
    if (!postIt.allowsSkip) {
      throw new Error('SKIP_NOT_ALLOWED');
    }
  } else {
    // Check text answer if required
    if (postIt.correctAnswer) {
      if (!data.textAnswer) {
        throw new Error('WRONG_ANSWER');
      }
      const normalizedAnswer = data.textAnswer.trim().toLowerCase();
      const normalizedCorrect = postIt.correctAnswer.trim().toLowerCase();
      if (normalizedAnswer !== normalizedCorrect) {
        throw new Error('WRONG_ANSWER');
      }
    }

    // Check photo if required
    if (postIt.requiresPhoto) {
      if (!data.photoUrls || data.photoUrls.length === 0) {
        throw new Error('PHOTO_REQUIRED');
      }
    }

    // Check choice selection
    if (postIt.type === 'choice') {
      if (!data.selectedOptionValue) {
        throw new Error('INVALID_OPTION');
      }
      const option = postIt.options.find((opt) => opt.value === data.selectedOptionValue);
      if (!option) {
        throw new Error('INVALID_OPTION');
      }
    }
  }

  const isCorrect = data.wasSkipped || (postIt.correctAnswer ? 
    data.textAnswer?.trim().toLowerCase() === postIt.correctAnswer.trim().toLowerCase() : true);

  // Create submission
  const submission = await prisma.submission.create({
    data: {
      huntId,
      postItId,
      textAnswer: data.textAnswer,
      selectedOptionValue: data.selectedOptionValue,
      isCorrect,
      wasSkipped: data.wasSkipped || false,
      photos: data.photoUrls
        ? {
            create: data.photoUrls.map((url) => ({ photoUrl: url })),
          }
        : undefined,
    },
  });

  // Determine next post-it
  let nextPostItId: string | null = null;

  if (postIt.type === 'choice' && data.selectedOptionValue) {
    const option = postIt.options.find((opt) => opt.value === data.selectedOptionValue);
    if (option) {
      nextPostItId = option.nextPostItId;
    }
  } else if (postIt.nextPostItId) {
    nextPostItId = postIt.nextPostItId;
  } else {
    // Find next by position
    const nextPostIt = await prisma.postIt.findFirst({
      where: {
        huntId,
        position: { gt: postIt.position },
      },
      orderBy: { position: 'asc' },
    });
    if (nextPostIt) {
      nextPostItId = nextPostIt.id;
    }
  }

  const huntCompleted = !nextPostItId;

  // Update progress
  if (huntCompleted) {
    await prisma.hunt.update({
      where: { id: huntId },
      data: { status: 'completed' },
    });
    await prisma.huntProgress.update({
      where: { huntId },
      data: {
        currentPostItId: null,
        completedAt: new Date(),
      },
    });
  } else {
    await prisma.huntProgress.update({
      where: { huntId },
      data: {
        currentPostItId: nextPostItId,
        updatedAt: new Date(),
      },
    });
  }

  return {
    ok: true,
    isCorrect,
    wasSkipped: data.wasSkipped || false,
    nextPostItId,
    huntCompleted,
  };
}

