'use client'

import { useContext, useState } from 'react'
import { Avatar, Box, Flex, Grid, IconButton } from '@radix-ui/themes'
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi'
import { HiUser } from 'react-icons/hi'
import { Markdown } from '@/components'
import ChatContext from './chatContext'
import { Chat, ChatMessage, Feedback } from './interface'
import './index.scss'

export interface MessageProps {
  message: ChatMessage,
  index?: number,
  conversation?: ChatMessage[],
  isLastMessage?: boolean
}

const Message = (props: MessageProps) => {
  const { currentChat, onSetCurrentFeedback } = useContext(ChatContext)
  const { role, content, feedback } = props.message
  const isUser = role === 'user'
  const [isHovered, setIsHovered] = useState(false);
  const isLastMessage = props.isLastMessage

  const onThumbUp = async () => {
    props.message.feedback = "thumbsUp"
    setFeedback(currentChat!.id, "thumbsUp")
  }

  const onThumbDown = async () => {
    props.message.feedback = "thumbsDown"
    setFeedback(currentChat!.id, "thumbsDown")
  }

  const gatherConversations = () => {
    const currentIndex = props.index
    const feedbackConversations = props.conversation?.filter((chat, index) => {
      return currentIndex === undefined || index <= currentIndex
    })

    const result = feedbackConversations?.map(chat => ({
      role: chat.role,
      content: chat.content
    }))

    return result
  }

  const setFeedback = (chat_id: string, feedback: string) => {
    const conversation = gatherConversations()
    const data = {
      id: chat_id,
      feedback: feedback,
      conversation: conversation
    }
    onSetCurrentFeedback?.(data as Feedback)
  }

  return (
    <Flex direction="column" gap="1" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Flex gap="4" className="mb-5">
        {isUser && (
          <Avatar
            fallback={<HiUser className="h-4 w-4" />}
            size="2"
            radius="full"
          />
        )}
        {!isUser && (
          <Avatar
            src="https://pfvscextension.blob.core.windows.net/images/assistant.png"
            fallback="PF"
            color='green'
            size="2"
            radius="full"
          />
        )}
        <Flex direction="column" gap="2" className="flex-1 pt-1 break-all">
          <Markdown>{content}</Markdown>
          {!isUser && feedback === undefined && (
            <Flex gap="2" align="center" style={{ opacity: isHovered && !isLastMessage ? '1' : '0', transition: 'opacity 0.3s ease' }}>
              <IconButton
                variant="soft"
                color={props.message.feedback === "thumbsUp" ? "red" : "gray"}
                size="1"
                className="rounded-xl"
                onClick={onThumbUp}
              >
                <FiThumbsUp className="h-4 w-4" />
              </IconButton>
              <IconButton
                variant="soft"
                color={props.message.feedback === "thumbsDown" ? "blue" : "gray"}
                size="1"
                className="rounded-xl"
                onClick={onThumbDown}
              >
                <FiThumbsDown className="h-4 w-4" />
              </IconButton>
            </Flex>
          )}
          {feedback !== undefined && (
            <Flex gap="2" align="center">
              <IconButton
                variant="soft"
                color={feedback === "thumbsUp" ? "red" : "gray"}
                size="1"
                className="rounded-xl"
              >
                <FiThumbsUp className="h-4 w-4" />
              </IconButton>
              <IconButton
                variant="soft"
                color={feedback === "thumbsDown" ? "blue" : "gray"}
                size="1"
                className="rounded-xl"
              >
                <FiThumbsDown className="h-4 w-4" />
              </IconButton>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}

export default Message
