# Gesture Controller

## Context
Need a swipe gesture for the buy button. Its inside a modal so could get messy with conflicting gestures.

Looked at SwiperJS and Hammer but they seem overkill.

## Decision
Use Ionics GestureController. Its already there and gives full control over the drag.

## Why
- Already part of Ionic so no extra deps
- Can track deltaX and know exactly when to trigger
- Easy to turn on/off when processing

## Downsides
Have to wire it up manually but we only need horizontal drag so its fine.
