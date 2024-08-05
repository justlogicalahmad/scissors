import { NextFunction, Request, Response } from "express";
import IUser from "../entities/user.entity";
import {
  createNewUser,
  resendOTPToken,
  signInUser,
  verifyEmailWithOTP,
} from "../services/auth.service";
import { sendOTP } from "../../../utils/sendotp.util";
import { JwtPayload } from "jsonwebtoken";

interface IRequestParams {}

interface IRequestBody extends IUser {}

interface IRequestQuery {}

export const signup = async (
  req: Request<IRequestParams, any, IRequestBody, IRequestQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstname, lastname, username, email, password } = req.body;
    const newUser = await createNewUser(
      firstname,
      lastname,
      username,
      email,
      password
    );

    // Send OTP mail
    await sendOTP(email, newUser._id, lastname);
    res.status(201).json({
      message: "Email sent successfully.",
      failed: false,
    });
  } catch (error: any) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  try {
    const token = await signInUser(email, password);
    return res
      .cookie("access_token", token, {
        httpOnly: true,
        maxAge: 7200000,
      })
      .status(200)
      .json({
        message: "Login successful",
        failed: false,
      });
  } catch (error) {
    next({ message: "Internal server error. Please try again." });
  }
};

export const resendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as JwtPayload;
    await resendOTPToken(user._id);
    res
      .status(200)
      .json({ message: "OTP has been resent successfully", failed: false });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;
    await verifyEmailWithOTP(email, otp);
    res.status(200).json({ message: "Email Verified", failed: false });
  } catch (error) {
    next(error);
  }
};

export const signout = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie("access_token");
    res.status(200).send({ message: "Logged Out!", failed: false });
  } catch (error) {
    next(error);
  }
};
