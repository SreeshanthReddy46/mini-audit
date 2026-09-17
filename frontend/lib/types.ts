export type UserRole = 'STAFF' | 'REVIEWER';

export type DocumentStatus = 
  | 'PENDING'
  | 'UPLOADED'
  | 'UNDER_REVIEW'
  | 'CORRECTION_REQUIRED'
  | 'APPROVED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  firm_id: string;
  firm_name?: string;
}

export interface Client {
  id: string;
  firm_id: string;
  name: string;
  created_at: string;
  document_count: number;
}

export interface Document {
  id: string;
  firm_id: string;
  client_id: string;
  name: string;
  file_url: string | null;
  status: DocumentStatus;
  uploaded_by: string | null;
  uploader_name?: string | null;
  version: number;
  review_comment: string | null;
  uploaded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditEvent {
  id: string;
  firm_id: string;
  document_id: string | null;
  actor_id: string | null;
  actor_name: string | null;
  actor_role: string | null;
  action: string;
  comment: string | null;
  metadata_json: Record<string, any>;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  original_name: string;
  mime_type: string;
  file_size: number;
  sha256_hash: string;
  uploaded_by: string;
  uploader_name?: string | null;
  created_at: string;
}

export interface AIFindingItem {
  category: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH';
  observation: string;
  recommendation: string;
}

export interface AIAnalysis {
  id: string;
  document_id: string;
  version_id?: string | null;
  status: 'COMPLETED' | 'FAILED';
  model: string;
  prompt_version: string;
  summary: string;
  findings: AIFindingItem[];
  overall_confidence: number;
  created_at: string;
  completed_at?: string | null;
}
