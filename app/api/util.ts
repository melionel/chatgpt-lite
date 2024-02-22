// fetchUtils.ts
export const fetchWithRetry = async (url: string, options: RequestInit, maxAttempts: number = 3, delay: number = 1000): Promise<Response> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
            console.log(response.status)
            if (response.status >= 406) {
                const err = await response.text()
                throw new Error(`Server error: ${response.status}: ${err}`);
            }
            return response;
        } catch (error) {
            console.error(`Attempt ${attempt} failed: ${error}`);
            if (attempt < maxAttempts) {
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
    throw new Error('Unexpected loop exit');
};
