'use client'

import { Avatar, Box, Flex, IconButton, ScrollArea, Text, Select } from '@radix-ui/themes'
import React, { useContext } from 'react'
import cs from 'classnames'
import { SiOpenai } from 'react-icons/si'
import { BiMessageDetail, BiEdit } from 'react-icons/bi'
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
    qaModel,
    onDeleteChat,
    onChangeChat,
    onCreateChat,
    onOpenPersonaPanel,
    onChangeModel
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
            fallback={<BiEdit className="h-6 w-6" />}
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
        <div className="px-4 pb-3">
          <Select.Root defaultValue={qaModel} size="3" onValueChange={(value) => onChangeModel?.(value)}>
            <Select.Trigger variant="ghost" />
            <Select.Content>
              <Select.Group>
                <Select.Label>Choose LLM Model</Select.Label>
                <Select.Item value="gpt-4">gpt-4</Select.Item>
                {/* <Select.Item value="gpt-35-turbo-16k">gpt-35-turbo-16k</Select.Item> */}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </div>
      </Flex>
    </Flex>
  )
}

export default ChatSiderBar
