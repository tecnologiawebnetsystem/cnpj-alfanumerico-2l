"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Send, Trash2, AtSign } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Comment {
  id: string
  user_id: string
  user_name: string
  user_email: string
  content: string
  created_at: string
  mentions: string[]
}

interface CommentsSectionProps {
  entityType: "task" | "analysis" | "finding"
  entityId: string
}

export function CommentsSection({ entityType, entityId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [showMentions, setShowMentions] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [entityId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?entity_type=${entityType}&entity_id=${entityId}`)
      const data = await response.json()
      setComments(data)
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          content: newComment,
        }),
      })

      if (response.ok) {
        setNewComment("")
        fetchComments()
      }
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      await fetch(`/api/comments/${commentId}`, { method: "DELETE" })
      fetchComments()
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const handleMention = () => {
    setNewComment((prev) => prev + "@")
    setShowMentions(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const renderContent = (content: string, mentions: string[]) => {
    let rendered = content
    mentions?.forEach((mention) => {
      rendered = rendered.replace(`@${mention}`, `<span class="text-blue-600 font-semibold">@${mention}</span>`)
    })
    return <span dangerouslySetInnerHTML={{ __html: rendered }} />
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Comentários ({comments.length})</h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4 mb-6">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-4 bg-muted/50 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(comment.user_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="font-semibold text-sm">{comment.user_name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(comment.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm">{renderContent(comment.content, comment.mentions)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escreva um comentário... Use @ para mencionar alguém"
          className="min-h-24"
          disabled={loading}
        />
        <div className="flex justify-between items-center">
          <Button type="button" variant="ghost" size="sm" onClick={handleMention}>
            <AtSign className="h-4 w-4 mr-2" />
            Mencionar
          </Button>
          <Button type="submit" disabled={loading || !newComment.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Enviar
          </Button>
        </div>
      </form>
    </Card>
  )
}
