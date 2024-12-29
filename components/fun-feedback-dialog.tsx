'use client'

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, MessageCircle, Heart } from 'lucide-react'
import Confetti from 'react-confetti'
import { useState } from 'react'

interface FunFeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction: (action: 'later' | 'share') => void
}

export function FunFeedbackDialog({ open, onOpenChange, onAction }: FunFeedbackDialogProps) {
  const [showConfetti, setShowConfetti] = useState(true)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
            onConfettiComplete={() => setShowConfetti(false)}
          />
        )}
        <div className="flex flex-col items-center text-center p-4">
          <div className="h-16 w-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-teal-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-teal-600 mb-4">Hello Ms. Nazari! 🌟</h2>
          <div className="space-y-4 text-gray-600">
            <p className="text-lg">
              We'd love to hear your creative ideas for this section! 
              <span className="inline-block animate-bounce ml-2">💡</span>
            </p>
            <p className="flex items-center justify-center gap-2">
              Your input is invaluable 
              <Heart className="h-4 w-4 text-red-500 animate-pulse" />
            </p>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => onAction('later')}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Let's Discuss Later
            </Button>
            <Button
              onClick={() => onAction('share')}
              className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Share Ideas Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
