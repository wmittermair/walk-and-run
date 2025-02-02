import confetti from 'canvas-confetti'

export const playCelebrationAnimation = () => {
  // Konfetti von der linken Seite
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.1, y: 0.6 },
    colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4CAF50', '#64B5F6']
  })

  // Konfetti von der rechten Seite
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.9, y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4CAF50', '#64B5F6']
    })
  }, 250)
} 