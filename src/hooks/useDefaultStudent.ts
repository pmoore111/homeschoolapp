import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Student } from '@shared/schema';

export function useDefaultStudent() {
  const queryClient = useQueryClient();

  // Mutation to ensure default student exists
  const ensureDefaultStudent = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/students/ensure-default', {});
    },
    onSuccess: () => {
      // Invalidate students query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
    },
  });

  // Fetch students
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });

  // Auto-create default student if none exist
  useEffect(() => {
    if (students.length === 0 && !ensureDefaultStudent.isPending) {
      ensureDefaultStudent.mutate();
    }
  }, [students.length, ensureDefaultStudent.isPending]);

  return {
    student: students[0],
    students,
    isLoading: students.length === 0 && ensureDefaultStudent.isPending,
  };
}
