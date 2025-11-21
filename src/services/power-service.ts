'use server';
import { google } from 'googleapis';
import { cacheLife } from 'next/cache';

type Power = {
  id: string;
  name: string;
  description: string;
};

export async function getAllPowers(): Promise<Power[]> {
  'use cache';
  cacheLife('minutes');

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Powers!A2:C',
  });

  const rows = response.data.values || [];
  const powers = rows.map((row, index) => ({
    id: row[0] || `power-${index}`,
    name: row[1] || '',
    description: row[2] || '',
  }));
  
  console.log('[Powers] Fetched from Google Sheets:', powers.length);
  return powers;
}
