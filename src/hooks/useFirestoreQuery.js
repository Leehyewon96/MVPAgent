import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCollection,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
} from '../firebase/queries';

export function useCollectionQuery(collectionName, constraints = [], options = {}) {
  return useQuery({
    queryKey: [collectionName, JSON.stringify(constraints)],
    queryFn: () => getCollection(collectionName, constraints),
    ...options,
  });
}

export function useDocumentQuery(collectionName, docId, options = {}) {
  return useQuery({
    queryKey: [collectionName, docId],
    queryFn: () => getDocument(collectionName, docId),
    enabled: !!docId,
    ...options,
  });
}

export function useAddDocument(collectionName) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => addDocument(collectionName, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [collectionName] });
    },
  });
}

export function useUpdateDocument(collectionName) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, data }) => updateDocument(collectionName, docId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [collectionName] });
    },
  });
}

export function useDeleteDocument(collectionName) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (docId) => deleteDocument(collectionName, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [collectionName] });
    },
  });
}

export function useGamesQuery() {
  return useCollectionQuery('games', []);
}

export function usePlayLogsQuery(gameId) {
  return useCollectionQuery('playLogs', [], { enabled: !!gameId });
}
