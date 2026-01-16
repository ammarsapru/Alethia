# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- **Data Handling Robustness**: Resolved multiple `TypeError` crashes by refactoring the results rendering. The application now provides safe default values (e.g., empty objects or arrays) for potentially missing data from the API response (`knowledge_graph`, `bias_percentages`, `source_clusters`), ensuring components do not fail on partial data.

### Changed
- **Live API Integration**: The application now fetches analysis results from the live backend API (`http://127.0.0.1:8000/search/image`) instead of using mock data.
- **Type Safety**: Introduced a `types.ts` file with an `APIResult` interface to ensure type safety for the API response data.
- **Image URL Handling**: Added logic to correctly resolve the `image_url` from the API, prepending the backend address if necessary.

### Added
- **Top Bar**: Introduced a new `TopBar` component that appears on scroll-up and hides on scroll-down on the results page. It contains the application logo, name, and a user icon placeholder.
- **Continuous Page Layout**: The results view now uses a single, continuous page layout instead of individual cards. Content is organized into sections with clear headings (`Image & Summary`, `Knowledge Graph`, `Bias`, `Sources`).

### Changed
- **Results Page Redesign**: Replaced the card-based UI with a two-column, section-based layout for improved readability and information hierarchy.
- **Styling**: Updated component styling to match the new continuous page layout, including adding background containers for the "Bias" and "Sources" sections to maintain visual separation.
- **Layout Restructure**: The main grid for results was changed from a 5-column and then a 3-column card layout to a more robust 3-column grid where main content spans two columns and the sidebar spans one.

### Removed
- **Card Component Usage**: Removed the `Card` component wrappers from the results page (`page.tsx`) in favor of `<section>` elements.

## Backend Changes
- Updated `describe_image.py` to use `gemini-2.0-flash`.
- Updated `search.py` to fix `total_matches` logic and increase timeout.
- Updated `handle_serp_response.py` to correctly parse the nested JSON structure from the Wayback Machine API to extract timestamps.
- Limited Wayback Machine checks to the top 5 links to improve performance and prevent timeouts.
- Fixed Wayback Machine integration by correctly parsing the API response structure.
- Optimized performance by limiting historical date checks to the top 5 results.

## Frontend Changes
- Added `handleReset` function to clear application state.
- Added a floating "Plus" button to the results view to allow users to upload a new image without refreshing the page.
