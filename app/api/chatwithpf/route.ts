import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'
import { NextRequest, NextResponse } from 'next/server'
export interface Message {
    role: string
    content: string
}

export async function POST(req: NextRequest) {
    try {
        const { chat_id, messages, input } = (await req.json()) as {
            chat_id: string
            messages: Message[]
            input: string
        }

        const stream = await getPfChatbotStream(chat_id, input)
        return new NextResponse(stream, {
            headers: { 'Content-Type': 'text/event-stream' }
        })
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

const getPfChatbotStream = async (
    chat_id: string,
    input: string
) => {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const pfChatbotEndpoint = "https://pfchatbot-webapp.azurewebsites.net/chatstream"
    console.log(input, chat_id)
    const res = await fetch(pfChatbotEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            question: input,
            conversation_id: chat_id,
            chat_history: []
        })
    })

    if (res.status !== 200) {
        const statusText = res.statusText
        const responseBody = await res.text()
        console.error(responseBody)
        throw new Error(
            `The pfChatbotEndpoint has encountered an error with a status code of ${res.status} ${statusText}: ${responseBody}`
        )
    }

    return new ReadableStream({
        async start(controller) {
            const onParse = (event: ParsedEvent | ReconnectInterval) => {
                if (event.type === 'event') {
                    const data = event.data
                    if (data === '[DONE]') {
                        controller.close()
                        return
                    }
                    data.split("data: ").forEach(element => {
                        try {
                            const json = JSON.parse(element)
                            if (json.output !== undefined) {
                                const text = json.output
                                const queue = encoder.encode(text)
                                controller.enqueue(queue)
                            }
                        } catch (e) {
                            console.log(element)
                            controller.error(e)
                        }
                    });
                }
            }

            const parser = createParser(onParse)

            for await (const chunk of res.body as any) {
                const str = decoder.decode(chunk)
                parser.feed(str)
            }
            controller.close()
        }
    })
}
