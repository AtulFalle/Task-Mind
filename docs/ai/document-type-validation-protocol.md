# Document Type Validation Protocol

Use this protocol to manually test whether TaskMindAI improves after human feedback. This is not automated evaluation, fine-tuning, embeddings, or dataset export.

## Step 1: Create Workspace

Create a workspace named:

```text
Document Type Classifier
```

## Step 2: Add Rules

Add these operational rules before the first test batch:

- Invoice contains invoice number, amount, due date, vendor/customer.
- Resume contains name, skills, education, experience.
- Bank statement contains transactions, balances, debit/credit.
- Support email contains customer issue/request.
- Unknown should be used when none match.

## Step 3: Upload First 10 Samples

Use the first 10 examples from `docs/ai/document-type-validation-samples.md` or the `/validation/document-types` helper page.

## Step 4: Run Classification

Open each uploaded document and use Classification Mode to run document type classification.

## Step 5: Approve Or Correct Suggestions

Approve correct predictions. Correct wrong predictions using the document type dropdown. Prefer `UNKNOWN` when the sample does not match any learned workflow.

## Step 6: Upload Next 10 Samples

Upload the next 10 samples after feedback from the first batch has been saved.

## Step 7: Run Classification Again

Classify the second batch using the same Classification Mode workflow.

## Step 8: Compare Correction Rate

Review validation metrics before and after feedback. The main success metric is:

```text
Correction rate should reduce after feedback is added.
```

If the correction rate does not reduce, review the saved corrections and rules for ambiguity before changing model behavior.
