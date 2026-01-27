# Swipe to Buy

## Goal
Make a swipe button that only triggers on a real drag. Dont want taps to accidentally buy.

## How it should work
1. User opens order sheet
2. Drags the thumb to the right
3. Gets past 90% of the track
4. Purchase goes through, toast shows, sheet closes

## Things that could go wrong
- GestureController might clash with the modal drag to close
- If we measure bounds before modal is laid out we get 0 for maxX
- Taps could count as drag end if were not careful
- Might behave different on android vs ios

## Plan
Use GestureController to track drag on the thumb:
- Need 90% to complete
- Require at least 3px movement before counting as drag (stops accidental taps)
- Recalc bounds on drag start and resize
- Track idle/dragging/locked states
- 200ms animation on reset

## Result
Going with GestureController. Works well with Ionic and we can tell drags from taps.
