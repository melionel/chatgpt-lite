'use client'

import { Avatar, Box, Flex, IconButton, ScrollArea, Text } from '@radix-ui/themes'
import React, { useContext } from 'react'
import cs from 'classnames'
import { SiOpenai } from 'react-icons/si'
import { BiMessageDetail } from 'react-icons/bi'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import ChatContext from './chatContext'

import './index.scss'

export const ChatSiderBar = () => {
  const {
    currentChat,
    chatList,
    DefaultPersonas,
    toggleSidebar,
    isChatLoading,
    onDeleteChat,
    onChangeChat,
    onCreateChat,
    onOpenPersonaPanel
  } = useContext(ChatContext)

  const isLastChat = chatList.length === 1

  return (
    <Flex direction="column" className={cs('chart-sider-bar', { show: toggleSidebar })}>
      <Flex className="p-2 h-full overflow-hidden w-64" direction="column" gap="3">
        <Box
          width="auto"
          onClick={() => onCreateChat?.(DefaultPersonas[0])}
          className="bg-token-surface-primary active:scale-95 "
          style={{ pointerEvents: !isChatLoading ? 'auto' : 'none' }}
        >
          <Avatar
            src="https://pfvscextension.blob.core.windows.net/images/icon.svg"
            fallback="PF"
          />
          <Text>New Chat</Text>
        </Box>
        <ScrollArea className="flex-1" type="auto" scrollbars="vertical">
          <Flex direction="column" gap="3">
            {chatList.map((chat) => (
              <Box
                key={chat.id}
                width="auto"
                className={cs('bg-token-surface active:scale-95 truncate', {
                  active: currentChat?.id === chat.id
                })}
                onClick={() => onChangeChat?.(chat)}
                style={{ pointerEvents: !isChatLoading ? 'auto' : 'none' }}
              >
                <Flex gap="2" align="center">
                  <BiMessageDetail className="h-4 w-4" />
                  <Text as="p" className="truncate">
                    {chat.title === undefined ? "empty chat" : chat.title.length > 20 ? chat.title.slice(0, 20) : chat.title}
                  </Text>
                </Flex>
                <IconButton
                  size="2"
                  variant="ghost"
                  color="gray"
                  radius="full"
                  hidden={isLastChat}
                  disabled={isChatLoading}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteChat?.(chat)
                  }}
                >
                  <AiOutlineCloseCircle className="h-4 w-4" />
                </IconButton>
              </Box>
            ))}
          </Flex>
        </ScrollArea>
      </Flex>
    </Flex>
  )
}

export default ChatSiderBar
