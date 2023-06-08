import { Companies } from '../models/models.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const signUp = async (req, res) => {
  const { name, email, password, phone, scopeId } = req.body;

  if (!name) {
    return res.status(400).send('Name is required.');
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).send('Invalid email format.');
  }
  if (!password || password.length < 8) {
    return res.status(400).send('Minimum length for password is 8 characters.');
  }
  if (!/(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}/.test(password)) {
    return res
      .status(400)
      .send(
        'Password must contain an uppercase letter, a numeric digit, and a special character.'
      );
  }
  if (!phone) {
    return res.status(400).send('Phone is required.');
  }
  if (!scopeId) {
    return res.status(400).send('Scope id is required.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Check if email already exists in the database
    const existingUser = await Companies.findOne({ where: { email: email } });
    const existingName = await Companies.findOne({ where: { name: name } });
    if (existingName) {
      return res.status(422).send({
        status: false,
        message: 'Name already exists.',
      });
    }
    if (existingUser) {
      return res.status(422).send({
        status: false,
        message: 'Email already exists.',
      });
    }

    const user = new Companies({
      name,
      email,
      phone,
      scopeId,
      password: hashedPassword,
    });

    await user.save();
    return res.send({
      status: true,
      message:
        "Congratulations! You've successfully signed up to Carbon Commitment Project",
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      message: err?.message || 'Something went wrong on our server.',
    });
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are valid
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).send('Invalid email format.');
  }
  if (!password || password.length < 8) {
    return res.status(400).send('Minimum length for password is 8 characters.');
  }

  try {
    // Find user in database
    const user = await Companies.findOne({ where: { email } });
    if (!user) {
      return res.status(401).send({
        status: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({
        status: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate access token
    const accessToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET_ACCESS,
      {
        expiresIn: '2d',
      }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET_REFRESH,
      {
        expiresIn: '60d',
      }
    );

    // Set access token in HTTP-only cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true, // Use in production to require HTTPS
      maxAge: 5 * 60 * 1000, // 5 minutes
    });

    // Return response with tokens and user data
    return res.send({
      status: true,
      message: 'Sign in successfully.',
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          scopeId: user.scopeId,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      status: false,
      message: err?.message || 'Something went wrong on our server.',
    });
  }
};

export const refreshTokens = async (req, res) => {
  const { refresh_token } = req.body;

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET_REFRESH);
    const email = decoded.email;

    // Find user in database
    const user = await Companies.findOne({ where: { email } });
    if (!user) {
      return res.status(401).send({
        status: false,
        message: 'User not found.',
      });
    }

    // Generate a new access token
    const accessToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET_ACCESS,
      {
        expiresIn: '2d',
      }
    );

    // Generate a new refresh token
    const refreshToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET_REFRESH,
      {
        expiresIn: '60d',
      }
    );

    // Set the new access token in HTTP-only cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true, // Use in production to require HTTPS
      maxAge: 5 * 60 * 1000, // 5 minutes
    });

    // Return response with tokens and user data
    return res.send({
      status: true,
      message: 'Refresh successful.',
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          scopeId: user.scopeId,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      status: false,
      message: err?.message || 'Something went wrong on our server.',
    });
  }
};
