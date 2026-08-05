import { randomUUID } from 'crypto';
import { Router } from 'express';
import { users } from '../../data/users.js';
import { authTokens } from '../../data/authTokens.js';

const router = Router();

function createValidationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function normalizeUserPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw createValidationError('Invalid request payload.');
  }

  const { fullName, email, password } = payload;
  const normalizedFullName = typeof fullName === 'string' ? fullName.trim() : '';
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const normalizedPassword = typeof password === 'string' ? password : '';

  if (!normalizedEmail || !normalizedPassword || (payload.hasOwnProperty('fullName') && !normalizedFullName)) {
    throw createValidationError('All fields are required.');
  }

  return {
    fullName: normalizedFullName,
    email: normalizedEmail,
    password: normalizedPassword,
  };
}

function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
}

function getTokenFromHeader(request) {
  const authorization = request.headers.authorization || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

router.post('/login', (request, response, next) => {
  try {
    const { email, password } = normalizeUserPayload(request.body);
    const matchedUser = users.find(
      (user) => user.email.toLowerCase() === email && user.password === password,
    );

    if (!matchedUser) {
      return response.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = randomUUID();
    authTokens.set(token, matchedUser.id);

    response.json({ token, user: sanitizeUser(matchedUser) });
  } catch (error) {
    next(error);
  }
});

router.post('/register', (request, response, next) => {
  try {
    const { fullName, email, password } = normalizeUserPayload(request.body);

    if (users.some((user) => user.email.toLowerCase() === email)) {
      return response.status(409).json({ message: 'An account with that email already exists.' });
    }

    const newUser = {
      id: randomUUID(),
      fullName,
      email,
      password,
    };

    users.push(newUser);
    const token = randomUUID();
    authTokens.set(token, newUser.id);

    response.status(201).json({ token, user: sanitizeUser(newUser) });
  } catch (error) {
    next(error);
  }
});

router.get('/me', (request, response) => {
  const token = getTokenFromHeader(request);
  const userId = authTokens.get(token);

  if (!token || !userId) {
    return response.status(401).json({ message: 'Unauthorized.' });
  }

  const user = users.find((u) => u.id === userId);

  if (!user) {
    return response.status(401).json({ message: 'Unauthorized.' });
  }

  response.json({ user: sanitizeUser(user) });
});

export default router;
