"use server"
import { db } from '@/db';
import { business_accounts } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';


