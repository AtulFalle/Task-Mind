# Document Type Classification Validation Samples

Use these short samples to manually validate whether TaskMindAI improves after human guidance. Upload a few samples, classify them, approve or correct the result, then upload the next batch and compare correction rate.

## INVOICE

### Invoice with due date

Sample text:

```text
Invoice INV-1048
Bill to: Northstar Logistics
Amount due: $2,450.00
Due date: June 15, 2026
Payment terms: Net 30
```

Expected document type: INVOICE

Why this label is correct: Contains an invoice number, amount due, due date, and payment terms.

### Office supply invoice

Sample text:

```text
Acme Office Supply
Invoice number: AOS-88912
Subtotal: $718.40
Sales tax: $57.47
Total balance due: $775.87
```

Expected document type: INVOICE

Why this label is correct: Contains supplier name, invoice number, subtotal, tax, and total balance due.

### Services invoice

Sample text:

```text
Professional Services Invoice
Client: Harbor Clinic
Line item: May consulting retainer
Invoice date: May 31, 2026
Please remit $3,000 by July 1, 2026.
```

Expected document type: INVOICE

Why this label is correct: Identifies itself as an invoice and includes client, line item, invoice date, amount, and remittance date.

### Partial payment invoice

Sample text:

```text
Receipt and Invoice
Order ID: MKT-55201
Items: signage package, install labor
Total: $1,284.10
Outstanding amount: $642.05
```

Expected document type: INVOICE

Why this label is correct: Shows an order, billed items, total, and outstanding amount to be paid.

### Maintenance invoice

Sample text:

```text
Invoice from Redwood Maintenance
Service period: April 2026
Invoice #: RM-2026-041
Balance due: $498.00
Make checks payable to Redwood Maintenance.
```

Expected document type: INVOICE

Why this label is correct: Includes vendor, service period, invoice number, balance due, and payment instruction.

## RESUME

### Product operations resume

Sample text:

```text
Jordan Patel
Product Operations Manager
Experience: 6 years in workflow automation and customer operations.
Skills: SQL, stakeholder management, process documentation.
```

Expected document type: RESUME

Why this label is correct: Lists a person, role, experience, and skills as a professional profile.

### Software engineer resume

Sample text:

```text
Maya Chen
Software Engineer
Work history: Frontend Engineer at Bluefin Labs, 2022-present.
Education: B.S. Computer Science, Rutgers University.
```

Expected document type: RESUME

Why this label is correct: Contains candidate name, job title, work history, and education.

### Data analyst resume

Sample text:

```text
Resume: Alex Romero
Summary: Data analyst with banking and risk reporting experience.
Tools: Python, Excel, Tableau.
Certifications: Google Data Analytics Certificate.
```

Expected document type: RESUME

Why this label is correct: Explicitly says resume and includes summary, tools, and certifications.

### Recruiter resume

Sample text:

```text
Priya Shah
Senior Recruiter
Professional experience includes sourcing, interview coordination, and ATS administration.
Education: MBA, Human Resources.
```

Expected document type: RESUME

Why this label is correct: Describes a candidate with professional experience and education.

### Operations associate resume

Sample text:

```text
Name: Theo Martin
Objective: Operations associate role.
Previous roles: Warehouse coordinator, inventory clerk.
References available upon request.
```

Expected document type: RESUME

Why this label is correct: Includes candidate name, objective, previous roles, and references language.

## BANK_STATEMENT

### Monthly account summary

Sample text:

```text
Monthly Statement
Account ending in 4421
Opening balance: $4,210.20
Deposits: $1,600.00
Withdrawals: $985.44
Closing balance: $4,824.76
```

Expected document type: BANK_STATEMENT

Why this label is correct: Contains account identifier, deposits, withdrawals, opening balance, and closing balance.

### Statement period summary

Sample text:

```text
Community Bank
Statement period: April 1-April 30, 2026
Account summary
Beginning balance: $12,004.18
Ending balance: $11,842.03
```

Expected document type: BANK_STATEMENT

Why this label is correct: Uses bank statement language with statement period and beginning/ending balances.

### Checking account activity

Sample text:

```text
Checking Account Activity
04/03 ACH deposit payroll $2,225.00
04/05 debit card grocery $88.14
04/12 ATM withdrawal $100.00
Available balance: $3,109.55
```

Expected document type: BANK_STATEMENT

Why this label is correct: Shows dated account transactions, deposits, debits, ATM withdrawal, and balance.

### Savings statement

Sample text:

```text
Savings Statement
Account holder: Morgan Lee
Interest paid year to date: $18.20
Average daily balance: $7,450.67
Statement closing date: May 31, 2026
```

Expected document type: BANK_STATEMENT

Why this label is correct: Contains savings statement details, account holder, interest, average balance, and closing date.

### Business banking statement

Sample text:

```text
Business Banking Statement
Account ending 9088
Credits this period: $8,900.00
Debits this period: $7,345.22
Service charge: $12.00
```

Expected document type: BANK_STATEMENT

Why this label is correct: Includes business banking statement language with account ending, credits, debits, and service charge.

## SUPPORT_EMAIL

### Password reset issue

Sample text:

```text
Subject: Cannot reset my password
Hi support team, the reset link expires immediately after I click it. Can you help me regain access to my account?
```

Expected document type: SUPPORT_EMAIL

Why this label is correct: Customer is asking support for help with an account access issue.

### Duplicate billing issue

Sample text:

```text
Subject: Billing question
Hello, I was charged twice for my May subscription. Please review invoice 5542 and refund the duplicate payment.
```

Expected document type: SUPPORT_EMAIL

Why this label is correct: Customer message requests support review and refund for a billing issue.

### Upload crash report

Sample text:

```text
Subject: App crashes when uploading files
The dashboard freezes whenever I upload a PDF larger than 5 MB. I am using Chrome on Windows 11.
```

Expected document type: SUPPORT_EMAIL

Why this label is correct: Reports a product problem with environment details for support troubleshooting.

### Account owner change request

Sample text:

```text
Subject: Change account owner
Can you transfer workspace ownership from dana@example.com to opslead@example.com? The current owner left our company.
```

Expected document type: SUPPORT_EMAIL

Why this label is correct: Customer requests an account administration change from support.

### Feature request email

Sample text:

```text
Subject: Feature request
It would help our team if exported reports included annotation history and reviewer names. Is this planned?
```

Expected document type: SUPPORT_EMAIL

Why this label is correct: Customer submits a product feature request to the support team.

## UNKNOWN

### Meeting notes

Sample text:

```text
Meeting notes
Discussed office seating, coffee machine repair, and next Friday's volunteer event.
```

Expected document type: UNKNOWN

Why this label is correct: General meeting notes do not match invoice, resume, bank statement, or support email workflows.

### Recipe draft

Sample text:

```text
Recipe draft
Combine chickpeas, lemon juice, garlic, olive oil, and tahini. Blend until smooth and adjust salt.
```

Expected document type: UNKNOWN

Why this label is correct: Recipe instructions are unrelated to the learned document workflows.

### Weather alert

Sample text:

```text
Weather alert
Heavy rain is expected after 4 PM. Outdoor activities should move indoors where possible.
```

Expected document type: UNKNOWN

Why this label is correct: Weather notice does not contain the defining features of any supported workflow.

### Personal reminder

Sample text:

```text
Short note
Remember to pick up printer paper and call the building manager about the elevator.
```

Expected document type: UNKNOWN

Why this label is correct: Personal reminder text should be treated as outside the learned applicability boundary.

### Product label

Sample text:

```text
Product label
Organic green tea, 20 sachets. Ingredients: green tea leaves. Store in a cool, dry place.
```

Expected document type: UNKNOWN

Why this label is correct: Product label content is not an invoice, resume, bank statement, or support email.
