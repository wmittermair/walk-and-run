import { useState } from 'react'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

type Props = {
  imageUrl: string
  onClose: () => void
  onSave: (croppedImage: Blob) => Promise<void>
}

export default function ImageCropModal({ imageUrl, onClose, onSave }: Props) {
  const [crop, setCrop] = useState<Crop>()
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null)
  const [loading, setLoading] = useState(false)

  const getCroppedImg = async (image: HTMLImageElement, crop: Crop): Promise<Blob> => {
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const pixelRatio = window.devicePixelRatio
    
    canvas.width = Math.floor(crop.width * scaleX)
    canvas.height = Math.floor(crop.height * scaleY)

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('No 2d context')
    }

    ctx.scale(pixelRatio, pixelRatio)
    ctx.imageSmoothingQuality = 'high'

    const cropX = crop.x * scaleX
    const cropY = crop.y * scaleY

    ctx.drawImage(
      image,
      cropX,
      cropY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    )

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error('Canvas is empty')
          resolve(blob)
        },
        'image/jpeg',
        1
      )
    })
  }

  const handleSave = async () => {
    if (!imageRef || !crop.width || !crop.height) return
    
    try {
      setLoading(true)
      const croppedImage = await getCroppedImg(imageRef, crop)
      await onSave(croppedImage)
      onClose()
    } catch (error) {
      console.error('Error cropping image:', error)
      alert('Fehler beim Bearbeiten des Bildes')
    } finally {
      setLoading(false)
    }
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const size = Math.min(width, height) * 0.8
    const x = (width - size) / 2
    const y = (height - size) / 2

    setCrop({
      unit: 'px',
      width: size,
      height: size,
      x: x,
      y: y,
      aspect: 1
    })

    setImageRef(e.currentTarget)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Profilbild bearbeiten</h2>
        <div className="mb-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            aspect={1}
            circularCrop
            keepSelection
          >
            <img
              src={imageUrl}
              onLoad={onImageLoad}
              className="max-h-[60vh] mx-auto"
            />
          </ReactCrop>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Wird gespeichert...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
} 