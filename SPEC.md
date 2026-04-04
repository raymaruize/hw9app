# App Specification

## Overview
I want to build a real iOS app with React Native + Expo.

The app recommends real classical Chinese poems based on the user’s current situation, not only mood text.

It should use these inputs together: mood, location, environment feeling, weather, season/time, and holiday/lunar info when available.

Main target: run on my own iPhone. If needed, I can demo on iOS Simulator.

## Core Features
- Poem recommendation based on:
  - emotion text
  - location and environment info
  - weather
  - season and time of day
  - holiday/lunar context
- Multi-screen flow:
  - Context Input screen
  - Match Result screen
  - Saved Poems screen
  - API Settings screen (optional AI provider)
- Popularity ranking: when two results are similarly relevant, prefer well-known poems
- Optional AI recommendation; if it fails, use local ranking
- Local save for poems and settings

## MVP Scope (Build This First)
1. User enters context and requests one recommendation.
2. Show one main result + two alternatives.
3. User can save and delete poems in Saved Poems.
4. Saved poems persist after app restart.
5. App runs end-to-end on iPhone (or simulator fallback).

## Extended Scope (Only if MVP is stable)
- AI provider settings screen and external AI recommendation path.
- Holiday/lunar enrichment from external service.
- Better visual polish and animations.

## User Roles
| Role | Description | Permissions |
|------|-------------|-------------|
| User | App user | Enter context, request matches, save/delete poems, edit API settings |

## Screens & Navigation
| Screen | Purpose | Navigation |
|--------|---------|------------|
| Context Input | Collect emotion and context (auto or manual) | Start here, then go to Match Result |
| Match Result | Show poem, reason, and alternatives | From Input, then can save and go to Saved Poems |
| Saved Poems | View and remove saved poems | Can return to main flow |
| API Settings | Configure provider/base URL/model/API key | Accessible from main app settings |

Navigation plan:
- Bottom tabs: Input, Saved Poems, Settings
- Stack flow: Input -> Result

## Data Model
### ContextProfile
- emotion_text: string
- city_or_location: string
- environment_style: string
- weather: string
- season: string
- time_of_day: string
- date_context: string
- lunar_date_or_festival: string

### MatchInformation
- geo_mode: china_region or global_landscape
- nearby_regions: string[]
- landscapes: string[]
- popularity_weight: number

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

### AIProviderConfig
- provider_name: string
- base_url: string
- model_name: string
- api_key: string (stored securely)
- is_enabled: boolean

## API & Backend
- **Authentication:** Not required for MVP unless protected endpoint is used.
- **Database:**
  - Local SQLite database for poem data, saved poems, and settings
  - Suggested file name: `poetry_companion.db`
  - Poem records include: title, author, dynasty, full_text, source_collection, optional tags
  - Saved poems and settings are stored locally and survive restart
  - Seed source can come from `chinese-poetry` JSON files
- **Third-party APIs:**
  - location service (permission-based)
  - weather API
  - festival/lunar calendar lookup
  - AI recommendation API (OpenAI/Claude-compatible endpoint)

### Endpoint Contract (for one-pass build)
Use one backend route for MVP:
- `POST /api/v1/match`

Request body (MVP):
- `emotion_text`
- `city_or_location`
- `environment_style`
- `weather`
- `season`
- `time_of_day`

Optional request fields:
- `date_context`
- `lunar_date_or_festival`
- `holiday_flag`

Response body:
- `line_text`, `title`, `author`, `dynasty`
- `match_reason`, `modern_explanation`
- `confidence`, `popularity_score`
- `alternatives` (array, target length = 2)

If AI mode is enabled:
- app can call an AI endpoint first
- on timeout/error/invalid response, fallback to `/api/v1/match`

## Design & Branding
- **Color palette:** calm ink tones and warm accent color
- **Typography:** system font, clean and readable
- **Style direction:** simple, calm, and readable

## Platform Targets
- [x] iOS
- [ ] Android
- [ ] Web

## Notifications & Background Tasks
Not required for MVP.

## Offline Behavior
- If location/weather/calendar APIs are unavailable, user can enter context manually.
- If AI API fails, app falls back to local matching.
- Saved poems remain available offline.

If backend is offline, show a clear error and keep user input for retry.

## Analytics & Monitoring
Not required for MVP. Basic error logging only, without exposing API keys.

## Constraints & Non-Goals
- Must be an Expo project runnable with `npm install` and `npx expo start`.
- Must be demoable on iPhone or iOS Simulator.
- Do not generate fake poems.
- Do not rely on emotion-only matching.
- Do not block user flow when permission is denied.
- Do not over-prioritize popularity when context fit is clearly weaker.
- Do not leak API keys in logs.
- Do not block release on stretch features.

## Build Order (Agent Execution Plan)
1. Create a fresh Expo iOS project and verify it starts.
2. Add navigation (tabs + result stack route).
3. Implement Context Input screen with validation.
4. Implement Match Result screen and render response fields.
5. Implement Saved Poems screen with add/delete.
6. Add AsyncStorage persistence for saved poems.
7. Add location permission flow + manual fallback.
8. Wire `/api/v1/match` and end-to-end error handling.
9. Add Settings screen and optional AI mode flag.
10. Add AI path only if steps 1-9 are stable.
11. Final iOS testing and UI polish.

## Definition of Done
- I can open the app on iPhone (or iOS Simulator fallback).
- I can enter context and get a poem result.
- I can save/remove poems.
- Saved poems still exist after app restart.
- At least 3 screens are working with clean navigation.
- Error states are handled without crashing.

## Acceptance Criteria
- App has at least 2 screens with navigation (implemented as 3+ screens including Saved Poems).
- App uses full context (emotion + season + weather + location + environment + time + calendar when available).
- App handles permission allow/deny correctly with manual fallback.
- App supports China-nearby regional matching and non-China landscape matching.
- Ranking includes popularity weight as tie-break preference.
- App can optionally use AI API recommendation with safe fallback.
- App persists saved poems across app restarts.
- UI appears intentional and readable.

## QA Checklist (Before Submission)
- Test valid flow from Input -> Result -> Save -> Saved Poems.
- Test deny location permission path.
- Test network failure path.
- Test app restart persistence.
- Test one low-confidence case and verify alternatives show.
- Confirm no API key is printed in logs.
