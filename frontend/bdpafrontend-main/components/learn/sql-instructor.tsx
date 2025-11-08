'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  Code, 
  BookOpen,
  MessageSquare,
  Play,
  ExternalLink
} from 'lucide-react';
import type { SQLLevel, SQLChallenge } from '@/lib/sql-instructor';

interface SQLInstructorProps {
  onClose?: () => void;
}

export default function SQLInstructor({ onClose }: SQLInstructorProps) {
  const [levels, setLevels] = useState<SQLLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [currentChallenge, setCurrentChallenge] = useState<SQLChallenge | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [hintLevel, setHintLevel] = useState(1);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<any>(null);
  const [debugResult, setDebugResult] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    loadLevels();
  }, []);

  useEffect(() => {
    if (currentLevel) {
      loadLevel(currentLevel);
    }
  }, [currentLevel]);

  const loadLevels = async () => {
    try {
      const response = await fetch('/api/sql-instructor?action=getAllLevels');
      const data = await response.json();
      setLevels(data.levels || []);
    } catch (error) {
      console.error('Error loading levels:', error);
    }
  };

  const loadLevel = async (levelNumber: number, challengeIndex: number = 0) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sql-instructor?action=getLevel&level=${levelNumber}`);
      const data = await response.json();
      if (data.level && data.level.challenges.length > 0) {
        const challenge = data.level.challenges[Math.min(challengeIndex, data.level.challenges.length - 1)];
        setCurrentChallenge(challenge);
        setUserQuery('');
        setHintLevel(1);
        setExplanation(null);
        setDebugResult(null);
        setValidationResult(null);
      }
    } catch (error) {
      console.error('Error loading level:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!userQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/sql-instructor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'explain', query: userQuery })
      });
      const data = await response.json();
      setExplanation(data.explanation);
      setDebugResult(null);
      setValidationResult(null);
    } catch (error) {
      console.error('Error explaining query:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDebug = async () => {
    if (!userQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/sql-instructor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'debug', query: userQuery })
      });
      const data = await response.json();
      setDebugResult(data.debug);
      setExplanation(null);
      setValidationResult(null);
    } catch (error) {
      console.error('Error debugging query:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!userQuery.trim() || !currentChallenge) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/sql-instructor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'validate', 
          query: userQuery,
          challengeId: currentChallenge.id
        })
      });
      const data = await response.json();
      setValidationResult(data);
      setExplanation(null);
      setDebugResult(null);
    } catch (error) {
      console.error('Error validating query:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetHint = async () => {
    if (!currentChallenge) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `/api/sql-instructor?action=getHint&challengeId=${currentChallenge.id}&hintLevel=${hintLevel}`
      );
      const data = await response.json();
      if (data.hint) {
        addChatMessage('assistant', `Hint ${hintLevel}: ${data.hint.hint}`);
        if (data.hint.nextHint) {
          setHintLevel(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error getting hint:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    addChatMessage('user', userMessage);
    setLoading(true);

    try {
      // Check for trigger words
      const lower = userMessage.toLowerCase();
      const hasTriggerWord = 
        lower.includes('help') || 
        lower.includes('hint') || 
        lower.includes('explain') || 
        lower.includes('explain the problem') ||
        lower.includes('stuck') ||
        lower.includes('how do i') ||
        lower.includes('what should') ||
        lower.includes('guide me') ||
        lower.includes('assist') ||
        lower.includes('support');

      if (hasTriggerWord && currentChallenge) {
        // Call API for context-aware response
        const response = await fetch('/api/sql-instructor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'chat',
            message: userMessage,
            challengeId: currentChallenge.id,
            userQuery: userQuery // Include their current SQL query if they have one
          })
        });
        const data = await response.json();
        if (data.response) {
          addChatMessage('assistant', data.response);
        } else {
          addChatMessage('assistant', 'I apologize, but I encountered an error. Please try rephrasing your question or use the hint button.');
        }
      } else if (hasTriggerWord && !currentChallenge) {
        addChatMessage('assistant', 'Please select a challenge first from the Learning Path tab, then I can provide specific help for that challenge!');
      } else {
        // General response for non-trigger messages
        addChatMessage('assistant', 'I\'m here to help! Try asking for "help", "hint", or "explain the problem" to get assistance with the current challenge. You can also ask about specific SQL concepts.');
      }
    } catch (error) {
      console.error('Error in chat:', error);
      addChatMessage('assistant', 'I apologize, but I encountered an error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addChatMessage = (role: 'user' | 'assistant', content: string) => {
    setChatMessages(prev => [...prev, { role, content }]);
  };

  // Simple markdown renderer for chat messages
  const renderMarkdown = (text: string) => {
    // Split by code blocks first
    const parts = text.split(/```(\w+)?\n([\s\S]*?)```/g);
    let result: React.ReactNode[] = [];
    
    parts.forEach((part, index) => {
      if (index % 3 === 0) {
        // Regular text - process bold, lists, and line breaks
        const lines = part.split('\n');
        lines.forEach((line, lineIdx) => {
          if (lineIdx > 0) result.push(<br key={`br-${index}-${lineIdx}`} />);
          
          // Check if it's a list item
          const listMatch = line.match(/^(\s*)([-*•]|\d+\.)\s+(.+)$/);
          if (listMatch) {
            const [, indent, marker, content] = listMatch;
            const indentLevel = indent.length;
            result.push(
              <div key={`list-${index}-${lineIdx}`} className={`flex gap-2 ${indentLevel > 0 ? 'ml-4' : ''}`}>
                <span>{marker}</span>
                <span>{renderInlineMarkdown(content)}</span>
              </div>
            );
          } else {
            // Process bold text and regular content
            result.push(renderInlineMarkdown(line));
          }
        });
      } else if (index % 3 === 2) {
        // Code block
        result.push(
          <pre key={`code-${index}`} className="bg-muted p-2 rounded text-xs overflow-x-auto my-2">
            <code>{part}</code>
          </pre>
        );
      }
    });
    
    return result.length > 0 ? result : text;
  };

  // Helper to render inline markdown (bold, etc.)
  const renderInlineMarkdown = (text: string): React.ReactNode => {
    const boldParts = text.split(/\*\*(.*?)\*\*/g);
    return boldParts.map((part, idx) => 
      idx % 2 === 1 ? (
        <strong key={`bold-${idx}`}>{part}</strong>
      ) : (
        <span key={`text-${idx}`}>{part}</span>
      )
    );
  };

  const levelData = levels.find(l => l.level === currentLevel);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SQL Learning Hub</h2>
          <p className="text-muted-foreground">Master SQL with interactive challenges and AI guidance</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <Tabs defaultValue="levels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="levels">Learning Path</TabsTrigger>
          <TabsTrigger value="challenge">Current Challenge</TabsTrigger>
          <TabsTrigger value="chat">AI Mentor</TabsTrigger>
        </TabsList>

        <TabsContent value="levels" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {levels.map((level) => (
              <Card 
                key={level.level} 
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  currentLevel === level.level ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setCurrentLevel(level.level)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Level {level.level}</CardTitle>
                    <Badge variant={currentLevel === level.level ? 'default' : 'outline'}>
                      {level.level === currentLevel ? 'Active' : 'Available'}
                    </Badge>
                  </div>
                  <CardDescription>{level.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{level.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Learning Goals:</p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside">
                      {level.learningGoals.slice(0, 3).map((goal, i) => (
                        <li key={i}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                  <Badge variant="secondary" className="mt-3">
                    {level.challenges.length} Challenges
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenge" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : currentChallenge ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{currentChallenge.title}</CardTitle>
                      <CardDescription>{currentChallenge.description}</CardDescription>
                    </div>
                    <Badge variant={
                      currentChallenge.difficulty === 'beginner' ? 'default' :
                      currentChallenge.difficulty === 'intermediate' ? 'secondary' :
                      'destructive'
                    }>
                      {currentChallenge.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentChallenge.industryContext && (
                    <Alert className="mb-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
                      <AlertDescription>
                        <p className="font-medium text-sm mb-1">Industry Context:</p>
                        <p className="text-sm">{currentChallenge.industryContext}</p>
                        {currentChallenge.businessValue && (
                          <>
                            <p className="font-medium text-sm mt-2 mb-1">Business Value:</p>
                            <p className="text-sm">{currentChallenge.businessValue}</p>
                          </>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Challenge Question:</h4>
                    <p className="text-sm bg-muted p-3 rounded">{currentChallenge.question}</p>
                  </div>

                  {currentChallenge.expectedOutput && (
                    <div>
                      <h4 className="font-medium mb-2">Expected Output:</h4>
                      <p className="text-sm bg-muted p-3 rounded text-muted-foreground">{currentChallenge.expectedOutput}</p>
                    </div>
                  )}

                  {currentChallenge.schema && (
                    <div>
                      <h4 className="font-medium mb-2">Database Schema:</h4>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        <code>{currentChallenge.schema}</code>
                      </pre>
                    </div>
                  )}

                  {currentChallenge.sampleData && (
                    <div>
                      <h4 className="font-medium mb-2">Sample Data:</h4>
                      <div className="space-y-3">
                        {Object.entries(currentChallenge.sampleData).map(([tableName, rows]) => (
                          <div key={tableName} className="border rounded-lg overflow-hidden">
                            <div className="bg-muted px-3 py-2 font-medium text-sm">
                              Table: {tableName}
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead className="bg-muted/50">
                                  <tr>
                                    {rows.length > 0 && Object.keys(rows[0]).map((col) => (
                                      <th key={col} className="px-2 py-1 text-left font-medium border-r">
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {rows.slice(0, 10).map((row: any, idx: number) => (
                                    <tr key={idx} className="border-b">
                                      {Object.values(row).map((val: any, colIdx: number) => (
                                        <td key={colIdx} className="px-2 py-1 border-r">
                                          {val === null ? <span className="text-muted-foreground italic">NULL</span> : String(val)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {rows.length > 10 && (
                                <div className="text-xs text-muted-foreground px-3 py-2 bg-muted/30">
                                  ... and {rows.length - 10} more rows
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentChallenge.resources && currentChallenge.resources.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Learning Resources:</h4>
                      <div className="space-y-2">
                        {currentChallenge.resources.map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-2 p-3 border rounded-lg hover:bg-muted transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={resource.type === 'youtube' ? 'destructive' : 'secondary'}>
                                  {resource.type === 'youtube' ? 'YouTube' : resource.type}
                                </Badge>
                                <span className="font-medium text-sm">{resource.title}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{resource.description}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Your SQL Query:</h4>
                    <Textarea
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="Write your SQL query here..."
                      className="font-mono text-sm min-h-[150px]"
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={handleValidate} disabled={!userQuery.trim() || loading}>
                      <Play className="h-4 w-4 mr-2" />
                      Validate Solution
                    </Button>
                    <Button onClick={handleExplain} variant="outline" disabled={!userQuery.trim() || loading}>
                      <Code className="h-4 w-4 mr-2" />
                      Explain Query
                    </Button>
                    <Button onClick={handleDebug} variant="outline" disabled={!userQuery.trim() || loading}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Debug
                    </Button>
                    <Button onClick={handleGetHint} variant="outline" disabled={loading}>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Get Hint ({hintLevel})
                    </Button>
                  </div>

                  {validationResult && (
                    <Alert className={validationResult.isValid ? 'border-green-500' : 'border-red-500'}>
                      {validationResult.isValid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <AlertDescription>
                        <p className="font-medium mb-2">{validationResult.feedback}</p>
                        {validationResult.debug.errors.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium text-sm">Errors:</p>
                            <ul className="list-disc list-inside text-sm">
                              {validationResult.debug.errors.map((err: string, i: number) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {validationResult.debug.suggestions.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium text-sm">Suggestions:</p>
                            <ul className="list-disc list-inside text-sm">
                              {validationResult.debug.suggestions.map((sug: string, i: number) => (
                                <li key={i}>{sug}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {explanation && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Query Explanation</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm">{explanation.explanation}</p>
                        <div>
                          <p className="font-medium text-sm mb-2">Line by Line:</p>
                          <div className="space-y-2">
                            {explanation.lineByLine.map((item: any, i: number) => (
                              <div key={i} className="bg-muted p-2 rounded text-xs">
                                <code className="font-mono">{item.line}</code>
                                <p className="text-muted-foreground mt-1">{item.explanation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        {explanation.concepts.length > 0 && (
                          <div>
                            <p className="font-medium text-sm mb-2">Concepts Used:</p>
                            <div className="flex gap-2 flex-wrap">
                              {explanation.concepts.map((concept: string, i: number) => (
                                <Badge key={i} variant="outline">{concept}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {debugResult && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Debug Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {debugResult.isValid ? (
                          <Alert className="border-green-500">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <AlertDescription>
                              Your query syntax is valid!
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="space-y-3">
                            {debugResult.errors.length > 0 && (
                              <div>
                                <p className="font-medium text-sm mb-2 text-red-600">Errors:</p>
                                <ul className="list-disc list-inside text-sm">
                                  {debugResult.errors.map((err: string, i: number) => (
                                    <li key={i}>{err}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {debugResult.suggestions.length > 0 && (
                              <div>
                                <p className="font-medium text-sm mb-2">Suggestions:</p>
                                <ul className="list-disc list-inside text-sm">
                                  {debugResult.suggestions.map((sug: string, i: number) => (
                                    <li key={i}>{sug}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              {levelData && levelData.challenges.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Other Challenges in Level {currentLevel}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {levelData.challenges
                        .filter(c => c.id !== currentChallenge.id)
                        .map((challenge) => (
                          <Button
                            key={challenge.id}
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                              setCurrentChallenge(challenge);
                              setUserQuery('');
                              setHintLevel(1);
                              setExplanation(null);
                              setDebugResult(null);
                              setValidationResult(null);
                            }}
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            {challenge.title}
                          </Button>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a level to start learning</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI SQL Mentor
              </CardTitle>
              <CardDescription>
                Ask questions, get explanations, and receive guidance on SQL concepts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 h-[400px] overflow-y-auto space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                    <p>Start a conversation with your SQL mentor!</p>
                    <p className="text-sm mt-2">Try asking:</p>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>"Help" or "I need help"</li>
                      <li>"Explain the problem"</li>
                      <li>"Hint" or "Give me a hint"</li>
                      <li>"Guide me" or "How do I start?"</li>
                    </ul>
                    <p className="text-xs mt-4 text-muted-foreground">Make sure you have a challenge selected first!</p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">
                          {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question about SQL..."
                  className="flex-1"
                  rows={2}
                />
                <Button type="submit" disabled={!chatInput.trim() || loading}>
                  Send
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

