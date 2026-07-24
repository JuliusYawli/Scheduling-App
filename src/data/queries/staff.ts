import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as staffRepository from "../repositories/staffRepository";
import type { NewStaffInput } from "../repositories/staffRepository";

const STAFF_KEY = ["staff"] as const;

export function useStaffList() {
  return useQuery({ queryKey: STAFF_KEY, queryFn: staffRepository.list });
}

export function useAddStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewStaffInput) => staffRepository.add(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_KEY }),
  });
}

export function useRemoveStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffRepository.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEY });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}
