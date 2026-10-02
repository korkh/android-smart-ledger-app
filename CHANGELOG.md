# Changelog

All notable changes to the Smart Ledger project will be documented in this file.

## [1.0.1(4)] - 2026-10-02
### Added
- **Home Organizer:** Added comprehensive structural home management module to track rooms, floors, dimensions, and exact sizes of windows and doors.
- **Family Sizes & Clothing Tracking:** Implemented a dedicated family module to manage family members' clothing sizes, shoe sizes, heights, and custom notes.
- **Item Bindings (Rooms & Family):** Integrated compact, collapsible accordion sections in `AddItemTab` to easily link purchased items, materials, or clothing to specific rooms or family members.

### Improved
- **UI/UX Form Optimization:** Streamlined the `AddItemTab` layout by grouping all primary core input fields at the top, while moving subcategories, family members, and room bindings into clean, collapsible bottom cards to eliminate vertical clutter.
- **Settings Screen Refactoring:** Redesigned the Settings layout to cleanly separate existing lists (rooms, family members, vehicles, categories) from their respective creation forms.

## [1.0.1] - 2026-09-30
### Added
- **Barcode Scanner:** Integrated device camera scanner for instant EAN/UPC barcode and OEM code entry.
- **Quick Category Creation:** Added inline category creation directly inside the `AddItemTab` for smoother onboarding.
- **Account Deletion:** Implemented user account deletion via Firebase Auth along with local `AsyncStorage` clearing in settings.
- **Multi-source Lookup:** Expanded barcode product lookup to support regional and universal registries.

### Improved
- **Localization:** Updated and verified full translation coverage for English (`en`), Norwegian (`no`), and Russian (`ru`).
- **UI/UX:** Enhanced theme colors, input behaviors, and keyboard handling on authentication and settings screens.

## [1.0.0] - 2026-09-30
### Added
- Initial release of Smart Ledger published to Google Play Closed Testing track.
- Core self-hosted inventory management, vehicle garage tracking, and CSV import/export features.
- Local data architecture and secure user authentication via Firebase.
