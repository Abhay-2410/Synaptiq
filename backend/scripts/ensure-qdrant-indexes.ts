/** Ensure Qdrant payload indexes exist (idempotent). Run: npx tsx scripts/ensure-qdrant-indexes.ts */
import 'dotenv/config';
import { ensureQdrantCollection } from '../integrations/qdrant-store.js';

await ensureQdrantCollection();
console.log('Qdrant collection and payload indexes ready.');
