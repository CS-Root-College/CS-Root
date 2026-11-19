import type { Request, Response } from "express";
import apiError from "../utils/apiError";
import apiResponse from "../utils/apiResponse";
import {
    COMPILER_LANGUAGES,
    type CompilerLanguage,
} from "../config/language";
import { executeCode } from "../service/judge0.service";

const executeCompiler = async (
    req: Request,
    res: Response
) => {
    const {
        language,
        code,
        stdin,
    } = req.body;

    if (!language) {
        throw new apiError(
            400,
            "Please provide a programming language"
        );
    }

    if (!code) {
        throw new apiError(
            400,
            "Please provide source code"
        );
    }

    if (
        !Object.prototype.hasOwnProperty.call(
            COMPILER_LANGUAGES,
            language
        )
    ) {
        throw new apiError(
            400,
            "Unsupported programming language"
        );
    }

    try {
        const result = await executeCode({
            language: language as CompilerLanguage,
            code,
            stdin,
        });

        return res.status(200).json(
            new apiResponse(
                200,
                "Code executed successfully",
                {
                    result: {
                        status: result.status,
                        stdout: result.stdout,
                        stderr: result.stderr,
                        compileOutput:
                            result.compile_output,
                        message: result.message,
                        exitCode: result.exit_code,
                        exitSignal:
                            result.exit_signal,
                        time: result.time,
                        wallTime:
                            result.wall_time,
                        memory: result.memory,
                        token: result.token,
                    },
                }
            )
        );
    } catch (error) {
        console.error(
            "Compiler execution error:",
            error
        );

        throw new apiError(
            502,
            "Unable to execute code"
        );
    }
};

export {
    executeCompiler,
};