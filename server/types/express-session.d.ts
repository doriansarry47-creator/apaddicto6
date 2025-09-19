import 'express-session';
import type { User } from '../../shared/schema.js';

declare module 'express-session' {
  interface SessionData {
    user?: User;
  }
}