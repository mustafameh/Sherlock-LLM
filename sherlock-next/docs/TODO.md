# Agent Sherlock — Feature Tracker

## Completed

- Next.js App Router project with TypeScript
- Design system (CSS variables, typography, responsive layout)
- Landing page with mode selection (Interactive Storytelling + Character Roleplay)
- Character Roleplay mode (ReAct agent, deep reasoning toggle, tool system)
- Interactive Storytelling mode (structured LLM output, scene-based viewer, chat bubbles)
- Story enhancements (chapters, mood theming, voice styles, custom/generated mysteries, PDF export)
- Batch scene processing with prefetch and decision frequency control
- Zen mode for continuous story flow
- Authentication (login/register, session cookies)
- MongoDB persistence (users, chats, stories)
- API key management (browser + encrypted server storage)
- OpenRouter integration with 429/400 fallback and system prompt folding
- Streaming SSE for story mode
- Profile info modal (avatar, display name, API key status)
- Server-side prompt management (YAML templates, Jinja-style renderer)
- Physical client/server/shared code separation with `server-only` enforcement
- Ownership checks on chat/story CRUD endpoints
- Shared UI components (ConfirmDeleteModal, ApiKeySection)

## Possible Future Work

- Advanced tool use or RAG integration
- Local model hosting (LoRA weights downloadable, GPU hosting needed)
- Markdown rendering in chat messages
- Evaluation dashboard comparing model outputs
