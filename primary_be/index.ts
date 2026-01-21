import express from "express"
import { ContestSchema, DsaSchma, LoginSchema, McqSchema, McqSubmissionSchema, SignInSchema } from "./types"
import bcrypt from "bcrypt"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"
import JWT_SECRET from "./config"
import { authMiddleware } from "./middleware"
const client = new PrismaClient()
const app = express()
app.use(express.json())
app.post("/api/auth/signup", async (req, res) => {
  try {
    const body = req.body
    console.log(req.body);

    const { success, data } = SignInSchema.safeParse(body)
    if (!success) {
      console.log(success.valueOf());

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
        created_at: new Date()
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

app.post("/api/auth/login", async (req, res) => {
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
    const userId = Number(req.userId)
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

    if (role !== "creator") {
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
        startTime: data.startTime,
        endTime: data.endTime,
        creatorId: creatorExist.id
      }
    })

    return res.status(201).json({
      success: true,
      data: {
        id: contestDb.id,
        title: contestDb.title,
        description: contestDb.description,
        creatorId: contestDb.creatorId,
        startTime: contestDb.startTime,
        endTime: contestDb.endTime
      },
      error: null
    })
  } catch (error) {
    console.error("FULL ERROR ↓↓↓");
    console.error(error);
    return res.status(500).json({
      error
    })
  }
})

app.get("/api/contests/:contestId", authMiddleware, async (req, res) => {
  try {
    const contestId = Number(req.params.contestId)
    console.log(contestId);

    const userExist = await client.user.findFirst({
      where: {
        id: Number(req.userId)
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
          select: {
            id: true,
            questionText: true,
            options: true,
            points: true,
            createdAt: true
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
        startTime: contestExist.startTime,
        endTime: contestExist.endTime,
        creatorId: contestExist.creatorId,
        mcqs: contestExist.mcqQuestions.map((mcq) => ({
          id: mcq.id,
          questionText: mcq.questionText,
          options: mcq.options,
          points: mcq.points
        })),
        dsaProblems: contestExist.dsaProblems.map((dsa) => ({
          id: dsa.id,
          title: dsa.title,
          description: dsa.description,
          tage: dsa.tags,
          points: dsa.points,
          timeLimit: dsa.timeLimit,
          memoryLimit: dsa.memoryLimit
        }))
      },
      error: null
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error
    })
  }
})

app.post("/api/contests/:contestId/mcq", authMiddleware, async (req, res) => {
  try {
    const contestId = Number(req.params.contestId)
    console.log(req.headers["content-type"])
    console.log(req.body)
    const userExist = await client.user.findFirst({
      where: {
        id: Number(req.userId)
      }
    })


    if (!userExist) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "UNAUTHORIZED"
      })
    }

    const isCreator = await client.contest.findFirst({
      where: {
        id: contestId,
        creatorId: userExist.id
      }
    })

    if (!isCreator) {
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
        contestId: contestDb.id,
        questionText: data.questionText,
        options: data.options,
        correctOptionIndex: Number(data.correctOptionIndex),
        points: Number(data.points),
      }
    })

    return res.status(201).json({
      success: true,
      data: {
        id: mcqDb.id,
        contestId: mcqDb.contestId
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
    const userId = Number(req.userId)
    const contestId = Number(req.params.contestId)
    const questionId = Number(req.params.questionId)

    const userExist = await client.user.findFirst({
      where: {
        id: userId
      }
    })

    if (!userExist) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "UNAUTHORIZED"
      })
    }


    const ifContestAndQuestionExist = await client.$transaction([
      client.contest.findFirst({
        where: {
          id: contestId
        }
      }),
      client.mcqQuestion.findFirst({
        where: {
          id: questionId,
          contestId: contestId
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

    if (userExist.id === ifContestAndQuestionExist[0].creatorId) {
      return res.status(403).json({
        success: false,
        data: null,
        error: "FORBIDDEN"
      })
    }

    if (ifContestAndQuestionExist[0].startTime > new Date() || ifContestAndQuestionExist[0].endTime < new Date()) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "CONTEST_NOT_ACTIVE"
      })
    }


    const existingSubmission = await client.mcqSubmission.findUnique({
      where: {
        userId_questionId: {
          userId: userExist.id,
          questionId: Number(questionId)
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

    const isCorrect = ifContestAndQuestionExist[1].correctOptionIndex === Number(data.selectedOptionIndex)

    const pointsEarned = isCorrect ? ifContestAndQuestionExist[1].points : 0


    const mcqSubmissionDb = await client.mcqSubmission.create({
      data: {
        userId: userExist.id,
        questionId: questionId,
        selectedOptionIndex: Number(data.selectedOptionIndex),
        submittedAt: new Date(),
        isCorrect: true,
        pointsEarned: pointsEarned
      }
    })

    return res.status(201).json({
      success: true,
      data: {
        isCorrect: true,
        pointsEarned: mcqSubmissionDb.pointsEarned
      },
      error: null
    })
  } catch (error) {
    return res.status(500).json({
      error
    })
  }
})

/*
* question: 2 SUM
* input will be in the form of 
* "input": "2\n4 9\n2 7 11 15\n3 6\n3 2 4",
* "expectedOutput": "0 1\n1 2",
*  Input format:
*
* 2                    ← number of test cases
* 4 9                  ← test case 1: n=4, target=9
* 2 7 11 15            ← array elements
* 3 6                  ← test case 2: n=3, target=6
* 3 2 4                ← array elements
*
* Output format:
* 0 1                  ← answer for test case 1
* 1 2                  ← answer for test case 2
*/

app.post("/api/contests/:contestId/dsa", authMiddleware, async (req, res) => {
  try {

    const contestId = Number(req.params.contestId)

    const contestExist = await client.contest.findFirst({
      where: {
        id: contestId,
        creatorId: req.userId
      }
    })

    if (!contestExist) {

      return res.status(404).json({
        success: false,
        data: null,
        error: "CONTEST_NOT_FOUND"
      })
    }

    const user = await client.user.findFirst({
      where: {
        id: Number(req.userId)
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "UNAUTHORIZED"
      })
    }

    const isCreator = await client.contest.findFirst({
      where: {
        creatorId: Number(req.userId),
        id: contestExist.id
      }
    })

    if (!isCreator) {
      return res.status(403).json({
        success: false,
        data: null,
        error: "FORBIDDEN"
      })
    }

    const body = req.body;
    const { success, data } = DsaSchma.safeParse(body)
    if (!success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST"
      })
    }

    const dsaDb = await client.dsaProblem.create({
      data: {
        contestId: contestExist.id,
        title: data.title,
        description: data.description,
        tags: data.tags,
        points: Number(data.points),
        timeLimit: Number(data.timeLimit),
        memoryLimit: Number(data.memoryLimit),

        testCases: {
          create: data.testCases.map((tc) => ({
            input: tc.input,
            isHidden: tc.isHeaden,
            expectedOutput: tc.expectedOutPut
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
        contestId: dsaDb.contestId
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
          problemId: Number(req.params.problemId),
          isHidden: false
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
        id: Number(req.userId)
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
        id: dsaProblem[0].contestId,
        creatorId: Number(req.userId)
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
        contestId: dsaProblem[0].contestId,
        title: dsaProblem[0].title,
        description: dsaProblem[0].description,
        tags: dsaProblem[0].tags,
        points: dsaProblem[0].points,
        timeLimit: dsaProblem[0].timeLimit,
        memoryLimit: dsaProblem[0].memoryLimit,
        visibleTestCases: [{
          input: dsaProblem[1].map(tst => tst.input,),
          expectedOutput: dsaProblem[1].map(tst => tst.expectedOutput)
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
        id: Number(req.userId)
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
        id: dsaProblem.contestId
      }
    })

    if (!cotestDb) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "CONTEST_NOT_FOUND"
      })
    }

    if (cotestDb.endTime < new Date() || cotestDb.startTime > new Date()) {
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
     * method 3.) judge0 (need to check how to set this up locally)
    */
  } catch (error) {
    return res.status(500).json({
      error
    })
  }
})


app.listen(3000, () => {
  console.log("Server running on port 3000");

})
