# Source Directory Structure

This directory (`src`) contains the core source code for the application.

- **/api**: Contains all API-related logic, such as Axios instances, and endpoint definitions.
- **/components**: Contains reusable UI components.
  - **/ui**: General-purpose UI components (e.g., Button, Modal, Card).
  - **/features**: Components specific to certain features (e.g., StreamCard, ChatBox).
- **/hooks**: Custom React hooks for shared logic (e.g., `useAuth`, `useStream`).
- **/pages**: Page-level components that represent different views/routes of the application (e.g., Login, StreamDetail, Dashboard).
- **/state**: Global state management stores, likely using Zustand (e.g., `authStore`, `streamStore`).
- **/utils**: Utility functions used across the application (e.g., `formatDate`, `handleError`).
- **/assets**: Static assets like images, fonts, etc.
- **/routes**: Application routing configuration. 