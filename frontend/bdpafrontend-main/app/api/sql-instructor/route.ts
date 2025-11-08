import { NextRequest, NextResponse } from 'next/server';
import {
  getLevel,
  getAllLevels,
  generateHint,
  explainQuery,
  debugQuery,
  generateChatResponse,
  SQLChallenge
} from '@/lib/sql-instructor';

// Helper to find challenge
function findChallengeById(challengeId: string): SQLChallenge | null {
  const allLevels = getAllLevels();
  for (const level of allLevels) {
    const challenge = level.challenges.find(c => c.id === challengeId);
    if (challenge) return challenge;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const level = searchParams.get('level');
  const challengeId = searchParams.get('challengeId');
  const hintLevel = searchParams.get('hintLevel');

  try {
    switch (action) {
      case 'getLevel':
        if (!level) {
          return NextResponse.json({ error: 'Level parameter required' }, { status: 400 });
        }
        const levelData = getLevel(parseInt(level));
        if (!levelData) {
          return NextResponse.json({ error: 'Level not found' }, { status: 404 });
        }
        return NextResponse.json({ level: levelData });

      case 'getAllLevels':
        return NextResponse.json({ levels: getAllLevels() });

      case 'getHint':
        if (!challengeId) {
          return NextResponse.json({ error: 'challengeId parameter required' }, { status: 400 });
        }
        const hint = generateHint(challengeId, hintLevel ? parseInt(hintLevel) : 1);
        if (!hint) {
          return NextResponse.json({ error: 'Hint not found' }, { status: 404 });
        }
        return NextResponse.json({ hint });

      case 'getChallenge':
        if (!challengeId) {
          return NextResponse.json({ error: 'challengeId parameter required' }, { status: 400 });
        }
        const challenge = findChallengeById(challengeId);
        if (!challenge) {
          return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }
        return NextResponse.json({ challenge });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('SQL Instructor API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, query, challengeId, expectedOutput, message, userQuery } = body;

    switch (action) {
      case 'explain':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
        }
        const explanation = explainQuery(query);
        return NextResponse.json({ explanation });

      case 'debug':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
        }
        const debugResult = debugQuery(query, expectedOutput);
        return NextResponse.json({ debug: debugResult });

      case 'validate':
        if (!query || !challengeId) {
          return NextResponse.json({ error: 'Query and challengeId required' }, { status: 400 });
        }
        const challenge = findChallengeById(challengeId);
        if (!challenge) {
          return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }
        
        // Basic validation - in production, you'd run the query against a test database
        const debug = debugQuery(query, challenge.expectedOutput);
        const isValid = debug.isValid;
        
        // Check if solution matches (simplified - in production, compare actual results)
        const solutionMatch = challenge.solution 
          ? query.trim().toUpperCase().replace(/\s+/g, ' ') === challenge.solution.trim().toUpperCase().replace(/\s+/g, ' ')
          : false;
        
        return NextResponse.json({
          isValid: isValid && solutionMatch,
          debug,
          solutionMatch,
          feedback: solutionMatch 
            ? 'Excellent! Your query is correct. Great job!'
            : isValid 
              ? 'Your query syntax is valid, but it may not match the expected solution. Review the requirements and try again.'
              : 'Your query has some issues. Check the errors and suggestions above.'
        });

      case 'chat':
        if (!message || !challengeId) {
          return NextResponse.json({ error: 'Message and challengeId required' }, { status: 400 });
        }
        const chatResponse = generateChatResponse(message, challengeId, userQuery);
        return NextResponse.json({ response: chatResponse });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('SQL Instructor API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

