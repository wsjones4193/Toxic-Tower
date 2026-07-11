// Seed tt_ranking_players from tt_players (ADP order)
// Usage: node scripts/seed-rankings.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envContents = readFileSync(join(__dirname, '..', '.env.local'), 'utf8')
for (const line of envContents.split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Fetch all ranking lists
const { data: lists } = await supabase.from('tt_ranking_lists').select('*')
console.log('Ranking lists:', lists.map(l => l.position).join(', '))

// Fetch all players ordered by rank (ADP)
const { data: players } = await supabase
  .from('tt_players')
  .select('id, position, rank')
  .order('rank')

console.log(`Total players: ${players.length}`)

const positionFilter = {
  OVERALL: () => true,
  QB:      p => p.position === 'QB',
  RB:      p => p.position === 'RB',
  WR:      p => p.position === 'WR',
  TE:      p => p.position === 'TE',
  FLEX:    p => ['RB', 'WR', 'TE'].includes(p.position),
}

for (const list of lists) {
  const filter = positionFilter[list.position]
  if (!filter) continue

  const filtered = players.filter(filter)
  console.log(`\n${list.position}: ${filtered.length} players`)

  // Clear existing rankings for this list
  await supabase.from('tt_ranking_players').delete().eq('ranking_list_id', list.id)

  // Insert in batches of 100
  const rows = filtered.map((p, i) => ({
    ranking_list_id: list.id,
    player_id: p.id,
    rank: i + 1,
    tier: 1,
  }))

  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await supabase.from('tt_ranking_players').insert(rows.slice(i, i + 100))
    if (error) { console.error('Error:', error.message); process.exit(1) }
  }

  console.log(`  ✓ Seeded ${rows.length} players`)
}

console.log('\nDone! All ranking lists seeded.')
