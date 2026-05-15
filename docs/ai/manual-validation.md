# Manual AI Validation

Use these short samples to manually validate whether TaskMindAI reuses rules,
approvals, rejections, and corrections in later document classification runs.

## Flow

1. Start postgres and redis.
2. Start the API.
3. Start the web app.
4. Start the AI service.
5. Start Ollama with `qwen2.5:3b`.
6. Create a Document Type Classifier workspace.
7. Add operational rules for invoice, resume, bank statement, support email,
   and unknown documents.
8. Upload one sample, extract text, run classification, then approve, reject,
   or correct the result.
9. Upload another sample and run classification again.
10. Open Validation Mode and confirm the latest context stats include rules and
    prior human feedback examples.
11. Confirm validation metrics changed.

## Samples

### Invoice

Invoice INV-1048 from Northstar Supplies to Acme Operations. Invoice date:
May 10, 2026. Due date: June 9, 2026. Line items include printer paper,
toner, and shipping. Total amount due: USD 1,284.50.

### Resume

Priya Shah is a senior operations analyst with seven years of experience in
process improvement, vendor management, and dashboard reporting. Skills include
SQL, Excel, stakeholder interviews, and workflow documentation.

### Bank Statement

Checking account statement for April 2026. Opening balance: USD 4,210.31.
Transactions include payroll deposit, rent payment, debit card purchases, and
ATM withdrawal. Closing balance: USD 3,882.09.

### Support Email

Subject: Unable to access project dashboard. Hello support team, I receive a
403 error when opening the dashboard for workspace Greenfield. Please restore
access or tell me what permission is missing.

### Unknown

Neighborhood picnic reminder. Bring a folding chair, water bottle, and one
dish to share. The event starts at 11 AM near the west shelter if the weather
is clear.
