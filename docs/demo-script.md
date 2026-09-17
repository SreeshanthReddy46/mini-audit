# Evaluation Demo Script (3-5 Minutes)

This script outlines the exact sequence to demonstrate the system to evaluators.

## Demo Credentials
- **Firm A (ABC & Co.) Staff**: `rohit@abc.com` / `password123`
- **Firm A (ABC & Co.) Reviewer**: `aman@abc.com` / `password123`
- **Firm B (XYZ & Co.) Reviewer**: `priya@xyz.com` / `password123`

---

## Step-by-Step Flow

### 1. Login as Staff (Rohit - ABC & Co.)
- Login via 1-click button or credentials.
- Navigate to client **ABC Traders Pvt. Ltd.**.
- Select **Bank Statement** (Status: `PENDING`).
- Upload initial document (`sample_bank_statement.pdf`).
- Verify status changes to `UPLOADED` (Version: `v1`).
- Notice that as Staff, the "Approve" and "Request Correction" buttons are not accessible.

### 2. Login as Reviewer (Aman - ABC & Co.)
- Switch to Aman via top-bar demo switcher.
- Open **Bank Statement**.
- Click **Start Review** (Status changes to `UNDER_REVIEW`).
- Click **Request Correction**. Provide reason: `"Page 3 is missing. Please upload the complete bank statement."`
- Status transitions to `CORRECTION_REQUIRED`.

### 3. Switch back to Staff (Rohit)
- Open the document. The reviewer's comment is prominently displayed.
- Click **Re-upload Corrected Document** and upload `bank_statement_v2.pdf`.
- Status returns to `UPLOADED` (Version increments to `v2`).

### 4. Switch back to Reviewer (Aman)
- Document now shows version `v2`.
- Start review, then click **Approve Document**.
- Status transitions to `APPROVED`.
- Inspect the **Audit History Timeline**:
  1. Rohit uploaded Bank Statement (v1)
  2. Aman started review
  3. Aman requested correction ("Page 3 is missing...")
  4. Rohit re-uploaded revised document (v2)
  5. Aman approved document

### 5. Demonstrate Tenant Isolation (Firm B - Priya)
- Switch to Priya (`priya@xyz.com`) from XYZ & Co.
- Observe: Firm A clients and documents are completely invisible.
- Attempt to navigate directly to Firm A's document URL:
  - Backend responds with `404 Not Found`.
  - Zero cross-tenant data leakage.
