import {
    COMPILER_LANGUAGES,
    type CompilerLanguage,
} from "../config/language";

const JUDGE0_URL = process.env.JUDGE0_URL;

if (!JUDGE0_URL) {
    throw new Error("JUDGE0_URL is not configured");
}

interface Judge0Response {
    stdout: string | null;
    stderr: string | null;
    compile_output: string | null;
    message: string | null;
    exit_code: number | null;
    exit_signal: number | null;
    status: {
        id: number;
        description: string;
    };
    time: string | null;
    wall_time: string | null;
    memory: number | null;
    token: string;
}

interface ExecuteCodeData {
    language: CompilerLanguage;
    code: string;
    stdin?: string;
}

export const executeCode = async (
    data: ExecuteCodeData
): Promise<Judge0Response> => {
    const languageId =
        COMPILER_LANGUAGES[data.language];

    const sourceCode = Buffer
        .from(data.code)
        .toString("base64");

    const stdin = data.stdin
        ? Buffer
              .from(data.stdin)
              .toString("base64")
        : undefined;

    const response = await fetch(
        `${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                source_code: sourceCode,
                language_id: languageId,
                stdin,
                cpu_time_limit: 2,
                memory_limit: 128000,
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Judge0 request failed: ${response.status} ${errorText}`
        );
    }

    const result = await response.json() as Judge0Response;

    return {
        ...result,
        stdout: result.stdout
            ? Buffer.from(result.stdout, "base64").toString("utf-8")
            : null,
        stderr: result.stderr
            ? Buffer.from(result.stderr, "base64").toString("utf-8")
            : null,
        compile_output: result.compile_output
            ? Buffer.from(result.compile_output, "base64").toString("utf-8")
            : null,
        message: result.message
            ? Buffer.from(result.message, "base64").toString("utf-8")
            : null,
    };
};