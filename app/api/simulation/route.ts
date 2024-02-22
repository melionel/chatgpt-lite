import { NextRequest, NextResponse } from 'next/server'
import { fetchWithRetry } from '../util';

export interface Message {
    role: string
    content: string
}

export interface SimChatHistoryItem {
    inputs: {
        question: string;
    };
    outputs: {
        answer: string;
    };
}

function constructChatHistory(objects: Message[]): SimChatHistoryItem[] {
    const transformedArray: SimChatHistoryItem[] = [];
    for (let i = 0; i < objects.length - 1; i++) {
        if (objects[i].role === 'user') {
            const nextObject = objects[i + 1];
            const rBContent = nextObject !== undefined && nextObject.role === 'assistant' ? nextObject.content : '';

            transformedArray.push({
                inputs: { question: objects[i].content },
                outputs: { answer: rBContent }
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
        const { messages } = (await req.json()) as {
            messages: Message[]
        }

        const chat_history = constructChatHistory(messages)
        return getSimulationResponse(chat_history)
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

const getSimulationResponse = async (
    chat_history: SimChatHistoryItem[]
) => {
    let pfChatbotSimEndpoint = process.env.PF_SIM_ENDPOINT

    if (pfChatbotSimEndpoint !== undefined) {
        console.log("The value of PF_SIM_ENDPOINT is:", pfChatbotSimEndpoint)
        pfChatbotSimEndpoint = pfChatbotSimEndpoint + 'score'
    } else {
        console.log("PF_SIM_ENDPOINT is not defined, use default");
        pfChatbotSimEndpoint = 'https://simulation-flow.eastus.inference.ml.azure.com/score'
    }

    let pfChatbotSimKey = process.env.PF_SIM_KEY
    if (pfChatbotSimKey !== undefined) {
        // console.log("The value of PF_SIM_KEY is:", pfChatbotSimKey)
    } else {
        console.log("PF_SIM_KEY is not defined, use default");
        pfChatbotSimKey = ''
    }

    const res = await fetchWithRetry(pfChatbotSimEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': pfChatbotSimKey,
        },
        body: JSON.stringify({
            chat_history: chat_history,
            question_count: 3
        })
    })

    if (res.status !== 200) {
        const statusText = res.statusText
        const responseBody = await res.text()
        console.error(responseBody)
        throw new Error(
            `The pfChatbotSimEndpoint has encountered an error with a status code of ${res.status} ${statusText}: ${responseBody}`
        )
    }
    const data = await res.json()
    return NextResponse.json({ data })
}
