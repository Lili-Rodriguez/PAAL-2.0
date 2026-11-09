"""Legacy auto-approval disabled. Source inspection never grants human approval."""
if __name__ == '__main__':
    raise SystemExit('Candidates are in pending.json. Use python3 -m backend.review after an actual human review; no automatic seeding is allowed.')
