export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'FLEX' | 'K' | 'DST'

export interface Tag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image_url: string | null
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  tags?: Tag[]
}

export interface ArticleWithTags extends Article {
  tags: Tag[]
}

export interface Player {
  id: string
  name: string
  position: Position
  team: string
  bye_week: number | null
  rank: number
  tier: number
  underdog_id: string | null
  public_note: string | null
  private_note: string | null
  created_at: string
  updated_at: string
}

export interface RankingList {
  id: string
  position: Position | 'OVERALL'
  name: string
  created_at: string
  updated_at: string
}

export interface RankingVersion {
  id: string
  ranking_list_id: string
  version_number: number
  change_summary: string | null
  admin_user: string | null
  created_at: string
  ranking_list?: RankingList
  players?: RankingVersionPlayer[]
}

export interface RankingVersionPlayer {
  id: string
  ranking_version_id: string
  player_id: string
  rank: number
  tier: number
  previous_rank: number | null
  created_at: string
  player?: Player
}

export interface RankingPlayer {
  id: string
  ranking_list_id: string
  player_id: string
  rank: number
  tier: number
  created_at: string
  updated_at: string
  player?: Player
}

export interface MediaAsset {
  id: string
  name: string
  path: string
  url: string
  size: number
  mime_type: string
  folder: string | null
  created_at: string
}

export type RankingMovement = 'up' | 'down' | 'same' | 'new' | 'dropped'

export interface PlayerWithMovement extends Player {
  movement: RankingMovement
  movement_delta: number
}

export interface TierGroup {
  tier: number
  players: PlayerWithMovement[]
}

export interface ExportPlayer {
  rank: number
  player_name: string
  team: string
  position: string
  tier: number
  underdog_id: string | null
}

export interface PaginatedArticles {
  articles: ArticleWithTags[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
