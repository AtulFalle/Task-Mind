# Playground Intent Learning Samples

Use these small examples to check whether the learning playground can classify short customer messages into the supported intent enum.

```ts
enum PlaygroundIntent {
  BILLING
  TECHNICAL_ISSUE
  CANCELLATION
  SALES_INQUIRY
  GENERAL_SUPPORT
  UNKNOWN
}
```

## Mixed Examples

| # | Sample text | Expected intent | Why |
|---|---|---|---|
| 1 | I was charged twice for my monthly plan yesterday. Can you refund the duplicate charge? | BILLING | Mentions duplicate charge and refund. |
| 2 | The app keeps freezing when I upload a PDF from Chrome. | TECHNICAL_ISSUE | Reports a product malfunction. |
| 3 | Please cancel my subscription before it renews next week. | CANCELLATION | Requests subscription cancellation. |
| 4 | Do you offer a team plan for 20 users? | SALES_INQUIRY | Asks about a plan before purchase. |
| 5 | Can someone update the workspace owner to maya@example.com? | GENERAL_SUPPORT | Requests account administration help. |
| 6 | Reminder: bring the projector cable to the meeting room. | UNKNOWN | Internal reminder outside support intents. |
| 7 | My invoice shows the wrong company address. | BILLING | Invoice correction request. |
| 8 | I get a 500 error every time I open the dashboard. | TECHNICAL_ISSUE | Error report with broken dashboard behavior. |
| 9 | I want to close my account and remove my payment method. | CANCELLATION | Asks to close account. |
| 10 | Can I schedule a demo with your sales team? | SALES_INQUIRY | Demo request from a prospective buyer. |
| 11 | How do I invite another teammate to my workspace? | GENERAL_SUPPORT | Usage assistance request. |
| 12 | Office lunch is moved to 1 PM today. | UNKNOWN | General announcement, not customer support. |
| 13 | My card was declined, but the bank says it is active. | BILLING | Payment problem. |
| 14 | The export button does nothing after I select CSV. | TECHNICAL_ISSUE | Broken feature behavior. |
| 15 | Stop my trial now so I am not charged later. | CANCELLATION | Trial cancellation request. |
| 16 | What is the price difference between Pro and Enterprise? | SALES_INQUIRY | Pricing comparison before purchase. |
| 17 | Please resend the workspace invitation email. | GENERAL_SUPPORT | Routine account support action. |
| 18 | Recipe note: add extra lemon juice and salt. | UNKNOWN | Recipe content outside the learned workflow. |
| 19 | I need a receipt for last month's payment. | BILLING | Requests payment receipt. |
| 20 | Login fails after I reset my password. | TECHNICAL_ISSUE | Account access failure after reset. |
| 21 | We are not using the product anymore. Please terminate our plan. | CANCELLATION | Plan termination request. |
| 22 | Does your platform support annual contracts? | SALES_INQUIRY | Contract question for buying decision. |
| 23 | Can you change my notification email address? | GENERAL_SUPPORT | Account settings support request. |
| 24 | Weather alert says heavy rain starts after 4 PM. | UNKNOWN | Weather information unrelated to support intents. |
| 25 | The tax amount on invoice INV-442 looks incorrect. | BILLING | Invoice tax dispute. |
| 26 | Search results disappear when I apply the status filter. | TECHNICAL_ISSUE | Product defect involving filters. |
| 27 | Please downgrade and cancel all paid seats at the end of this month. | CANCELLATION | Cancellation or downgrade of paid seats. |
| 28 | We are evaluating vendors. Can you send security and procurement details? | SALES_INQUIRY | Evaluation request from a prospective customer. |
| 29 | I need help finding where uploaded documents are stored. | GENERAL_SUPPORT | Product usage question. |
| 30 | Quarterly goals: reduce review time and update onboarding docs. | UNKNOWN | Planning note outside customer-support classification. |

