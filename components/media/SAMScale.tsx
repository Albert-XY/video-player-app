import React, { useState } from 'react'

interface SAMScaleProps {
  onSubmit: (valence: number, arousal: number) => void
}

export default function SAMScale({ onSubmit }: SAMScaleProps) {
  const [valence, setValence] = useState<number | null>(null)
  const [arousal, setArousal] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (valence !== null && arousal !== null) {
      onSubmit(valence, arousal)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Valence (Pleasure)</label>
        <input
          type="range"
          min="1"
          max="9"
          value={valence || 5}
          onChange={(e) => setValence(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Arousal</label>
        <input
          type="range"
          min="1"
          max="9"
          value={arousal || 5}
          onChange={(e) => setArousal(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        disabled={valence === null || arousal === null}
      >
        Submit Rating
      </button>
    </form>
  )
}

