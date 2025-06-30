import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-send-time.ts';
import '@/ai/flows/send-campaign.ts';
import '@/ai/flows/send-invitation-email.ts';
