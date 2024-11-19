import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleWare.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";

export const patientRegister = catchAsyncError(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, dob, role } =
    req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !dob ||
    !role
  ) {
    return next(new ErrorHandler("Please Fill Full Form", 400));
  }

  const user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User already Exists", 400));
  }
  await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    role,
  });
  return generateToken(user, "User Registered", 200, res);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password, confirmPassword, role } = req.body;
  if (!email || !password || !confirmPassword || !role) {
    return next(new ErrorHandler("Please Provide all details", 400));
  }
  if (password !== confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password doesnot match", 400)
    );
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("User not Found", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Password", 400));
  }
  if (role !== user.role) {
    return next(new ErrorHandler("User with this role not found", 400));
  }
  generateToken(user, "User Logged In", 200, res);
});

export const newAdmin = catchAsyncError(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, dob } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !dob
  ) {
    return next(new ErrorHandler("Please Fill Full Form", 400));
  }
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler(
        `${isRegistered.role} with this Email Already Exists`,
        400
      )
    );
  }
  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    role: "Admin",
  });
  res.status(200).json({
    success: true,
    message: "New Admin Registered",
  });
});

export const getAllDoctors = catchAsyncError(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({
    success: true,
    doctors,
  });
});
export const getUserDetails = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});
export const logoutAdmin = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("AdminToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Admin Logged Out!",
    });
});
export const logoutPatient = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("PatientToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Patient Logged Out!",
    });
});
export const AddNewDoctor = catchAsyncError(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    doctorDepartment,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !dob ||
    !doctorDepartment
  ) {
    return next(new ErrorHandler("Please Fill Full Form", 400));
  }
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler(
        `${isRegistered.role} with this email already exists`,
        401
      )
    );
  }
  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    doctorDepartment,
    role: "Doctor",
  });
  res.status(200).json({
    success: true,
    message: "Doctor Registered Succesfully",
    doctor,
  });
});
