import { useState } from 'react'

type EmojiData = {
  emoji: string
  keywords: string[]
}

type Props = {
  onSelect: (emoji: string) => void
  onClose?: () => void
}

type EmojiCategory = {
  [key: string]: Array<{
    emoji: string
    keywords: string[]
  }>
}

const EMOJI_CATEGORIES: Record<string, EmojiData[]> = {
  'Sport & Bewegung': [
    { emoji: '🏃', keywords: ['laufen', 'rennen', 'joggen'] },
    { emoji: '🏃‍♀️', keywords: ['laufen', 'rennen', 'joggen', 'frau'] },
    { emoji: '🚶', keywords: ['gehen', 'spazieren', 'wandern'] },
    { emoji: '🚶‍♀️', keywords: ['gehen', 'spazieren', 'wandern', 'frau'] },
    { emoji: '🏋️', keywords: ['fitness', 'gewichte', 'krafttraining'] },
    { emoji: '🏋️‍♀️', keywords: ['fitness', 'gewichte', 'krafttraining', 'frau'] },
    { emoji: '🚴', keywords: ['fahrrad', 'radfahren', 'cycling'] },
    { emoji: '🚴‍♀️', keywords: ['fahrrad', 'radfahren', 'cycling', 'frau'] },
    { emoji: '🧘', keywords: ['meditation', 'entspannung', 'ruhe'] },
    { emoji: '🧘‍♀️', keywords: ['meditation', 'entspannung', 'ruhe', 'frau'] },
    { emoji: '��', keywords: ['schwimmen', 'tauchen', 'baden'] },
    { emoji: '🏊‍♀️', keywords: ['schwimmen', 'tauchen', 'baden', 'frau'] },
    { emoji: '🤸', keywords: ['tanzen', 'bewegen', 'bewegung'] },
    { emoji: '🤸‍♀️', keywords: ['tanzen', 'bewegen', 'bewegung', 'frau'] },
    { emoji: '🏌️', keywords: ['golfen', 'golfspielen', 'golf'] },
    { emoji: '🏌️‍♀️', keywords: ['golfen', 'golfspielen', 'golf', 'frau'] },
    { emoji: '🚣', keywords: ['fahrrad', 'radfahren', 'cycling'] },
    { emoji: '🚣‍♀️', keywords: ['fahrrad', 'radfahren', 'cycling', 'frau'] },
    { emoji: '🧗', keywords: ['klettern', 'klettern', 'klettern'] },
    { emoji: '🧗‍♀️', keywords: ['klettern', 'klettern', 'klettern', 'frau'] },
    { emoji: '⛹️', keywords: ['basketball', 'basketball', 'basketball'] },
    { emoji: '⛹️‍♀️', keywords: ['basketball', 'basketball', 'basketball', 'frau'] },
    { emoji: '🤾', keywords: ['handball', 'handball', 'handball'] },
    { emoji: '🤾‍♀️', keywords: ['handball', 'handball', 'handball', 'frau'] },
    { emoji: '🤽', keywords: ['wasserball', 'wasserball', 'wasserball'] },
    { emoji: '🤽‍♀️', keywords: ['wasserball', 'wasserball', 'wasserball', 'frau'] },
    { emoji: '🤺', keywords: ['schwert', 'schwert', 'schwert'] },
    { emoji: '🏇', keywords: ['rennen', 'rennen', 'rennen'] },
    { emoji: '🏂', keywords: ['schneemenschen', 'schneemenschen', 'schneemenschen'] },
    { emoji: '🪂', keywords: ['fliegen', 'fliegen', 'fliegen'] }
  ],
  'Ballsport': [
    { emoji: '⚽', keywords: ['fussball', 'fussball', 'fussball'] },
    { emoji: '🏀', keywords: ['basketball', 'basketball', 'basketball'] },
    { emoji: '🏈', keywords: ['americanfootball', 'americanfootball', 'americanfootball'] },
    { emoji: '⚾', keywords: ['baseball', 'baseball', 'baseball'] },
    { emoji: '🥎', keywords: ['softball', 'softball', 'softball'] },
    { emoji: '🎾', keywords: ['tennis', 'tennis', 'tennis'] },
    { emoji: '🏐', keywords: ['basketball', 'basketball', 'basketball'] },
    { emoji: '🏉', keywords: ['rugby', 'rugby', 'rugby'] },
    { emoji: '🥏', keywords: ['bowling', 'bowling', 'bowling'] },
    { emoji: '🎱', keywords: ['billard', 'billard', 'billard'] }
  ],
  'Andere Sportarten': [
    { emoji: '🏸', keywords: ['badminton', 'badminton', 'badminton'] },
    { emoji: '🏓', keywords: ['pingpong', 'pingpong', 'pingpong'] },
    { emoji: '��', keywords: ['fussball', 'fussball', 'fussball'] },
    { emoji: '🏒', keywords: ['lacrosse', 'lacrosse', 'lacrosse'] },
    { emoji: '🥍', keywords: ['hockey', 'hockey', 'hockey'] },
    { emoji: '🏹', keywords: ['schießen', 'schießen', 'schießen'] },
    { emoji: '🎯', keywords: ['pfeil', 'pfeil', 'pfeil'] },
    { emoji: '🥊', keywords: ['boxen', 'boxen', 'boxen'] },
    { emoji: '🥋', keywords: ['kampf', 'kampf', 'kampf'] },
    { emoji: '🎳', keywords: ['bowling', 'bowling', 'bowling'] },
    { emoji: '🏆', keywords: ['gewinn', 'gewinn', 'gewinn'] }
  ],
  'Freizeit & Hobby': [
    { emoji: '🎨', keywords: ['malen', 'malen', 'malen'] },
    { emoji: '🎮', keywords: ['spielen', 'spielen', 'spielen'] },
    { emoji: '🎲', keywords: ['würfeln', 'würfeln', 'würfeln'] },
    { emoji: '📚', keywords: ['lesen', 'lesen', 'lesen'] },
    { emoji: '✍️', keywords: ['zeichnen', 'zeichnen', 'zeichnen'] },
    { emoji: '🎵', keywords: ['singen', 'singen', 'singen'] },
    { emoji: '🎸', keywords: ['gitarre', 'gitarre', 'gitarre'] },
    { emoji: '🎹', keywords: ['piano', 'piano', 'piano'] },
    { emoji: '🎭', keywords: ['theater', 'theater', 'theater'] },
    { emoji: '🎪', keywords: ['fest', 'fest', 'fest'] },
    { emoji: '🎬', keywords: ['film', 'film', 'film'] },
    { emoji: '🎻', keywords: ['violine', 'violine', 'violine'] },
    { emoji: '��', keywords: ['trompete', 'trompete', 'trompete'] },
    { emoji: '🪗', keywords: ['klarinette', 'klarinette', 'klarinette'] },
    { emoji: '🎧', keywords: ['kopfhoerer', 'kopfhoerer', 'kopfhoerer'] },
    { emoji: '🎤', keywords: ['singen', 'singen', 'singen'] },
    { emoji: '🎯', keywords: ['spielen', 'spielen', 'spielen'] },
    { emoji: '🎳', keywords: ['spielen', 'spielen', 'spielen'] },
    { emoji: '🎰', keywords: ['poker', 'poker', 'poker'] },
    { emoji: '🛹', keywords: ['skateboard', 'skateboard', 'skateboard'] },
    { emoji: '🛼', keywords: ['roller', 'roller', 'roller'] },
    { emoji: '🎪', keywords: ['fest', 'fest', 'fest'] },
    { emoji: '🎡', keywords: ['karussell', 'karussell', 'karussell'] },
    { emoji: '🎢', keywords: ['karussell', 'karussell', 'karussell'] },
    { emoji: '🎣', keywords: ['angeln', 'angeln', 'angeln'] },
    { emoji: '⛺', keywords: ['zelt', 'zelt', 'zelt'] },
    { emoji: '🏕️', keywords: ['camping', 'camping', 'camping'] },
    { emoji: '🏖️', keywords: ['strand', 'strand', 'strand'] },
    { emoji: '🏂', keywords: ['schnee', 'schnee', 'schnee'] },
    { emoji: '⛷️', keywords: ['ski', 'ski', 'ski'] },
    { emoji: '🎿', keywords: ['ski', 'ski', 'ski'] }
  ],
  'Gesundheit & Wellness': [
    { emoji: '🧘', keywords: ['meditation', 'entspannung', 'ruhe'] },
    { emoji: '🧘‍♀️', keywords: ['meditation', 'entspannung', 'ruhe', 'frau'] },
    { emoji: '💆', keywords: ['massage', 'massage', 'massage'] },
    { emoji: '💆‍♀️', keywords: ['massage', 'massage', 'massage', 'frau'] },
    { emoji: '💇', keywords: ['friseur', 'friseur', 'friseur'] },
    { emoji: '💇‍♀️', keywords: ['friseur', 'friseur', 'friseur', 'frau'] },
    { emoji: '🥗', keywords: ['salat', 'salat', 'salat'] },
    { emoji: '🥑', keywords: ['avocado', 'avocado', 'avocado'] },
    { emoji: '🍎', keywords: ['apfel', 'apfel', 'apfel'] },
    { emoji: '💪', keywords: ['muskel', 'muskel', 'muskel'] },
    { emoji: '🧠', keywords: ['hirn', 'hirn', 'hirn'] },
    { emoji: '❤️', keywords: ['liebe', 'liebe', 'liebe'] },
    { emoji: '🫁', keywords: ['atmung', 'atmung', 'atmung'] },
    { emoji: '🦿', keywords: ['hand', 'hand', 'hand'] },
    { emoji: '🦾', keywords: ['arm', 'arm', 'arm'] },
    { emoji: '🌱', keywords: ['pflanze', 'pflanze', 'pflanze'] },
    { emoji: '🥦', keywords: ['zwiebel', 'zwiebel', 'zwiebel'] },
    { emoji: '💊', keywords: ['tablette', 'tablette', 'tablette'] },
    { emoji: '💉', keywords: ['injektion', 'injektion', 'injektion'] },
    { emoji: '🧬', keywords: ['dna', 'dna', 'dna'] },
    { emoji: '🩺', keywords: ['stethoskop', 'stethoskop', 'stethoskop'] },
    { emoji: '⚕️', keywords: ['arzt', 'arzt', 'arzt'] }
  ]
}

const EmojiPicker = ({ onSelect, onClose }: Props) => {
  const [search, setSearch] = useState('')
  
  const filteredEmojis = search
    ? Object.values(EMOJI_CATEGORIES)
        .flat()
        .filter(emojiData => {
          const searchLower = search.toLowerCase()
          return emojiData.keywords.some(keyword => 
            keyword.toLowerCase().includes(searchLower)
          )
        })
    : null

  return (
    <div className="absolute z-50 mt-1 w-80 bg-white rounded-lg shadow-lg border p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Suche (z.B. laufen, fitness, sport)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded"
          autoFocus
        />
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {filteredEmojis ? (
          <div className="grid grid-cols-6 gap-2">
            {filteredEmojis.map((emojiData, index) => (
              <button
                key={`${emojiData.emoji}-${index}`}
                onClick={() => onSelect(emojiData.emoji)}
                className="text-2xl p-2 hover:bg-gray-100 rounded"
              >
                {emojiData.emoji}
              </button>
            ))}
          </div>
        ) : (
          Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
            <div key={category} className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">{category}</h3>
              <div className="grid grid-cols-6 gap-2">
                {emojis.map((emojiData, index) => (
                  <button
                    key={`${emojiData.emoji}-${index}`}
                    onClick={() => onSelect(emojiData.emoji)}
                    className="text-2xl p-2 hover:bg-gray-100 rounded"
                  >
                    {emojiData.emoji}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default EmojiPicker 