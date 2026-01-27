# Service as Store

## Context
Small app, only have 4 hours. Dont want to set up ngrx or anything heavy.

## Decision
Just use a service with BehaviorSubject. Keep it simple.

## How it works
- BehaviorSubject holds the state privately
- Expose it as observable with asObservable()
- Update via next()
- Components use async pipe

## Tradeoffs
No redux devtools or action history but thats fine for this size. Would not do this for a big app.
