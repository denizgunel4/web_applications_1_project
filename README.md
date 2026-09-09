# Exam #3: "Treasure Hunt"
## Student: s364071 GUNEL DENIZ 

## React Client Application Routes

- Route `/`: page content and purpose
- Route `/something/:param`: page content and purpose, param specification
- ...

## API Server

- POST `/api/something`
  - request parameters and request body content
  - response body content
- GET `/api/something`
  - request parameters
  - response body content
- POST `/api/something`
  - request parameters and request body content
  - response body content
- ...

- POST `/api/sessions`
  - request parameters: none
  - request body content: username, password
  - response body content: req.user containing the authenticated user's userId and username

- GET `/api/sessions/current`
  - request parameters: none
  - response body content:
      - if authenticated -> the user's userId and username
      - otherwise -> { error: "Not authenticated" }

- DELETE `/api/sessions/current`
  - request parameters: none
  - response body content: 
      - successful logout -> none
      - failed logout -> { error: "Logout failed" }

- POST `/api/games`
  - request parameters: none
  - request body content: difficulty
  - response body content: gameId, difficulty, expiresAt, currentStep, the first clue's clueText and available locations' locationId and locationName

- POST `/api/games/current/answer`
  - request parameters: none
  - request body content: locationId
  - response body content:
      - for a correct non-final answer -> correct, gameStatus, currentStep, the selected location's locationId, locationName, x, y, the next clue's clueText
      - for an incorrect or expired game -> gameStatus, treasureCoins and all locations with their locationId, locationName, x, y and routeOrder
      - for a final correct answer -> correct, gameStatus, currentStep, treasureCoins and all locations with their locationId, locationName, x, y and routeOrder

- GET `/api/ranking`
  - request parameters: none
  - request body content: none
  - response body content: a list of users with their username and totalCoins, ordered by total coins from highest to lowest


## Database Tables

- Table `users` - contains userId username saltedPassword salt
- Table `locations` - contains locationId locationName
- Table `clues`- contains clueId clueText locationId
- Table `games`- contains gameId userId difficulty startedAt expiresAt treasureCoins gameStatus currentStep
- Table `gameLocations` - contains gameId locationId positionIndex routeOrder

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- username, password (plus any other requested info)
- username, password (plus any other requested info)

## Use of AI Tools
Briefly describe whether you used any AI tools (e.g., ChatGPT, GitHub Copilot, Claude) while working on this project, for which purposes (e.g., clarifying concepts, debugging, generating code), and how you verified or adapted their output.
If you did not use any AI tools, simply state so.
