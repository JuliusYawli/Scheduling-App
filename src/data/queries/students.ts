import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as studentRepository from "../repositories/studentRepository";

const STUDENTS_KEY = ["students"] as const;

export function useStudentList() {
  return useQuery({ queryKey: STUDENTS_KEY, queryFn: studentRepository.list });
}

export function useStudentsByCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: [...STUDENTS_KEY, "byCourse", courseId],
    queryFn: () => studentRepository.listByCourse(courseId as string),
    enabled: Boolean(courseId),
  });
}

export function useAddStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, courseId }: { name: string; courseId: string }) =>
      studentRepository.add(name, courseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STUDENTS_KEY }),
  });
}
