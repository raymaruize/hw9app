# Native iOS App Specification (Xcode-First)

## Goal
Build a real iOS app (React Native bare workflow, no Expo runtime dependency) that can be opened, built, and run directly from Xcode on iPhone or iOS Simulator.

The app recommends real classical Chinese poems using combined context:
- emotion text
- location
- environment feeling
- weather
- season/time
- holiday/lunar context (when available)

## Tech Direction (Required)
- React Native (bare / native iOS project)
- iOS build and run through Xcode
- CocoaPods for iOS dependencies
- Local persistence (AsyncStorage and/or SQLite)

## Core MVP Features
1. User enters context and requests recommendation.
2. Show one main poem + two alternatives.
3. User can save and delete poems.
4. Saved poems persist after app restart.
5. App builds and runs successfully in Xcode.

## Screens
- Context Input
- Match Result
- Saved Poems
- Settings (for optional AI provider config)

Navigation:
- Bottom tabs: Input, Saved, Settings
- Stack route: Input -> Result

## Data Models
### ContextProfile
- emotion_text: string
- city_or_location: string
- environment_style: string
- weather: string
- season: string
- time_of_day: string
- date_context?: string
- lunar_date_or_festival?: string

### MatchResult
- line_text: string
- title: string
- author: string
- dynasty: string
- match_reason: string
- modern_explanation: string
- confidence: number
- popularity_score: number
- alternatives: string[]

### SavedPoem
- id: string
- line_text: string
- title: string
- author: string
- dynasty: string
- short_reason: string
- saved_at: string
- context_snapshot: object

## API Contract (MVP)
Endpoint:
- POST /api/v1/match

Request required fields:
- emotion_text
- city_or_location
- environment_style
- weather
- season
- time_of_day

Optional fields:
- date_context
- lunar_date_or_festival
- holiday_flag

Response:
- line_text, title, author, dynasty
- match_reason, modern_explanation
- confidence, popularity_score
- alternatives (target length: 2)

## Matching Rules
- Use full context, not emotion-only.
- Include popularity as a tie-breaker, not a hard override.
- Prefer real poems only (no generated fake poems).

## iOS Build Requirements (Non-Negotiable)
- Project contains a valid ios/ Xcode workspace.
- `pod install` succeeds.
- App builds in Xcode without Expo-specific runtime tooling.
- App launches on iPhone or iOS Simulator.

## Offline and Error Behavior
- If location/weather/calendar is unavailable, allow manual input.
- If AI mode fails, fallback to local/backend matching.
- Saved poems remain available offline.
- Show recoverable error UI for network failures.

## Constraints
- iOS-first delivery.
- No Expo-dependent app flow required to run the app.
- Do not leak API keys in logs.
- Do not block app usage when permissions are denied.

## Build Order
1. Ensure native iOS build works in Xcode first.
2. Implement navigation and 3 core screens.
3. Implement context form + validation.
4. Implement match result rendering.
5. Implement save/delete + persistence.
6. Add location permission flow + manual fallback.
7. Wire `/api/v1/match` + error handling.
8. Add Settings and optional AI path.
9. Final iOS testing on simulator and device.

## Definition of Done
- App opens and runs from Xcode.
- User can input context and get a recommendation.
- User can save/remove poems.
- Saved poems persist after restart.
- Permission denied path works.
- Network failure path is handled without crash.
