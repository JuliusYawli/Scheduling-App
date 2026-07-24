import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as attendanceRepository from "../repositories/attendanceRepository";
import type { AttendanceEntry } from "../repositories/attendanceRepository";

const ATTENDANCE_KEY = ["attendance"] as const;

export function useAttendanceForSlot(slotId: string | undefined, date: string) {
  return useQuery({
    queryKey: [...ATTENDANCE_KEY, slotId, date],
    queryFn: () => attendanceRepository.listForSlotAndDate(slotId as string, date),
    enabled: Boolean(slotId),
  });
}

export function useSaveAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      slotId,
      date,
      markedByStaffId,
      entries,
    }: {
      slotId: string;
      date: string;
      markedByStaffId: string;
      entries: AttendanceEntry[];
    }) => attendanceRepository.saveAttendance(slotId, date, markedByStaffId, entries),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY }),
  });
}
