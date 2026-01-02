import prisma from '../db/client';

export async function submitPostIt(
  huntId: string,
  postItId: string,
  data: {
    textAnswer?: string;
    selectedOptionValue?: string;
    photoUrls?: string[];
    wasSkipped?: boolean;
    bypassCode?: string; // For time-sensitive post-its
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

  // Check if post-it is time-locked
  if (postIt.unlockAt && new Date(postIt.unlockAt) > new Date()) {
    // Check bypass code
    if (data.bypassCode !== 'safe') {
      return {
        ok: false,
        reason: 'TIME_LOCKED',
        unlockAt: postIt.unlockAt,
      };
    }
  }

  // Check if post-it is unlocked
  if (hunt.progress?.currentPostItId !== postItId) {
    // Check if already completed
    const existingSubmission = await prisma.submission.findFirst({
      where: { huntId, postItId, isCorrect: true },
    });
    if (!existingSubmission) {
      throw new Error('LOCKED');
    }
  }

  // Get existing submission to track hint attempts
  const existingSubmission = await prisma.submission.findFirst({
    where: { huntId, postItId },
    orderBy: { createdAt: 'desc' },
  });
  const hintAttempts = (existingSubmission?.hintAttempts || 0);

  // Validation
  if (data.wasSkipped) {
    if (!postIt.allowsSkip) {
      throw new Error('SKIP_NOT_ALLOWED');
    }
  } else {
    // Check text answer if required
    if (postIt.correctAnswer) {
      if (!data.textAnswer) {
        // Return hint instead of error
        return handleWrongAnswer(huntId, postItId, postIt, hintAttempts, null);
      }
      const normalizedAnswer = data.textAnswer.trim().toLowerCase();
      const normalizedCorrect = postIt.correctAnswer.trim().toLowerCase();
      if (normalizedAnswer !== normalizedCorrect) {
        // Return hint instead of error
        return handleWrongAnswer(huntId, postItId, postIt, hintAttempts, data.textAnswer);
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
      const option = postIt.options.find((opt: any) => opt.value === data.selectedOptionValue);
      if (!option) {
        throw new Error('INVALID_OPTION');
      }
    }
  }

  const isCorrect = data.wasSkipped || (postIt.correctAnswer ? 
    data.textAnswer?.trim().toLowerCase() === postIt.correctAnswer.trim().toLowerCase() : true);

  // Delete any existing incorrect submissions for this post-it
  if (existingSubmission && !existingSubmission.isCorrect) {
    try {
      await prisma.submission.delete({ where: { id: existingSubmission.id } } as any);
    } catch (e) {
      // Ignore if delete fails
    }
  }

  // Create submission
  const submission = await prisma.submission.create({
    data: {
      huntId,
      postItId,
      textAnswer: data.textAnswer,
      selectedOptionValue: data.selectedOptionValue,
      isCorrect,
      wasSkipped: data.wasSkipped || false,
      hintAttempts: 0, // Reset on correct answer
      bypassCode: data.bypassCode || null,
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
    const option = postIt.options.find((opt: any) => opt.value === data.selectedOptionValue);
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

  // Update progress - THIS IS CRITICAL FOR UNLOCKING
  if (huntCompleted) {
    await prisma.hunt.update({
      where: { id: huntId },
      data: { status: 'completed' },
    });
    // Ensure progress exists before updating
    const existingProgress = await prisma.huntProgress.findUnique({
      where: { huntId },
    });
    if (existingProgress) {
      await prisma.huntProgress.update({
        where: { huntId },
        data: {
          currentPostItId: null,
          completedAt: new Date(),
        },
      });
    } else {
      await prisma.huntProgress.create({
        data: {
          huntId,
          currentPostItId: null,
          completedAt: new Date(),
        },
      });
    }
  } else {
    // Update progress to unlock next post-it
    // Ensure progress exists before updating
    const existingProgress = await prisma.huntProgress.findUnique({
      where: { huntId },
    });
    if (existingProgress) {
      await prisma.huntProgress.update({
        where: { huntId },
        data: {
          currentPostItId: nextPostItId,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.huntProgress.create({
        data: {
          huntId,
          currentPostItId: nextPostItId,
        },
      });
    }
  }

  return {
    ok: true,
    isCorrect,
    wasSkipped: data.wasSkipped || false,
    nextPostItId,
    huntCompleted,
  };
}

async function handleWrongAnswer(
  huntId: string,
  postItId: string,
  postIt: any,
  currentHintAttempts: number,
  textAnswer: string | null
) {
  const hints = postIt.hints || [];
  const newHintAttempts = currentHintAttempts + 1;
  const hintsToShow = hints.slice(0, Math.min(newHintAttempts, hints.length));
  const allHintsShown = newHintAttempts >= hints.length;

  if (allHintsShown) {
    // All hints shown, prompt to try again
    return {
      ok: false,
      reason: 'TRY_AGAIN',
      hints: hintsToShow,
      hintAttempts: newHintAttempts,
      allHintsShown: true,
    };
  }

  // Create or update submission with hint attempt
  const existingSubmission = await prisma.submission.findFirst({
    where: { huntId, postItId },
    orderBy: { createdAt: 'desc' },
  });

  if (existingSubmission && !existingSubmission.isCorrect) {
    // Update existing submission
    await prisma.submission.update({
      where: { id: existingSubmission.id },
      data: {
        textAnswer: textAnswer,
        hintAttempts: newHintAttempts,
      },
    } as any);
  } else {
    // Create new submission
    await prisma.submission.create({
      data: {
        huntId,
        postItId,
        textAnswer: textAnswer,
        isCorrect: false,
        wasSkipped: false,
        hintAttempts: newHintAttempts,
      },
    });
  }

  return {
    ok: false,
    reason: 'WRONG_ANSWER',
    hints: hintsToShow,
    hintAttempts: newHintAttempts,
    allHintsShown: false,
  };
}
