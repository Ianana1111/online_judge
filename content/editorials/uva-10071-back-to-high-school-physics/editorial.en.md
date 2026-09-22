# Use the velocity at the middle of the interval

## Problem and constraints

An object moves with constant acceleration. Its velocity at time t is v; find its displacement from time zero to time 2t. Inputs satisfy −100 ≤ v ≤ 100 and 0 ≤ t ≤ 200. Read pairs until EOF. A zero pair is valid, and negative velocity can give negative displacement.

## Building the approach

At first, the problem appears to omit the initial velocity and acceleration. Instead of guessing either value, name them u and a and write the equations. The given observation says `v = u + at`. The requested displacement is `u(2t) + a(2t)²/2`, which simplifies to `2t(u + at) = 2tv`.

That cancellation is the key: the requested quantity depends only on the combination we already know. We do not need to recover u and a individually or assume the object starts from rest.

There is also a useful geometric interpretation. With constant acceleration, velocity changes linearly. Its average over an interval equals its value at the midpoint. The midpoint of [0, 2t] is t, so the average velocity is v and the displacement is that average multiplied by the duration 2t.

## Walkthrough

For v = 5 and t = 12, the duration is 24 and the displacement is 120. For v = −3 and t = 4, the answer is −24: the sign describes direction. For t = 0, the interval has zero duration and the answer is zero.

## Why it works

The constant-acceleration equations apply throughout the interval. Substituting the known equality `u + at = v` into the displacement formula yields `2tv` exactly. No additional assumption about the initial velocity is used.

## Complexity

O(1) time and extra space per pair. The result's absolute value is at most 40,000 under these bounds.

## Common mistakes

- Using t instead of 2t as the duration.
- Assuming the initial velocity must be zero.
- Taking an absolute value even though the question asks for displacement.
- Treating `0 0` as a terminator or expecting an initial case count.
