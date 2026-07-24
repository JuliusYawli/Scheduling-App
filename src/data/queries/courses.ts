import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as courseRepository from "../repositories/courseRepository";
import * as subjectRepository from "../repositories/subjectRepository";

const COURSES_KEY = ["courses"] as const;
const SUBJECTS_KEY = ["subjects"] as const;

export function useCourseList() {
  return useQuery({ queryKey: COURSES_KEY, queryFn: courseRepository.list });
}

export function useSubjectList() {
  return useQuery({ queryKey: SUBJECTS_KEY, queryFn: subjectRepository.list });
}

export function useAddCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, subjectNames }: { name: string; subjectNames: string[] }) =>
      courseRepository.add(name, subjectNames),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_KEY });
      queryClient.invalidateQueries({ queryKey: SUBJECTS_KEY });
    },
  });
}
