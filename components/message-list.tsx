import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslations } from 'next-intl'

export function MessageList() {
  const t = useTranslations('MessageList')

  const messages = [
    {
      id: 1,
      user: "User name 05",
      subject: t('subject'),
      isNew: true,
      date: t('today')
    },
    {
      id: 2,
      user: "User name 05",
      subject: t('subject'),
      isNew: false,
      date: t('yesterday')
    }
  ]

  return (
    <div className="w-[400px] border-r">
      <div className="p-4">
        <h3 className="font-semibold mb-4">{t('unread')}</h3>
        <div className="space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg flex items-start gap-3 ${
                message.isNew ? 'border-2 border-green-600' : 'border'
              }`}
            >
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="font-medium">{message.user}</h4>
                  {message.isNew && (
                    <span className="text-green-600 text-sm">{t('new')}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{message.subject}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
