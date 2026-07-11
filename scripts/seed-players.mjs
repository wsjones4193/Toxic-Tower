// Seed tt_players from Underdog rankings CSV export
// Usage: node scripts/seed-players.mjs
// Requires .env.local to have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load env vars from .env.local manually
const envPath = join(__dirname, '..', '.env.local')
const envContents = readFileSync(envPath, 'utf8')
for (const line of envContents.split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Parse CSV (handles quoted fields)
function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = lines[0].replace(/"/g, '').split(',')
  return lines.slice(1).map(line => {
    const values = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes }
      else if (char === ',' && !inQuotes) { values.push(current); current = '' }
      else { current += char }
    }
    values.push(current)
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

const CSV_PATH = 'C:\\Users\\wsjon\\Downloads\\rankings-a9c04e81-1ace-4b16-a31d-4c725a47f16f-ccf300b0-9197-5951-bd96-cba84ad71e86 (8).csv'

const raw = readFileSync(CSV_PATH, 'utf8')
const rows = parseCSV(raw)

const VALID_POSITIONS = ['QB', 'RB', 'WR', 'TE']

// Build player records, ordered by ADP for initial rank
const players = rows
  .filter(r => VALID_POSITIONS.includes(r.slotName))
  .map(r => ({
    _adp: parseFloat(r.adp) || 9999,
    name: `${r.firstName} ${r.lastName}`.trim(),
    position: r.slotName,
    team: r.teamName || '',
    bye_week: r.byeWeek ? parseInt(r.byeWeek) : null,
    underdog_id: r.id || null,
    rank: 999,
    tier: 1,
  }))
  .sort((a, b) => a._adp - b._adp)
  .map(({ _adp, ...p }, i) => ({ ...p, rank: i + 1 }))

console.log(`Seeding ${players.length} players...`)

// Insert in batches of 100
const BATCH = 100
let inserted = 0
for (let i = 0; i < players.length; i += BATCH) {
  const batch = players.slice(i, i + BATCH)
  const { error } = await supabase.from('tt_players').insert(batch)
  if (error) {
    console.error(`Error at batch ${i}:`, error.message)
    process.exit(1)
  }
  inserted += batch.length
  console.log(`  ${inserted}/${players.length} inserted`)
}

console.log(`\nDone! ${inserted} players seeded into tt_players.`)
