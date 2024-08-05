import { customAlphabet, nanoid } from 'nanoid';

export const createTableID = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  6,
);

export const createUserID = () => nanoid();
