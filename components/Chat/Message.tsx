'use client'

import { useContext, useState } from 'react'
import { Avatar, Box, Flex, Grid, IconButton } from '@radix-ui/themes'
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi'
import { SiOpenai } from 'react-icons/si'
import { HiUser } from 'react-icons/hi'
import { Markdown } from '@/components'
import ChatContext from './chatContext'
import { Chat, ChatMessage } from './interface'

export interface MessageProps {
  message: ChatMessage,
  index?: number,
  conversation?: ChatMessage[]
}

const Message = (props: MessageProps) => {
  const { currentChat } = useContext(ChatContext)
  const { role, content, feedback } = props.message
  const isUser = role === 'user'
  let hasFeedback = feedback !== undefined
  const [isHovered, setIsHovered] = useState(false);

  const onThumbUp = async () => {
    props.message.feedback = "thumbUp"
    hasFeedback = true
    await postFeedback(currentChat!.id, "", "thumbUp")
  }

  const onThumbDown = async () => {
    props.message.feedback = "thumbDown"
    hasFeedback = true
    await postFeedback(currentChat!.id, "", "thumbDown")
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

  const postFeedback = async (chat_id: string, comment: string, feedback: string) => {
    const url = '/api/feedback'
    const conversation = gatherConversations()
    const data = {
      chat_id,
      comment,
      feedback,
      conversation
    }

    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  }

  return (
    <Flex direction="column" gap="1" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Flex gap="4" className="mb-5">
        <Avatar
          fallback={isUser ? <HiUser className="h-4 w-4" /> : <SiOpenai className="h-4 w-4" />}
          color={isUser ? undefined : 'green'}
          size="2"
          radius="full"
        />
        <Flex direction="column" gap="2" className="flex-1 pt-1 break-all">
          <Markdown>{content}</Markdown>
          {!isUser && isHovered && !hasFeedback && (
            <Flex gap="2" align="center">
              <IconButton
                variant="soft"
                color="gray"
                size="1"
                className="rounded-xl"
                onClick={onThumbUp}
              >
                <FiThumbsUp className="h-4 w-4" />
              </IconButton>
              <IconButton
                variant="soft"
                color="gray"
                size="1"
                className="rounded-xl"
                onClick={onThumbDown}
              >
                <FiThumbsDown className="h-4 w-4" />
              </IconButton>
            </Flex>
          )}
          {hasFeedback && (
            <Flex gap="2" align="center">
              <IconButton
                variant="soft"
                color={feedback === "thumbUp" ? "red" : "gray"}
                size="1"
                className="rounded-xl"
              >
                <FiThumbsUp className="h-4 w-4" />
              </IconButton>
              <IconButton
                variant="soft"
                color={feedback === "thumbDown" ? "blue" : "gray"}
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
