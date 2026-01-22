import axios from "axios";
import { JUDGE0_URL } from "../config";

interface inputs {
  sourceCode: string,
  languageId: number
  stdin: string
}
export async function runCode({ sourceCode, languageId, stdin }: inputs) {
  try {
    const submitResponse = await fetch(
      "http://localhost:2358/submissions?base64_encoded=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          source_code: Buffer.from(sourceCode).toString('base64'),
          language_id: languageId,
          stdin: Buffer.from(stdin).toString('base64')
        })
      }
    );

    // @ts-ignore
    const { token } = await submitResponse.json();
    console.log('Submission token:', token);

    let result: any;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 500));

      const resultResponse = await fetch(
        `http://localhost:2358/submissions/${token}?fields=*`
      );
      result = await resultResponse.json();

      console.log(`Attempt ${attempts + 1}, Status:`, result.status.description);

      if (result.status.id > 2) {
        break;
      }
      attempts++;
    }

    const fieldsToCheck = ['stdout', 'stderr', 'compile_output', 'message'];

    fieldsToCheck.forEach(field => {
      if (result[field] && typeof result[field] === 'string') {
        try {
          result[field] = Buffer.from(result[field], 'base64').toString('utf-8');
        } catch (e) {
          console.error(`Failed to decode ${field}:`, e);
        }
      }
    });

    console.log('Final result:', JSON.stringify(result, null, 2));
    return result;

  } catch (error) {
    console.error('Error in runCode:', error);
    throw error;
  }
}
