import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as slotRepository from "../repositories/slotRepository";
import type { NewSlotInput } from "../repositories/slotRepository";

const SLOTS_KEY = ["slots"] as const;

export function useSlotList() {
  return useQuery({ queryKey: SLOTS_KEY, queryFn: slotRepository.list });
}

export function useSlotsByStaff(staffId: string | undefined) {
  return useQuery({
    queryKey: [...SLOTS_KEY, "byStaff", staffId],
    queryFn: () => slotRepository.listByStaff(staffId as string),
    enabled: Boolean(staffId),
  });
}

export function useAddSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewSlotInput) => slotRepository.add(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SLOTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useRemoveSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => slotRepository.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SLOTS_KEY }),
  });
}
