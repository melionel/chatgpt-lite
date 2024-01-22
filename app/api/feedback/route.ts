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

        let pfFeedbackEndpoint = process.env.PF_COPILOT_FEEDBACK_ENDPOINT

        if (pfFeedbackEndpoint !== undefined) {
            console.log("The value of PF_COPILOT_FEEDBACK_ENDPOINT is:", pfFeedbackEndpoint)
        } else {
            console.log("PF_COPILOT_FEEDBACK_ENDPOINT is not defined, use default");
            pfFeedbackEndpoint = 'https://promptflow-chatbot-feedback.eastus.inference.ml.azure.com/score'
        }

        let pfFeedbackKey = process.env.PF_COPILOT_FEEDBACK_KEY
        if (pfFeedbackKey !== undefined) {
            console.log("The value of PF_COPILOT_FEEDBACK_KEY is:", pfFeedbackKey)
        } else {
            console.log("PF_COPILOT_FEEDBACK_KEY is not defined, use default");
            pfFeedbackKey = ''
        }

        const res = await fetch(pfFeedbackEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': pfFeedbackKey,
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
