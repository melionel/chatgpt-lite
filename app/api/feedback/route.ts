import { NextRequest, NextResponse } from 'next/server'
export interface Message {
    role: string
    content: string
}

export async function POST(req: NextRequest) {
    try {
        const { chat_id, comment, feedback, conversation } = (await req.json()) as {
            chat_id: string
            comment: string
            feedback: string
            conversation: object[]
        }

        const pfFeedbackEndpoint = "https://promptflow-chatbot-feedback.eastus.inference.ml.azure.com/score"
        const res = await fetch(pfFeedbackEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer m1FvTpE34nhlSbly8Kmh4oW3oWQ9ONPE',
            },
            body: JSON.stringify({
                comment: comment,
                conversation_id: chat_id,
                feedback: feedback,
                conversation: conversation
            })
        })

        if (res.status !== 200) {
            const statusText = res.statusText
            const responseBody = await res.text()
            console.error(responseBody)
            throw new Error(
                `The pfFeedbackEndpoint has encountered an error with a status code of ${res.status} ${statusText}: ${responseBody}`
            )
        }
        const data = await res.json()
        return NextResponse.json({ data })
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
