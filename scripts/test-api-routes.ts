import path from 'path';
import { analyzeRepository } from '../lib/analyzer';
import { buildAutopsyPrompt, buildRoadmapPrompt } from '../lib/prompts';
import { sendOllamaChat } from '../lib/ollama';

async function testApiEndpoints() {
  console.log('Testing Digital Autopsy and Roadmap inference pipeline...');

  const samplePath = path.resolve('fixtures', 'sample-abandoned-repo');
  const analysis = await analyzeRepository(samplePath);

  // 1. Test Autopsy Prompt & Ollama response
  console.log('Testing Autopsy prompt with Gemma 3 4B...');
  const autopsyPrompts = buildAutopsyPrompt(analysis);
  const autopsyResponse = await sendOllamaChat([
    { role: 'system', content: autopsyPrompts.systemPrompt },
    { role: 'user', content: autopsyPrompts.userPrompt },
  ]);

  console.log('Autopsy raw output received (first 200 chars):');
  console.log(autopsyResponse.slice(0, 200));

  // 2. Test Roadmap Prompt & Ollama response
  console.log('\nTesting Roadmap prompt with Gemma 3 4B...');
  const roadmapPrompts = buildRoadmapPrompt(analysis);
  const roadmapResponse = await sendOllamaChat([
    { role: 'system', content: roadmapPrompts.systemPrompt },
    { role: 'user', content: roadmapPrompts.userPrompt },
  ]);

  console.log('Roadmap raw output received (first 200 chars):');
  console.log(roadmapResponse.slice(0, 200));

  console.log('\n[SUCCESS] Both Autopsy and Roadmap inference pathways verified successfully!');
}

testApiEndpoints().catch((err) => {
  console.error('API pipeline test error:', err);
  process.exit(1);
});

