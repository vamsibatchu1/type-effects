# Type Effects Overview

This project focuses on implementing high-performance, aesthetically pleasing typography effects and animations.

## Current State
- Vite-based project structure.
- TypeScript support.
- Initial development environment.
- **Build System**: Verified. Successfully ran `npm run build` for a production-ready bundle.
- **Core Features**:
    - **Push Flow**: Clicking an interactive word triggers an image that expands from the right, dynamically reflowing the text in a smooth, spring-based motion.
    - **Gravity (Split)**: Clicking a 'trigger word' causes every character on the page to detach from its position and fall to the bottom of the screen with physics, rotation, and staggered delays.
    - **Kinetic Focus**: A vertical typography interaction where mouse movement triggers elastic gaps between text segments to reveal a dynamic "subject" word.

    - **Staggered Reset**: A dedicated reset button appears after gravity is triggered, allowing characters to fly back to their original positions in a reverse-staggered sequence.

- **UI Enhancements**:
    - **Type.Effects Branding**: A prominent `text-xl` project header in IBM Plex Mono featuring a thick 8px block cursor with an irregular, terminal-like blinking sequence.


- **Technical Architecture**:
    - **Modular Structure**: Each experiment is encapsulated in its own file within `src/effects/` (e.g., `1_push_flow.tsx`, `2_gravity.tsx`).
    - **Shared Components**: Typography logic, editorial layouts, and types are centralized in `src/components/` and `src/types.ts` for rapid prototyping of new effects.
    - **Scalability-Ready**: The system is designed to handle dozens of experiments by simply adding new components and sidebar entries.



## Upcoming Features
- [x] Build system integration.
- [ ] Aesthetic typography components.
- [ ] Performance optimizations for character-level animations.

