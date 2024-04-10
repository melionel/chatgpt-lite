import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'
import { NextRequest, NextResponse } from 'next/server'
import { fetchWithRetry } from '../util'

export interface Message {
    role: string
    content: string
}

export interface ChatHistoryItem {
    inputs: {
        question: string;
    };
    outputs: {
        output: string;
    };
}

function constructChatHistory(objects: Message[]): ChatHistoryItem[] {
    const transformedArray: ChatHistoryItem[] = [];
    for (let i = 0; i < objects.length - 1; i++) {
        if (objects[i].role === 'user') {
            const nextObject = objects[i + 1];
            const rBContent = nextObject !== undefined && nextObject.role === 'assistant' ? nextObject.content : '';

            transformedArray.push({
                inputs: { question: objects[i].content },
                outputs: { output: rBContent }
            });

            if (nextObject.role === 'assistant') {
                i = i + 1
            }
        }
    }

    return transformedArray;
}

export async function POST(req: NextRequest) {
    try {
        const { chat_id, messages, input, model } = (await req.json()) as {
            chat_id: string
            messages: Message[]
            input: string
            model: string
        }

        const chat_history = constructChatHistory(messages)
        const stream = await getPfChatbotStream(chat_id, input, chat_history, model)
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
    input: string,
    chat_history: ChatHistoryItem[],
    model: string
) => {

    let pfChatbotEndpoint = process.env.PF_COPILOT_ENDPOINT

    if (pfChatbotEndpoint !== undefined) {
        console.log("The value of PF_COPILOT_ENDPOINT is:", pfChatbotEndpoint)
        pfChatbotEndpoint = pfChatbotEndpoint + 'score'
    } else {
        console.log("PF_COPILOT_ENDPOINT is not defined, use default");
        pfChatbotEndpoint = 'https://pf-copilot-sea.southeastasia.inference.ml.azure.com/score'
    }

    let pfChatbotKey = process.env.PF_COPILOT_KEY
    if (pfChatbotKey !== undefined) {
        // console.log("The value of PF_COPILOT_KEY is:", pfChatbotKey)
    } else {
        console.log("PF_COPILOT_KEY is not defined, use default");
        pfChatbotKey = ''
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    console.log(input, chat_id, model)
    const res = await fetchWithRetry(pfChatbotEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'Authorization': pfChatbotKey,
        },
        body: JSON.stringify({
            question: input,
            chat_history: chat_history,
            model: model
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
            let isStreamClosed = false // Flag to track stream state

            const onParse = (event: ParsedEvent | ReconnectInterval) => {
                if (isStreamClosed) return

                if (event.type === 'event') {
                    const data = event.data
                    if (data === '[DONE]') {
                        controller.close()
                        console.log('[DONE]')
                        return
                    }
                    try {
                        const json = JSON.parse(data)
                        if (json.output !== undefined) {
                            const text = json.output
                            const queue = encoder.encode(text)
                            controller.enqueue(queue)
                        }
                    } catch (e) {
                        console.log(e)
                        if (!isStreamClosed) { // Only call error if the stream isn't closed
                            controller.error(e)
                            isStreamClosed = true // Consider stream closed after an error
                        }
                    };
                }
            }

            const parser = createParser(onParse)

            for await (const chunk of res.body as any) {
                if (isStreamClosed) break

                const str = decoder.decode(chunk)
                parser.feed(str)
            }

            if (!isStreamClosed) { // Ensure stream is closed properly if not already done
                controller.close()
                isStreamClosed = true
            }
        }
    })
}
