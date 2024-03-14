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
            fallback={
              <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_699_15212)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M237 39.0408V461.693C237 469.397 228.655 474.208 221.988 470.346L151.918 429.764C130.306 417.247 117 394.164 117 369.19V148.892C117 123.917 130.306 100.834 151.918 88.3177L237 39.0408Z" fill="url(#paint0_linear_699_15212)" />
                  <path d="M395.075 127.51L237 39V167.541L283.451 192.041L395.075 127.51Z" fill="url(#paint1_linear_699_15212)" />
                  <path d="M395.075 127.51L237 39V167.541L283.451 192.041L395.075 127.51Z" fill="url(#paint2_linear_699_15212)" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M255.5 231.426C255.5 217.184 263.073 204.017 275.382 196.854L395 127.248V216.101C395 241.03 381.742 264.078 360.193 276.611L270.528 328.76C263.861 332.637 255.5 327.828 255.5 320.116L255.5 231.426Z" fill="url(#paint3_linear_699_15212)" />
                </g>
                <defs>
                  <linearGradient id="paint0_linear_699_15212" x1="196.286" y1="183.041" x2="270.786" y2="92.5087" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3272ED" />
                    <stop offset="1" stopColor="#AF7BD6" />
                  </linearGradient>
                  <linearGradient id="paint1_linear_699_15212" x1="457.98" y1="131.313" x2="260.351" y2="133.014" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#DA7ED0" />
                    <stop offset="0.05" stopColor="#B77BD4" />
                    <stop offset="0.11" stopColor="#9079DA" />
                    <stop offset="0.18" stopColor="#6E77DF" />
                    <stop offset="0.25" stopColor="#5175E3" />
                    <stop offset="0.33" stopColor="#3973E7" />
                    <stop offset="0.42" stopColor="#2772E9" />
                    <stop offset="0.54" stopColor="#1A71EB" />
                    <stop offset="0.813361" stopColor="#1371EC" />
                    <stop offset="1" stopColor="#064495" />
                  </linearGradient>
                  <linearGradient id="paint2_linear_699_15212" x1="210.18" y1="4.19164" x2="307.181" y2="175.949" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#712575" />
                    <stop offset="0.09" stopColor="#9A2884" />
                    <stop offset="0.18" stopColor="#BF2C92" />
                    <stop offset="0.27" stopColor="#DA2E9C" />
                    <stop offset="0.34" stopColor="#EB30A2" />
                    <stop offset="0.4" stopColor="#F131A5" />
                    <stop offset="0.5" stopColor="#EC30A3" />
                    <stop offset="0.61" stopColor="#DF2F9E" />
                    <stop offset="0.72" stopColor="#C92D96" />
                    <stop offset="0.83" stopColor="#AA2A8A" />
                    <stop offset="0.95" stopColor="#83267C" />
                    <stop offset="1" stopColor="#712575" />
                  </linearGradient>
                  <linearGradient id="paint3_linear_699_15212" x1="308" y1="260.041" x2="307.043" y2="133.204" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1D5CD6" />
                    <stop offset="1" stopColor="#787BE5" />
                  </linearGradient>
                  <clipPath id="clip0_699_15212">
                    <rect width="512" height="512" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            }
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
