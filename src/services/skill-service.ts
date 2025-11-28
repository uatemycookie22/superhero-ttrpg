'use server';
import { google } from 'googleapis';
import { cacheLife } from 'next/cache';
import { SkillTree, SkillTreeData } from '@/types/skills';

export async function getSkillTrees(): Promise<SkillTreeData> {
  'use cache';
  cacheLife('minutes');

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Skills!A2:G',
  });

  const rows = response.data.values || [];
  
  // Group skills by tree
  const treeMap = new Map<string, SkillTree>();
  
  for (const row of rows) {
    const [skillId, name, description, treeName, attribute, prerequisites, icon] = row;
    if (!skillId || !treeName) continue;
    
    const treeId = treeName.toLowerCase().replace(/\s+/g, '-');
    
    if (!treeMap.has(treeId)) {
      treeMap.set(treeId, {
        id: treeId,
        name: treeName,
        attribute: attribute?.toLowerCase() || '',
        skills: [],
      });
    }
    
    treeMap.get(treeId)!.skills.push({
      id: skillId,
      name: name || '',
      description: description || '',
      prerequisites: prerequisites ? prerequisites.split(',').map((p: string) => p.trim()) : [],
      icon: icon || undefined,
    });
  }

  console.log('[Skills] Fetched from Google Sheets:', treeMap.size, 'trees');
  return { skillTrees: Array.from(treeMap.values()) };
}
