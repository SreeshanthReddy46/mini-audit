'use client';

import { useState, useCallback } from 'react';
import { Document, AuditEvent } from '../lib/types';
import { api } from '../lib/api';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [auditHistory, setAuditHistory] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClientDocuments = useCallback(async (clientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Document[]>(`/api/clients/${clientId}/documents`);
      setDocuments(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDocumentDetail = useCallback(async (documentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const doc = await api.get<Document>(`/api/documents/${documentId}`);
      setCurrentDocument(doc);
      return doc;
    } catch (err: any) {
      setError(err.message || 'Failed to load document');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAuditHistory = useCallback(async (documentId: string) => {
    try {
      const history = await api.get<AuditEvent[]>(`/api/documents/${documentId}/audit`);
      setAuditHistory(history);
      return history;
    } catch (err: any) {
      console.error('Failed to load audit history', err);
      return [];
    }
  }, []);

  const uploadFile = async (documentId: string, file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    const updated = await api.upload<Document>(`/api/documents/${documentId}/upload`, formData);
    setCurrentDocument(updated);
    await fetchAuditHistory(documentId);
    return updated;
  };

  const startReview = async (documentId: string): Promise<Document> => {
    const updated = await api.post<Document>(`/api/documents/${documentId}/start-review`);
    setCurrentDocument(updated);
    await fetchAuditHistory(documentId);
    return updated;
  };

  const requestCorrection = async (documentId: string, comment: string): Promise<Document> => {
    const updated = await api.post<Document>(`/api/documents/${documentId}/request-correction`, { comment });
    setCurrentDocument(updated);
    await fetchAuditHistory(documentId);
    return updated;
  };

  const reuploadFile = async (documentId: string, file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    const updated = await api.upload<Document>(`/api/documents/${documentId}/reupload`, formData);
    setCurrentDocument(updated);
    await fetchAuditHistory(documentId);
    return updated;
  };

  const approveDocument = async (documentId: string, comment?: string): Promise<Document> => {
    const updated = await api.post<Document>(`/api/documents/${documentId}/approve`, { comment });
    setCurrentDocument(updated);
    await fetchAuditHistory(documentId);
    return updated;
  };

  return {
    documents,
    currentDocument,
    auditHistory,
    loading,
    error,
    fetchClientDocuments,
    fetchDocumentDetail,
    fetchAuditHistory,
    uploadFile,
    startReview,
    requestCorrection,
    reuploadFile,
    approveDocument,
  };
}
