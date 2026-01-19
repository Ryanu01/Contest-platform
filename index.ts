import express from "express"
import { ContestSchema, DsaSchma, LoginSchema, McqSchema, McqSubmissionSchema, SignInSchema } from "./types"
import bcrypt from "bcrypt"
import { PrismaClient } from "@prisma/client"
import jwt, { type JwtPayload } from "jsonwebtoken"
import JWT_SECRET from "./config"
import { authMiddleware } from "./middleware"
import { date, json } from "zod"
import { tr } from "zod/locales"
const client = new PrismaClient()
const app = express()

app.post("/api/auth/signup", async (req, res) => {
  try {
    const body = req.body
    const { success, data } = SignInSchema.safeParse(body)
    if (!success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST"
      })
    }
    const userAlreadyExisits = await client.user.findFirst({
      where: {
        email: data.email
      }
    })

    if (userAlreadyExisits) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "EMAIL_ALREADY_EXISTS"
      })
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const userDb = await client.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role ?? "contestee",
        created_at: new Date().getTime().toString()
      }
    })

    return res.status(201).json({
      success: true,
      data: {
        id: userDb.id,
        name: userDb.name,
        email: userDb.email,
        role: userDb.role
      },
      "error": null
    })
  } catch (error) {
    return res.status(500).json({
      Error: `${error}`
    })
  }
})

app.post("/api/auth/signin", async (req, res) => {
  try {
    const body = req.body

    const { success, data } = LoginSchema.safeParse(body)
    if (!success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST"
      })
    }

    const userExist = await client.user.findFirst({
      where: {
        email: data.email
      }
    })
    if (!userExist) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "INVALID_CREDENTIALS"
      })
    }

    const isPasswordCorrect = await bcrypt.compare(data.password, userExist.password)

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "INVALID_CREDENTIALS"
      })
    }

    const token = jwt.sign({ userId: userExist.id.toString(), role: userExist.role }, JWT_SECRET)
    return res.status(200).json({
      success: true,
      data: {
        token: token
      },
      error: null
    })
  } catch (error) {
    return res.status(500).json({
      error
    })
  }
})

app.post("/api/contests", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId
    const role = req.role

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST"
      })
    }

    const creatorExist = await client.user.findFirst({
      where: {
        id: userId,
      }
    })

    if (!creatorExist) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "UNAUTHORIZED"
      })
    }

    if (creatorExist.role !== "creator") {
      return res.status(403).json({
        success: false,
        data: null,
        error: "FORBIDDEN"
      })
    }

    const body = req.body

    const { success, data } = ContestSchema.safeParse(body)

    if (!success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST"
      })
    }

    const contestDb = await client.contest.create({
      data: {
        title: data.title,
        description: data.description,
        start_time: new Date(data.startTime),
        end_time: new Date(data.endTime),
        creator_id: creatorExist.id
      }
    })

    return res.status(201).json({
      success: true,
      data: {
        id: contestDb.id,
        title: contestDb.title,
        description: contestDb.description,
        creatorId: contestDb.creator_id,
        startTime: contestDb.start_time,
        endTime: contestDb.end_time
      },
      error: null
    })
  } catch (error) {
    return res.status(500).json({
      error
    })
  }
})

app.get("/api/contests/:contestId", authMiddleware, async (req, res) => {
  try {
    const contestId = Number(req.params.contedId)

    const userExist = await client.user.findFirst({
      where: {
        id: req.userId
      }
    })

    if (!userExist) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "UNAUTHORIZED"
      })
    }

    const contestExist = await client.contest.findFirst({
      where: {
        id: contestId
      }, include: {
        dsaProblems: true,
        mcqQuestions: {
          omit: {
            correct_option_index: true
          }
        }
      }
    })

    if (!contestExist) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "CONTEST_NOT_FOUND"
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        id: contestExist.id,
        title: contestExist.title,
        description: contestExist.description,
        startTime: contestExist.start_time,
        endTime: contestExist.end_time,
        creatorId: contestExist.creator_id,
        mcqs: contestExist.mcqQuestions.map((mcq) => ({
          id: mcq.id,
          questionText: mcq.question_text,
          options: mcq.options,
          points: mcq.points
        })),
        dsaProblems: contestExist.dsaProblems.map((dsa) => ({
          id: dsa.id,
          title: dsa.title,
          description: dsa.description,
          tage: dsa.tags,
          points: dsa.points,
          timeLimit: dsa.time_limit,
          memoryLimit: dsa.memory_limit
        }))
      },
      error: null
    })
  } catch (error) {
    return res.status(500).json({
      error
    })
  }
})

app.post("/api/contests/:contestId/mcq", authMiddleware, async (req, res) => {
  try {
    const contestId = Number(req.params.contestId)

    const userExist = await client.user.findFirst({
      where: {
        id: req.userId
      }
    })


    if (!userExist) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "UNAUTHORIZED"
      })
    }

    if (userExist.role !== "creator") {
      return res.status(403).json({
        success: false,
        data: null,
        error: "FORBIDDEN"
      })
    }

    const body = req.body
    const { success, data } = McqSchema.safeParse(body)

    if (!success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST"
      })
    }

    const contestDb = await client.contest.findFirst({
      where: {
        id: contestId
      }
    })

    if (!contestDb) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "CONTEST_NOT_FOUND"
      })
    }

    const mcqDb = await client.mcqQuestion.create({
      data: {
        contest_id: contestDb.id,
        question_text: data.questionText,
        options: data.options,
        correct_option_index: data.correctOptionIndex,
        points: data.points,
      }
    })

    return res.status(201).json({
      success: true,
      data: {
        id: mcqDb.id,
        contestId: mcqDb.contest_id
      },
      error: null
    })
  } catch (error) {
    return res.status(500).json({
      error
    })
  }
})

app.post("/api/contests/:contestId/mcq/:questionId/submit", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId
    const contestId = req.params.contestId
    const questionId = req.params.questionId

    const userExist = await client.user.findFirst({
      where: {
        id: userId
      }
    })

    if (!userExist) {
      return res.status(401).json({
        "success": false,
        "data": null,
        "error": "UNAUTHORIZED"
      })
    }


    const ifContestAndQuestionExist = await client.$transaction([
      client.contest.findFirst({
        where: {
          id: Number(contestId)
        }
      }),
      client.mcqQuestion.findFirst({
        where: {
          id: Number(questionId),
          contest_id: Number(contestId)
        }
      })
    ])

    if (!ifContestAndQuestionExist[0] || !ifContestAndQuestionExist[1]) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "QUESTION_NOT_FOUND"
      })
    }

    if (userExist.id === ifContestAndQuestionExist[0].creator_id) {
      return res.status(403).json({
        success: false,
        data: null,
        error: "FORBIDDEN"
      })
    }

    if (ifContestAndQuestionExist[0].start_time > new Date() || ifContestAndQuestionExist[0].end_time < new Date()) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "CONTEST_NOT_ACTIVE"
      })
    }


    const existingSubmission = await client.mcqSubmission.findUnique({
      where: {
        user_id_question_id: {
          user_id: userExist.id,
          question_id: Number(questionId)
        }
      }
    })

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "ALREADY_SUBMITTED"
      })
    }

    const body = req.body
    const { success, data } = McqSubmissionSchema.safeParse(body)

    if (!success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST"
      })
    }

    const isCorrect = ifContestAndQuestionExist[1].correct_option_index === data.selectedOptionIndex

    const pointsEarned = isCorrect ? ifContestAndQuestionExist[1].points : 0


    const mcqSubmissionDb = await client.mcqSubmission.create({
      data: {
        user_id: userExist.id,
        question_id: Number(questionId),
        selected_option_index: data.selectedOptionIndex,
        submitted_at: new Date(),
        is_correct: true,
        points_earned: pointsEarned
      }
    })

    return res.status(201).json({
      success: true,
      data: {
        isCorrect: true,
        pointsEarned: mcqSubmissionDb.points_earned
      },
      error: null
    })
  } catch (error) {
    return res.status(500).json({
      error
    })
  }
})


app.post("/api/contests/:contestId/dsa", authMiddleware, async (req, res) => {
  try {

    const contestId = Number(req.params.contestId)

    const contestExist = await client.contest.findFirst({
      where: {
        id: contestId,
        creator_id: req.userId
      }
    })

    if (!contestExist) {

      return res.status(404).json({
        "success": false,
        "data": null,
        "error": "CONTEST_NOT_FOUND"
      })
    }

    const user = await client.user.findFirst({
      where: {
        id: req.userId
      }
    })

    if (!user) {
      return res.status(401).json({
        "success": false,
        "data": null,
        "error": "UNAUTHORIZED"
      })
    }

    const isCreator = await client.contest.findFirst({
      where: {
        creator_id: req.userId,
        id: contestExist.id
      }
    })

    if (!isCreator) {
      return res.status(403).json({
        "success": false,
        "data": null,
        "error": "FORBIDDEN"
      })
    }

    const body = req.body;
    const { success, data } = DsaSchma.safeParse(body)
    if (!success) {
      return res.status(400).json({
        "success": false,
        "data": null,
        "error": "INVALID_REQUEST"
      })
    }

    const dsaDb = await client.dsaProblem.create({
      data: {
        contest_id: contestExist.id,
        title: data.title,
        description: data.description,
        tags: data.tags,
        points: data.points,
        time_limit: data.timeLimit,
        memory_limit: data.memoryLimit,

        testCases: {
          create: data.testCases.map((tc) => ({
            input: tc.input,
            is_hidden: tc.isHeaden,
            expected_output: tc.expectedOutPut
          }))
        }
      },
      include: {
        testCases: true
      }
    })

    return res.status(201).json({
      success: true,
      data: {
        id: dsaDb.id,
        contestId: dsaDb.contest_id
      },
      error: null
    })
  } catch (error) {
    return res.status(500).json({
      error
    })
  }
})

app.get("/api/problems/:problemId", authMiddleware, async (req, res) => {
  try {


    const dsaProblem = await client.$transaction([
      client.dsaProblem.findFirst({
        where: {
          id: Number(req.params.problemId)
        }
      }),

      client.testCase.findMany({
        where: {
          problem_id: Number(req.params.problemId),
          is_hidden: false
        }
      })
    ])

    if (!dsaProblem[0]) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "PROBLEM_NOT_FOUND"
      })
    }

    const isUser = await client.user.findFirst({
      where: {
        id: req.userId
      }
    })

    if (!isUser) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "UNAUTHORIZED"
      })
    }

    const isCreator = await client.contest.findFirst({
      where: {
        id: dsaProblem[0].contest_id,
        creator_id: req.userId
      }
    })

    if (isCreator) {
      return res.status(403).json({
        success: false,
        data: null,
        error: "FORBIDDEN"
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        id: dsaProblem[0].id,
        contestId: dsaProblem[0].contest_id,
        title: dsaProblem[0].title,
        description: dsaProblem[0].description,
        tags: dsaProblem[0].tags,
        points: dsaProblem[0].points,
        timeLimit: dsaProblem[0].time_limit,
        memoryLimit: dsaProblem[0].memory_limit,
        visibleTestCases: [{
          input: dsaProblem[1].map(tst => tst.input,),
          expectedOutput: dsaProblem[1].map(tst => tst.expected_output)
        }]
      },
      error: null
    })
  } catch (error) {
    return res.status(500).json({
      error
    })
  }
})

app.post("/api/problems/:problemId/submit", authMiddleware, async (req, res) => {
  try {
    const isUser = await client.user.findFirst({
      where: {
        id: req.userId
      }
    })

    if (!isUser) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "UNAUTHORIZED"
      })
    }

    const dsaProblem = await client.dsaProblem.findFirst({
      where: {
        id: Number(req.params.problemId)
      }
    })

    if (!dsaProblem) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "PROBLEM_NOT_FOUND"
      })
    }


    const cotestDb = await client.contest.findFirst({
      where: {
        id: dsaProblem.contest_id
      }
    })

    if (!cotestDb) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "CONTEST_NOT_FOUND"
      })
    }

    if (cotestDb.end_time < new Date() || cotestDb.start_time > new Date()) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "CONTEST_NOT_ACTIVE"
      })
    }

    const { success, data } = req.body

    if (!success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST"
      })
    }

    /* need to figure out how to exec code of the contestee
     * method 1.) docker
     * mehtod 2.) exec
     * method 3.) judge0 (need to check how to set this up locallly)
    */
  } catch (error) {
    return res.status(500).json({
      error
    })
  }
})
