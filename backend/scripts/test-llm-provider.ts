import 'dotenv/config';
import { checkLlmProviderAtStartup, describeQuickCheckModel, describeTutorModel } from '../agents/llm-provider.js';

console.log('provider: groq');
console.log('tutor:', describeTutorModel());
console.log('quick-check:', describeQuickCheckModel());
await checkLlmProviderAtStartup();
