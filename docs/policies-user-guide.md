# Policy & Procedure User Guide

This guide helps policy authors and approvers navigate the policy workspace, create and maintain documents, and keep reviews moving.

## Get Oriented

- **Launch point:** Select **Policies** in the sidebar to open the two-pane workspace.
- **Actor selector:** The top-right “Acting as” control determines which seeded user you impersonate. Authors can upload and submit drafts; approvers can record decisions.
- **Policy inventory:** The left panel lists policies you can access. Badges highlight the latest version status and pending review count.
- **Detail pane:** Selecting a policy shows metadata, version history, retention rules, framework mappings, and comparison tools.

## Create a Policy

1. Choose an author-capable actor (Admin or Analyst).
2. Click **New Policy**.
3. Supply the required **Title** plus any optional fields (Description, Category, Tags, Review cadence).
4. Set a retention policy if needed:
   - **Retention period (days)** – enforce a minimum lifespan.
   - **Retention reason** – explain the requirement.
   - **Retention expiration** – date the retention control ends.
5. Pick the initial owner (defaults to the acting author).
6. Submit with **Create policy**. The new policy appears in the inventory.

## Upload Policy Versions

1. With a policy selected, click **Upload version**.
2. Attach the document file (PDF, DOCX, TXT, Markdown, HTML, or image formats).
3. Optionally add:
   - **Label** and **Release notes** for internal context.
   - **Effective date** to schedule when the artifact becomes active upon approval.
   - **Supersedes** to explicitly replace a prior version.
4. Map frameworks:
   - Check the frameworks that apply.
   - Add comma-separated control families (e.g., `AC, MP`) and specific control IDs.
5. Submit with **Upload**. The draft appears at the top of the version list.

## Submit for Approval

1. Draft versions show **Submit** buttons in the version list or **Submit draft** in the header.
2. Choose approvers (only Admin or Auditor roles qualify). Multiple approvers are allowed.
3. Provide optional submission notes.
4. Confirm with **Submit**. The status moves to `IN_REVIEW`, and approvers receive pending tasks.

## Review & Decisions

- Approvers use **Record decision** to approve or reject.
- Approving requires an optional comment and allows choosing an effective date.
- Rejecting automatically closes any outstanding approvals and reverts the version to the owner.
- Once every approver marks **Approved**, the version becomes the current baseline; the UI badges it as **Current**.

## Compare Versions

1. Check the boxes beside two versions.
2. Click **Compare selected** to view side-by-side metadata, approvals, notes, and framework coverage.

## Download Artifacts

- Any actor currently selected can download accessible versions.
- Click **Download** beside a version. A signed link opens in a new tab.

## Track Retention & Framework Coverage

- The policy summary shows the configured retention policy and framework mappings of the current version.
- Each version lists the frameworks it maps to, helping you confirm scope coverage before submission.

## Troubleshooting Tips

- **Missing actors:** Refresh the actor selector if seeded users do not appear.
- **Upload blocked:** Ensure a file is attached and your actor has author permissions.
- **Submission locked:** Only draft versions can be submitted, and at least one approver is required.
- **Decision disabled:** Approvers must act under their own persona and only on versions assigned to them.

For deeper technical context (RBAC, API surfaces, storage flows), see `docs/policies.md`.
