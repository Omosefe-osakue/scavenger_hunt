// Mock database client with in-memory data
// This replaces Prisma for testing without a real database connection

type HuntStatus = 'draft' | 'published' | 'completed';
type PostItType = 'riddle' | 'photo' | 'mixed' | 'choice';

interface Hunt {
  id: string;
  code: string;
  shareSlug: string;
  giftedName: string;
  welcomeMessage: string;
  status: HuntStatus;
  createdAt: Date;
  publishedAt: Date | null;
}

interface PostIt {
  id: string;
  huntId: string;
  position: number;
  title: string | null;
  prompt: string;
  color: string;
  type: PostItType;
  correctAnswer: string | null;
  requiresPhoto: boolean;
  allowsSkip: boolean;
  nextPostItId: string | null;
  createdAt: Date;
}

interface PostItOption {
  id: string;
  postItId: string;
  label: string;
  value: string;
  nextPostItId: string;
}

interface Submission {
  id: string;
  huntId: string;
  postItId: string;
  textAnswer: string | null;
  selectedOptionValue: string | null;
  isCorrect: boolean;
  wasSkipped: boolean;
  createdAt: Date;
}

interface SubmissionPhoto {
  id: string;
  submissionId: string;
  photoUrl: string;
  createdAt: Date;
}

interface HuntProgress {
  huntId: string;
  currentPostItId: string | null;
  completedAt: Date | null;
  updatedAt: Date;
}

// In-memory storage
const hunts: Map<string, Hunt> = new Map();
const postIts: Map<string, PostIt> = new Map();
const postItOptions: Map<string, PostItOption> = new Map();
const submissions: Map<string, Submission> = new Map();
const submissionPhotos: Map<string, SubmissionPhoto> = new Map();
const huntProgress: Map<string, HuntProgress> = new Map();

// Helper to generate UUID
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Initialize with some dummy data for testing
function initializeDummyData() {
  const huntId1 = uuid();
  const huntId2 = uuid();
  
  // Hunt 1 - Published with post-its
  hunts.set(huntId1, {
    id: huntId1,
    code: 'ABC123',
    shareSlug: 'test-hunt-1',
    giftedName: 'Test User',
    welcomeMessage: 'Welcome to your scavenger hunt!',
    status: 'published',
    createdAt: new Date(),
    publishedAt: new Date(),
  });

  const postIt1 = uuid();
  const postIt2 = uuid();
  const postIt3 = uuid();

  postIts.set(postIt1, {
    id: postIt1,
    huntId: huntId1,
    position: 1,
    title: 'First Clue',
    prompt: 'What is 2 + 2?',
    color: 'yellow',
    type: 'riddle',
    correctAnswer: '4',
    requiresPhoto: false,
    allowsSkip: false,
    nextPostItId: postIt2,
    createdAt: new Date(),
  });

  postIts.set(postIt2, {
    id: postIt2,
    huntId: huntId1,
    position: 2,
    title: 'Second Clue',
    prompt: 'Take a photo of something blue',
    color: 'blue',
    type: 'photo',
    correctAnswer: null,
    requiresPhoto: true,
    allowsSkip: true,
    nextPostItId: postIt3,
    createdAt: new Date(),
  });

  postIts.set(postIt3, {
    id: postIt3,
    huntId: huntId1,
    position: 3,
    title: 'Final Clue',
    prompt: 'Choose your path: A or B?',
    color: 'green',
    type: 'choice',
    correctAnswer: null,
    requiresPhoto: false,
    allowsSkip: false,
    nextPostItId: null,
    createdAt: new Date(),
  });

  const option1 = uuid();
  const option2 = uuid();
  postItOptions.set(option1, {
    id: option1,
    postItId: postIt3,
    label: 'Option A',
    value: 'A',
    nextPostItId: postIt3, // Self-reference for demo
  });
  postItOptions.set(option2, {
    id: option2,
    postItId: postIt3,
    label: 'Option B',
    value: 'B',
    nextPostItId: postIt3,
  });

  huntProgress.set(huntId1, {
    huntId: huntId1,
    currentPostItId: postIt1,
    completedAt: null,
    updatedAt: new Date(),
  });

  // Hunt 2 - Draft
  hunts.set(huntId2, {
    id: huntId2,
    code: 'XYZ789',
    shareSlug: 'draft-hunt',
    giftedName: 'Draft User',
    welcomeMessage: 'This is a draft hunt',
    status: 'draft',
    createdAt: new Date(),
    publishedAt: null,
  });

  huntProgress.set(huntId2, {
    huntId: huntId2,
    currentPostItId: null,
    completedAt: null,
    updatedAt: new Date(),
  });
}

// Initialize dummy data
initializeDummyData();

// Mock Prisma-like client
const mockClient = {
  hunt: {
    findUnique: async (args: { where: { id?: string; code?: string; shareSlug?: string } }) => {
      const hunt = Array.from(hunts.values()).find((h) => {
        if (args.where.id) return h.id === args.where.id;
        if (args.where.code) return h.code === args.where.code;
        if (args.where.shareSlug) return h.shareSlug === args.where.shareSlug;
        return false;
      });
      return hunt || null;
    },
    findFirst: async (args?: any) => {
      return Array.from(hunts.values())[0] || null;
    },
    create: async (args: { data: Omit<Hunt, 'id' | 'createdAt'> & { id?: string; createdAt?: Date } }) => {
      const hunt: Hunt = {
        id: args.data.id || uuid(),
        createdAt: args.data.createdAt || new Date(),
        ...args.data,
      };
      hunts.set(hunt.id, hunt);
      return hunt;
    },
    update: async (args: { where: { id: string }; data: Partial<Hunt> }) => {
      const hunt = hunts.get(args.where.id);
      if (!hunt) throw new Error('Hunt not found');
      const updated = { ...hunt, ...args.data };
      hunts.set(args.where.id, updated);
      return updated;
    },
    delete: async (args: { where: { id: string } }) => {
      const hunt = hunts.get(args.where.id);
      if (!hunt) throw new Error('Hunt not found');
      hunts.delete(args.where.id);
      return hunt;
    },
    count: async () => hunts.size,
  },
  postIt: {
    findUnique: async (args: { where: { id: string } }) => {
      return postIts.get(args.where.id) || null;
    },
    findFirst: async (args: { where: any; orderBy?: any }) => {
      let results = Array.from(postIts.values()).filter((p) => {
        if (args.where.huntId && p.huntId !== args.where.huntId) return false;
        if (args.where.position?.gt && p.position <= args.where.position.gt) return false;
        if (args.where.position?.lt && p.position >= args.where.position.lt) return false;
        return true;
      });
      if (args.orderBy?.position === 'asc') {
        results.sort((a, b) => a.position - b.position);
      }
      return results[0] || null;
    },
    findMany: async (args?: { where?: any; orderBy?: any; include?: any }) => {
      let results = Array.from(postIts.values());
      if (args?.where?.huntId) {
        results = results.filter((p) => p.huntId === args.where.huntId);
      }
      if (args?.orderBy?.position === 'asc') {
        results.sort((a, b) => a.position - b.position);
      }
      return results;
    },
    create: async (args: { data: Omit<PostIt, 'id' | 'createdAt'> & { id?: string; createdAt?: Date } }) => {
      const postIt: PostIt = {
        id: args.data.id || uuid(),
        createdAt: args.data.createdAt || new Date(),
        ...args.data,
      };
      postIts.set(postIt.id, postIt);
      return postIt;
    },
    update: async (args: { where: { id: string }; data: Partial<PostIt> }) => {
      const postIt = postIts.get(args.where.id);
      if (!postIt) throw new Error('PostIt not found');
      const updated = { ...postIt, ...args.data };
      postIts.set(args.where.id, updated);
      return updated;
    },
    delete: async (args: { where: { id: string } }) => {
      const postIt = postIts.get(args.where.id);
      if (!postIt) throw new Error('PostIt not found');
      postIts.delete(args.where.id);
      return postIt;
    },
    count: async (args?: { where?: any }) => {
      if (args?.where?.huntId) {
        return Array.from(postIts.values()).filter((p) => p.huntId === args.where.huntId).length;
      }
      return postIts.size;
    },
  },
  postItOption: {
    findUnique: async (args: { where: { id: string } }) => {
      return postItOptions.get(args.where.id) || null;
    },
    findMany: async (args?: { where?: any; orderBy?: any }) => {
      let results = Array.from(postItOptions.values());
      if (args?.where?.postItId) {
        results = results.filter((o) => o.postItId === args.where.postItId);
      }
      if (args?.orderBy?.label === 'asc') {
        results.sort((a, b) => a.label.localeCompare(b.label));
      }
      return results;
    },
    create: async (args: { data: Omit<PostItOption, 'id'> & { id?: string } }) => {
      const option: PostItOption = {
        id: args.data.id || uuid(),
        ...args.data,
      };
      postItOptions.set(option.id, option);
      return option;
    },
    delete: async (args: { where: { id: string } }) => {
      const option = postItOptions.get(args.where.id);
      if (!option) throw new Error('PostItOption not found');
      postItOptions.delete(args.where.id);
      return option;
    },
  },
  submission: {
    findUnique: async (args: { where: { id: string } }) => {
      return submissions.get(args.where.id) || null;
    },
    findFirst: async (args: { where: any }) => {
      return Array.from(submissions.values()).find((s) => {
        if (args.where.huntId && s.huntId !== args.where.huntId) return false;
        if (args.where.postItId && s.postItId !== args.where.postItId) return false;
        return true;
      }) || null;
    },
    findMany: async (args?: { where?: any; orderBy?: any; include?: any }) => {
      let results = Array.from(submissions.values());
      if (args?.where?.huntId) {
        results = results.filter((s) => s.huntId === args.where.huntId);
      }
      if (args?.where?.postItId) {
        results = results.filter((s) => s.postItId === args.where.postItId);
      }
      if (args?.orderBy?.createdAt === 'asc') {
        results.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      }
      return results;
    },
    create: async (args: { data: Omit<Submission, 'id' | 'createdAt'> & { id?: string; createdAt?: Date; photos?: { create: Array<{ photoUrl: string }> } } }) => {
      const submission: Submission = {
        id: args.data.id || uuid(),
        createdAt: args.data.createdAt || new Date(),
        textAnswer: args.data.textAnswer || null,
        selectedOptionValue: args.data.selectedOptionValue || null,
        isCorrect: args.data.isCorrect,
        wasSkipped: args.data.wasSkipped || false,
        huntId: args.data.huntId,
        postItId: args.data.postItId,
      };
      submissions.set(submission.id, submission);

      // Create photos if provided
      if (args.data.photos?.create) {
        for (const photoData of args.data.photos.create) {
          const photo: SubmissionPhoto = {
            id: uuid(),
            submissionId: submission.id,
            photoUrl: photoData.photoUrl,
            createdAt: new Date(),
          };
          submissionPhotos.set(photo.id, photo);
        }
      }

      return submission;
    },
  },
  submissionPhoto: {
    findMany: async (args?: { where?: any }) => {
      let results = Array.from(submissionPhotos.values());
      if (args?.where?.submissionId) {
        results = results.filter((p) => p.submissionId === args.where.submissionId);
      }
      return results;
    },
  },
  huntProgress: {
    findUnique: async (args: { where: { huntId: string } }) => {
      return huntProgress.get(args.where.huntId) || null;
    },
    create: async (args: { data: Omit<HuntProgress, 'updatedAt'> & { updatedAt?: Date } }) => {
      const progress: HuntProgress = {
        huntId: args.data.huntId,
        currentPostItId: args.data.currentPostItId || null,
        completedAt: args.data.completedAt || null,
        updatedAt: args.data.updatedAt || new Date(),
      };
      huntProgress.set(progress.huntId, progress);
      return progress;
    },
    update: async (args: { where: { huntId: string }; data: Partial<HuntProgress> }) => {
      const progress = huntProgress.get(args.where.huntId);
      if (!progress) throw new Error('HuntProgress not found');
      const updated = { ...progress, ...args.data, updatedAt: new Date() };
      huntProgress.set(args.where.huntId, updated);
      return updated;
    },
  },
  $queryRaw: async (query: any) => {
    return [{ test: 1 }];
  },
  $connect: async () => {},
  $disconnect: async () => {},
};

// Helper to include relations (simulating Prisma's include)
export function includeRelations<T extends { id: string }>(
  items: T[],
  includeConfig: any
): any[] {
  return items.map((item) => {
    const result: any = { ...item };
    
    if (includeConfig.postIts) {
      const relatedPostIts = Array.from(postIts.values()).filter(
        (p) => (p as any).huntId === item.id
      );
      result.postIts = relatedPostIts.map((p) => {
        const postItResult: any = { ...p };
        if (includeConfig.postIts.include?.options) {
          postItResult.options = Array.from(postItOptions.values()).filter(
            (o) => o.postItId === p.id
          );
        }
        if (includeConfig.postIts.include?.submissions) {
          const relatedSubmissions = Array.from(submissions.values()).filter(
            (s) => s.postItId === p.id
          );
          postItResult.submissions = relatedSubmissions.map((s) => {
            const subResult: any = { ...s };
            if (includeConfig.postIts.include.submissions.include?.photos) {
              subResult.photos = Array.from(submissionPhotos.values()).filter(
                (ph) => ph.submissionId === s.id
              );
            }
            return subResult;
          });
        }
        return postItResult;
      });
      if (includeConfig.postIts.orderBy?.position === 'asc') {
        result.postIts.sort((a: PostIt, b: PostIt) => a.position - b.position);
      }
    }
    
    if (includeConfig.progress) {
      result.progress = huntProgress.get(item.id) || null;
    }
    
    if (includeConfig.submissions) {
      const relatedSubmissions = Array.from(submissions.values()).filter(
        (s) => (s as any).huntId === item.id
      );
      result.submissions = relatedSubmissions.map((s) => {
        const subResult: any = { ...s };
        if (includeConfig.submissions.include?.photos) {
          subResult.photos = Array.from(submissionPhotos.values()).filter(
            (ph) => ph.submissionId === s.id
          );
        }
        return subResult;
      });
    }
    
    return result;
  });
}

// Enhanced findUnique with include support
const enhancedClient = {
  ...mockClient,
  hunt: {
    ...mockClient.hunt,
    findUnique: async (args: { where: { id?: string; code?: string; shareSlug?: string }; include?: any }) => {
      const hunt = await mockClient.hunt.findUnique({ where: args.where });
      if (!hunt) return null;
      
      // If no include, just return the hunt
      if (!args.include) {
        return hunt;
      }
      
      if (args.include) {
        const result: any = { ...hunt };
        
        if (args.include.postIts) {
          let relatedPostIts = Array.from(postIts.values()).filter((p) => p.huntId === hunt.id);
          
          // Apply orderBy if specified
          if (args.include.postIts.orderBy?.position === 'asc') {
            relatedPostIts.sort((a, b) => a.position - b.position);
          }
          
          result.postIts = relatedPostIts.map((p) => {
            const postItResult: any = { ...p };
            
            // Include options if requested
            if (args.include.postIts.include?.options) {
              let options = Array.from(postItOptions.values()).filter((o) => o.postItId === p.id);
              if (args.include.postIts.include.options.orderBy?.label === 'asc') {
                options.sort((a, b) => a.label.localeCompare(b.label));
              }
              postItResult.options = options;
            }
            
            // Include submissions if requested (for export service)
            if (args.include.postIts.include?.submissions) {
              let relatedSubmissions = Array.from(submissions.values()).filter((s) => s.postItId === p.id);
              if (args.include.postIts.include.submissions.orderBy?.createdAt === 'asc') {
                relatedSubmissions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
              }
              postItResult.submissions = relatedSubmissions.map((s) => {
                const subResult: any = { ...s };
                if (args.include.postIts.include.submissions.include?.photos) {
                  subResult.photos = Array.from(submissionPhotos.values()).filter(
                    (ph) => ph.submissionId === s.id
                  );
                }
                return subResult;
              });
            }
            
            return postItResult;
          });
        }
        
        if (args.include.progress) {
          result.progress = huntProgress.get(hunt.id) || null;
        }
        
        if (args.include.submissions) {
          let relatedSubmissions = Array.from(submissions.values()).filter((s) => s.huntId === hunt.id);
          // Apply orderBy if specified
          if (args.include.submissions.orderBy?.createdAt === 'asc') {
            relatedSubmissions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
          }
          result.submissions = relatedSubmissions.map((s) => {
            const subResult: any = { ...s };
            if (args.include.submissions.include?.photos) {
              subResult.photos = Array.from(submissionPhotos.values()).filter(
                (ph) => ph.submissionId === s.id
              );
            }
            return subResult;
          });
        }
        
        return result;
      }
      return hunt;
    },
  },
  postIt: {
    ...mockClient.postIt,
    findUnique: async (args: { where: { id: string }; include?: any }) => {
      const postIt = await mockClient.postIt.findUnique({ where: args.where });
      if (!postIt) return null;
      
      if (args.include?.options) {
        const result: any = { ...postIt };
        let options = Array.from(postItOptions.values()).filter((o) => o.postItId === postIt.id);
        if (args.include.options.orderBy?.label === 'asc') {
          options.sort((a: PostItOption, b: PostItOption) => a.label.localeCompare(b.label));
        }
        result.options = options;
        return result;
      }
      return postIt;
    },
  },
};

export default enhancedClient;

