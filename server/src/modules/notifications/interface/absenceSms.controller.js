import { isDay, schoolToday } from "../../../shared/schoolDate.js";
import { ValidationError } from "../../../shared/errors/index.js";
import { sendError } from "../../../shared/http/sendError.js";

/** GET /api/attendance/sms?date= (default today): the day's absence SMS, after authMiddleware. */
export function makeAbsenceSmsController({ useCases }) {
  return {
    list: async (req, res) => {
      try {
        const date = req.query.date || schoolToday();
        if (!isDay(date)) throw new ValidationError("attendance_date_invalid");
        const messages = await useCases.list({ branchId: req.branchId ?? null, date });
        res.status(200).json({ success: true, data: messages });
      } catch (error) {
        sendError(res, error, req.language);
      }
    },
  };
}
