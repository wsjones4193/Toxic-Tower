'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import {
  GripVertical,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Edit2,
  X,
  Check,
} from 'lucide-react'
import type { Player, RankingList } from '@/types'

interface RankingPlayerEntry {
  id: string
  rank: number
  tier: number
  player: Player
  ranking_list_id: string
}

interface Props {
  positions: string[]
  activePos: string
  rankingList: RankingList | null
  rankingPlayers: RankingPlayerEntry[]
  allPlayers: Player[]
  unrankedPlayers: Player[]
}

interface SortableRowProps {
  entry: RankingPlayerEntry
  index: number
  onTierChange: (id: string, tier: number) => void
  onNoteEdit: (id: string) => void
  onRemove: (id: string) => void
}

function SortableRow({ entry, index, onTierChange, onNoteEdit, onRemove }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const POSITION_COLORS: Record<string, string> = {
    QB: 'bg-red-500/20 text-red-400',
    RB: 'bg-green-500/20 text-green-400',
    WR: 'bg-blue-500/20 text-blue-400',
    TE: 'bg-orange-500/20 text-orange-400',
  }

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-white/4 hover:bg-white/2 group">
      <td className="py-2.5 px-2 w-8">
        <button
          {...attributes}
          {...listeners}
          className="text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical size={14} />
        </button>
      </td>
      <td className="py-2.5 px-2 text-white/40 font-mono text-xs w-10">{index + 1}</td>
      <td className="py-2.5 px-3">
        <span className="font-semibold text-white text-sm">{entry.player?.name}</span>
        <span className="text-white/30 text-xs ml-2">{entry.player?.team}</span>
      </td>
      <td className="py-2.5 px-2">
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-medium ${
            POSITION_COLORS[entry.player?.position] ?? 'bg-white/10 text-white/60'
          }`}
        >
          {entry.player?.position}
        </span>
      </td>
      <td className="py-2.5 px-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onTierChange(entry.id, Math.max(1, entry.tier - 1))}
            className="p-0.5 text-white/20 hover:text-white"
          >
            <ChevronUp size={12} />
          </button>
          <span className="text-xs text-white/60 w-4 text-center">{entry.tier}</span>
          <button
            onClick={() => onTierChange(entry.id, entry.tier + 1)}
            className="p-0.5 text-white/20 hover:text-white"
          >
            <ChevronDown size={12} />
          </button>
        </div>
      </td>
      <td className="py-2.5 px-2 w-8">
        <button
          onClick={() => onNoteEdit(entry.player.id)}
          className="p-1 text-white/20 hover:text-[#FFB800] opacity-0 group-hover:opacity-100 transition-opacity"
          title="Edit notes"
        >
          <Edit2 size={12} />
        </button>
      </td>
      <td className="py-2.5 px-2 w-8">
        <button
          onClick={() => onRemove(entry.id)}
          className="p-1 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove"
        >
          <Trash2 size={12} />
        </button>
      </td>
    </tr>
  )
}

export default function RankingsEditor({
  positions,
  activePos,
  rankingList,
  rankingPlayers: initialPlayers,
  allPlayers,
  unrankedPlayers,
}: Props) {
  const router = useRouter()
  const [entries, setEntries] = useState<RankingPlayerEntry[]>(initialPlayers)
  const [saving, setSaving] = useState(false)
  const [changeSummary, setChangeSummary] = useState('')
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [noteType, setNoteType] = useState<'public' | 'private'>('public')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [newPlayerSearch, setNewPlayerSearch] = useState('')
  const [newPlayerName, setNewPlayerName] = useState('')
  const [newPlayerPos, setNewPlayerPos] = useState('RB')
  const [newPlayerTeam, setNewPlayerTeam] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (over && active.id !== over.id) {
      setEntries((items) => {
        const oldIdx = items.findIndex((i) => i.id === active.id)
        const newIdx = items.findIndex((i) => i.id === over.id)
        const moved = arrayMove(items, oldIdx, newIdx)
        return moved.map((item, i) => ({ ...item, rank: i + 1 }))
      })
    }
  }

  function handleTierChange(id: string, tier: number) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, tier } : e)))
  }

  function handleRemove(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id).map((e, i) => ({ ...e, rank: i + 1 })))
  }

  function openNoteEdit(playerId: string) {
    const player = allPlayers.find((p) => p.id === playerId)
    if (!player) return
    setEditingNote(playerId)
    setNoteText(noteType === 'public' ? player.public_note ?? '' : player.private_note ?? '')
  }

  async function saveNote() {
    if (!editingNote) return
    const res = await fetch(`/api/players/${editingNote}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        noteType === 'public'
          ? { public_note: noteText }
          : { private_note: noteText }
      ),
    })
    if (res.ok) {
      toast.success('Note saved')
      setEditingNote(null)
      router.refresh()
    } else {
      toast.error('Failed to save note')
    }
  }

  async function addUnrankedPlayer(player: Player) {
    if (!rankingList) return
    const newEntry: RankingPlayerEntry = {
      id: `temp-${player.id}`,
      rank: entries.length + 1,
      tier: 1,
      player,
      ranking_list_id: rankingList.id,
    }
    setEntries((prev) => [...prev, newEntry])
    setShowAddPlayer(false)
    setNewPlayerSearch('')
  }

  async function createAndAddPlayer() {
    if (!newPlayerName || !newPlayerTeam) return
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newPlayerName,
        position: newPlayerPos,
        team: newPlayerTeam,
      }),
    })
    if (res.ok) {
      const player = await res.json()
      await addUnrankedPlayer(player)
      setNewPlayerName('')
      setNewPlayerTeam('')
    } else {
      toast.error('Failed to create player')
    }
  }

  async function handleSave() {
    if (!rankingList) return
    setSaving(true)
    try {
      const res = await fetch('/api/rankings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ranking_list_id: rankingList.id,
          change_summary: changeSummary,
          players: entries.map((e) => ({
            player_id: e.player.id,
            rank: e.rank,
            tier: e.tier,
          })),
        }),
      })
      if (res.ok) {
        toast.success('Rankings saved!')
        setChangeSummary('')
        router.refresh()
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Failed to save')
      }
    } finally {
      setSaving(false)
    }
  }

  const filteredUnranked = unrankedPlayers.filter((p) =>
    newPlayerSearch
      ? p.name.toLowerCase().includes(newPlayerSearch.toLowerCase()) ||
        p.team.toLowerCase().includes(newPlayerSearch.toLowerCase())
      : true
  )

  const activeEntry = activeId ? entries.find((e) => e.id === activeId) : null

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Rankings Editor</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFB800] text-black font-semibold text-sm hover:bg-[#FFB800]/90 transition-colors disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? 'Saving...' : 'Save Rankings'}
        </button>
      </div>

      {/* Position tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {positions.map((p) => (
          <button
            key={p}
            onClick={() => router.push(`/admin/rankings?pos=${p}`)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activePos === p
                ? 'bg-[#FFB800] text-black'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Change summary */}
      <div className="mb-4">
        <input
          type="text"
          value={changeSummary}
          onChange={(e) => setChangeSummary(e.target.value)}
          placeholder="Change summary (optional) — shown in the public changelog"
          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/8 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FFB800]/40"
        />
      </div>

      {/* Rankings table */}
      <div className="rounded-xl card-dark border border-white/6 overflow-hidden mb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={entries.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="py-2.5 px-2 w-8" />
                  <th className="text-left py-2.5 px-2 text-xs text-white/30 font-medium w-10">#</th>
                  <th className="text-left py-2.5 px-3 text-xs text-white/30 font-medium">Player</th>
                  <th className="text-left py-2.5 px-2 text-xs text-white/30 font-medium">Pos</th>
                  <th className="text-left py-2.5 px-2 text-xs text-white/30 font-medium">Tier</th>
                  <th className="w-8" />
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <SortableRow
                    key={entry.id}
                    entry={entry}
                    index={i}
                    onTierChange={handleTierChange}
                    onNoteEdit={openNoteEdit}
                    onRemove={handleRemove}
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>

          <DragOverlay>
            {activeEntry && (
              <div className="bg-[#1a1a1a] border border-[#FFB800]/30 rounded-lg px-4 py-2.5 text-sm text-white shadow-xl">
                {activeEntry.player?.name}
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {entries.length === 0 && (
          <div className="py-12 text-center text-white/30 text-sm">
            No players ranked yet. Add players below.
          </div>
        )}
      </div>

      {/* Add players */}
      <div className="rounded-xl card-dark border border-white/6 p-4">
        <button
          onClick={() => setShowAddPlayer(!showAddPlayer)}
          className="flex items-center gap-2 text-sm font-medium text-[#FFB800] hover:text-[#FFB800]/80 transition-colors"
        >
          <UserPlus size={14} />
          {showAddPlayer ? 'Hide' : 'Add Player to Rankings'}
        </button>

        {showAddPlayer && (
          <div className="mt-4 space-y-4">
            {/* Search existing */}
            <div>
              <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">
                Add from player pool
              </p>
              <input
                type="text"
                value={newPlayerSearch}
                onChange={(e) => setNewPlayerSearch(e.target.value)}
                placeholder="Search players..."
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FFB800]/40 mb-2"
              />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredUnranked.slice(0, 20).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addUnrankedPlayer(p)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/70 hover:text-white transition-colors"
                  >
                    <span>{p.name}</span>
                    <span className="text-white/30 text-xs">
                      {p.position} {p.team}
                    </span>
                  </button>
                ))}
                {filteredUnranked.length === 0 && (
                  <p className="text-xs text-white/30 px-3">No unranked players found.</p>
                )}
              </div>
            </div>

            {/* Create new */}
            <div>
              <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">
                Create new player
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Full name"
                  className="col-span-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FFB800]/40"
                />
                <select
                  value={newPlayerPos}
                  onChange={(e) => setNewPlayerPos(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-white text-sm focus:outline-none focus:border-[#FFB800]/40"
                >
                  {['QB', 'RB', 'WR', 'TE', 'K', 'DST'].map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newPlayerTeam}
                  onChange={(e) => setNewPlayerTeam(e.target.value)}
                  placeholder="Team (e.g. KC)"
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FFB800]/40"
                />
              </div>
              <button
                onClick={createAndAddPlayer}
                disabled={!newPlayerName || !newPlayerTeam}
                className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 text-sm disabled:opacity-30 transition-colors"
              >
                <Plus size={13} /> Create & Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Note editor modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1a1a1a] border border-white/8 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Edit Note</h3>
              <button
                onClick={() => setEditingNote(null)}
                className="text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setNoteType('public')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  noteType === 'public'
                    ? 'bg-[#FFB800]/15 text-[#FFB800]'
                    : 'bg-white/5 text-white/40'
                }`}
              >
                Public Note
              </button>
              <button
                onClick={() => setNoteType('private')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  noteType === 'private'
                    ? 'bg-[#8B2FC9]/15 text-[#8B2FC9]'
                    : 'bg-white/5 text-white/40'
                }`}
              >
                Private Note
              </button>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              placeholder={noteType === 'public' ? 'Visible to all users on rankings page...' : 'Admin-only note...'}
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/8 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FFB800]/40 resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingNote(null)}
                className="px-4 py-2 rounded-lg bg-white/5 text-white/50 text-sm hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFB800] text-black font-semibold text-sm"
              >
                <Check size={13} /> Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
