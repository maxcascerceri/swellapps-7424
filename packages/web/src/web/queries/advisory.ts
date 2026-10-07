import { useMutation } from '@tanstack/react-query';
import { orpc } from '../lib/api';

export function useAdvisorySubmit() {
  return useMutation(orpc.advisory.submit.mutationOptions({ retry: false }));
}
