import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as notificationRepository from "../repositories/notificationRepository";

const NOTIFICATIONS_KEY = ["notifications"] as const;

export function useNotificationsForStaff(staffId: string | undefined) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, staffId],
    queryFn: () => notificationRepository.listForStaff(staffId as string),
    enabled: Boolean(staffId),
    refetchInterval: 5000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationRepository.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });
}
