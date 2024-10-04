import { useCallback } from "react";

export const useScheduler = () => {
  const findCommonTimes = useCallback((schedules) => {
    const allTimes = schedules.flatMap((schedule) => schedule.availableTimes);
    const uniqueTimes = [...new Set(allTimes)];

    return uniqueTimes.filter((time) =>
      schedules.every((schedule) => schedule.availableTimes.includes(time))
    );
  }, []);

  return { findCommonTimes };
};
