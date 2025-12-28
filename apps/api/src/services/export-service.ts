import prisma from '../db/client';

export async function generateMemoryBook(huntId: string): Promise<string> {
  const hunt = await prisma.hunt.findUnique({
    where: { id: huntId },
    include: {
      postIts: {
        orderBy: { position: 'asc' },
        include: {
          options: true,
          submissions: {
            orderBy: { createdAt: 'asc' },
            include: { photos: true },
          },
        },
      },
    },
  });

  if (!hunt) throw new Error('Hunt not found');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scavenger Hunt Memory Book</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    .welcome {
      background: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .postit {
      background: white;
      padding: 25px;
      margin-bottom: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-left: 5px solid;
      page-break-inside: avoid;
    }
    .postit-header {
      font-size: 1.2em;
      font-weight: bold;
      margin-bottom: 15px;
      color: #333;
    }
    .prompt {
      font-size: 1.1em;
      margin-bottom: 15px;
      color: #555;
    }
    .answer {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
      border-left: 3px solid #667eea;
    }
    .answer-label {
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
    }
    .skipped {
      color: #999;
      font-style: italic;
    }
    .photos {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .photo {
      width: 100%;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .option {
      background: #e8f0fe;
      padding: 10px;
      border-radius: 5px;
      margin: 10px 0;
      display: inline-block;
    }
    @media print {
      body { background: white; padding: 0; }
      .postit { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Scavenger Hunt Memory Book</h1>
    <p>For ${escapeHtml(hunt.giftedName)}</p>
  </div>
  
  <div class="welcome">
    <h2>Welcome!</h2>
    <p>${escapeHtml(hunt.welcomeMessage)}</p>
  </div>

  ${hunt.postIts
    .filter((postIt) => postIt.submissions.length > 0)
    .map((postIt) => {
      const submission = postIt.submissions[0];
      const color = postIt.color || 'yellow';
      const borderColor = getColorHex(color);
      
      return `
  <div class="postit" style="border-left-color: ${borderColor};">
    <div class="postit-header">${postIt.title ? escapeHtml(postIt.title) : `Post-it #${postIt.position}`}</div>
    <div class="prompt">${escapeHtml(postIt.prompt)}</div>
    
    ${submission.wasSkipped ? `
    <div class="answer skipped">Skipped</div>
    ` : `
    ${submission.selectedOptionValue ? `
    <div class="answer">
      <div class="answer-label">Selected Option:</div>
      <div class="option">${escapeHtml(submission.selectedOptionValue)}</div>
    </div>
    ` : ''}
    ${submission.textAnswer ? `
    <div class="answer">
      <div class="answer-label">Answer:</div>
      <div>${escapeHtml(submission.textAnswer)}</div>
    </div>
    ` : ''}
    ${submission.photos.length > 0 ? `
    <div class="photos">
      ${submission.photos.map((photo) => `<img src="${escapeHtml(photo.photoUrl)}" alt="Photo" class="photo" />`).join('')}
    </div>
    ` : ''}
    `}
  </div>
      `;
    })
    .join('')}
</body>
</html>`;

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getColorHex(color: string): string {
  const colors: Record<string, string> = {
    yellow: '#ffeb3b',
    red: '#f44336',
    blue: '#2196f3',
    green: '#4caf50',
    pink: '#e91e63',
    orange: '#ff9800',
    purple: '#9c27b0',
  };
  return colors[color.toLowerCase()] || color;
}

