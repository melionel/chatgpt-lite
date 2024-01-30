import React, { useContext, useEffect } from 'react'

import { Button, Dialog, Flex, TextArea } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'

import { ChatContext } from '@/components'
import './feedbackDialog.scss'

const FeedbackDialog = () => {
    const { currentFeedback, onSubmitFeedback, onSetCurrentFeedback, onCloseFeedbackDialog } = useContext(ChatContext)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm()

    const formSubmit = handleSubmit((values: any) => {
        onSubmitFeedback?.(values?.comment)
        onSetCurrentFeedback?.(undefined)
        reset()
    })

    const isCurrentPositive = currentFeedback !== undefined && currentFeedback.feedback === "thumbsUp"
    const commentPlaceHolder = isCurrentPositive ? "What do you like about the response?" : "What was the issue of the response? How could it be improved?"

    return (
        <Dialog.Root open={currentFeedback !== undefined}>
            <Dialog.Content size="4">
                <Dialog.Title>Provide additional feedabck</Dialog.Title>
                <Dialog.Description size="2" mb="4"></Dialog.Description>
                <form onSubmit={formSubmit}>
                    <Flex direction="column" gap="3">
                        <TextArea placeholder={commentPlaceHolder} rows={7} {...register('comment', { required: false })} />
                    </Flex>

                    <Flex gap="3" mt="4" justify="end">
                        {/* <Dialog.Close>
                            <Button variant="soft" type="button" color="gray" onClick={onCloseFeedbackDialog}>
                                Cancel
                            </Button>
                        </Dialog.Close> */}
                        <Dialog.Close>
                            <Button variant="soft" type="submit" className="feedback-button">
                                Submit feedback
                            </Button>
                        </Dialog.Close>
                    </Flex>
                </form>
            </Dialog.Content>
        </Dialog.Root >
    )
};

export default FeedbackDialog