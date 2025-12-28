import prisma from '../db/client';

export async function createPostIt(
  huntId: string,
  data: {
    position: number;
    title?: string;
    prompt: string;
    color: string;
    type: 'riddle' | 'photo' | 'mixed' | 'choice';
    correctAnswer?: string;
    requiresPhoto: boolean;
    allowsSkip: boolean;
    nextPostItId?: string;
  }
) {
  return prisma.postIt.create({
    data: {
      huntId,
      ...data,
    },
  });
}

export async function updatePostIt(
  postItId: string,
  data: Partial<{
    position: number;
    title: string;
    prompt: string;
    color: string;
    type: 'riddle' | 'photo' | 'mixed' | 'choice';
    correctAnswer: string;
    requiresPhoto: boolean;
    allowsSkip: boolean;
    nextPostItId: string;
  }>
) {
  return prisma.postIt.update({
    where: { id: postItId },
    data,
  });
}

export async function deletePostIt(postItId: string) {
  return prisma.postIt.delete({
    where: { id: postItId },
  });
}

export async function createPostItOption(
  postItId: string,
  data: { label: string; value: string; nextPostItId: string }
) {
  return prisma.postItOption.create({
    data: {
      postItId,
      ...data,
    },
  });
}

export async function deletePostItOption(optionId: string) {
  return prisma.postItOption.delete({
    where: { id: optionId },
  });
}

