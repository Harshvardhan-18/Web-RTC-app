import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Response, Request } from "express";
import { z } from "zod";
import { UserModel } from "./db";
import { JWT_SECRET } from "./config";
import { useMiddleware } from "./middleware";
import cors from "cors";
import { Server } from "socket.io";
import { socket } from "./socket";
import http from "http";
const app = express();

const server = http.createServer(app);
const io = new Server(server,{
  cors:{
    origin:"*",
  },
});

app.use(express.json());
app.use(cors());


app.post("/api/v1/signup",
  async (req: Request, res: Response): Promise<any> => {
    // added promise bcz there was a ts error for async
    const signupSchema = z.object({
      username: z.string().min(3).max(15),
      email: z.string().email(),
      password: z
        .string()
        .min(6)
        .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val))
        .refine((val) => /[0-9]/.test(val))
        .refine((val) => /[A-Z]/.test(val))
        .refine((val) => /[a-z]/.test(val)),
    });

    const parsedData = signupSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).send({
        message: "Invalid input",
        errors: parsedData.error,
      });
    }
    const username = parsedData.data.username;
    const email=parsedData.data.email;
    const password = parsedData.data.password;
    
    try {
      const existingUser = await UserModel.findOne({
        username: username,
      });
      const existingEmail = await UserModel.findOne({
        email: email,
      });
      if (existingUser || existingEmail) {
        return res.status(400).send({
          message: "Username or email already used",
        });
      } else {
        const hashedPass = await bcrypt.hash(password, 10);
        await UserModel.create({
          username: username,
          email:email,
          password: hashedPass,
        });
        res.json({
          message: "User signed up",
        });
      }
    } catch (err) {
      return res.status(500).json({
        message: "Error checking user existence",
      });
    }
  }
);

app.post("/api/v1/signin", async (req, res) => {
  const username = req.body.username;
  const email=req.body.email;
  const password = req.body.password;

  const user = await UserModel.findOne({
    username: username,
    email: email,
  });
  if (user) {
    const isValid = await bcrypt.compare(password, user.password as string);
    if (isValid) {
      const token = jwt.sign(
        {
          id: user.username,
        },
        JWT_SECRET
      );

      res.json({
        token,
      });
    } else {
      res.status(400).send({
        message: "Incorrect password",
      });
    }
  } else {
    res.status(404).send({
      message: "User does not exist!!",
    });
  }
});

socket(io);
server.listen(3500);

