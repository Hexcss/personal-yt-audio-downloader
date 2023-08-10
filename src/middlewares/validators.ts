import { body } from "express-validator";

export const downloadMP3ValidationRules = [
    body('url').isURL().withMessage('URL is not valid')
];
