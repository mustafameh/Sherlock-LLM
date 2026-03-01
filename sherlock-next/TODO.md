# Sherlock-LLM Next.js — Feature Tracker

## ✅ Completed
- [x] Initialize Next.js project (TypeScript, App Router, ESLint)

## 🔨 In Progress
- [ ] Design system & globals (CSS variables, typography, layout)
- [ ] Core layout (Header, main grid)

## 📋 TODO — Chat System
- [ ] ChatWindow component (scrollable message area)
- [ ] ChatMessage component (user/assistant bubbles)
- [ ] ChatInput component (textarea + send button)
- [ ] ChatControls component (Start New + Save Chat)
- [ ] LoadingIndicator component (contemplating animation)
- [ ] System prompt generation (character-aware)
- [ ] Enter-to-send / Shift+Enter for newline

## 📋 TODO — Character System
- [ ] Character data types & default characters from characters.json
- [ ] CharacterSelector component (dropdown)
- [ ] CharacterModal component (create custom character)
- [ ] TraitInput component (tag-style add/remove)
- [ ] Character switching with confirmation
- [ ] Character-aware system prompt integration

## 📋 TODO — Model Configuration
- [ ] ModelSourceSelector (OpenRouter / Local toggle)
- [ ] OpenRouterSettings (model dropdown + API key + save/clear)
- [ ] LocalModelSettings (load/unload + status) — UI only, future-ready
- [ ] Temperature slider with live value
- [ ] API key localStorage management
- [ ] Model selection localStorage persistence

## 📋 TODO — Chat Persistence
- [ ] API route: GET/POST /api/chats
- [ ] API route: GET/PUT/DELETE /api/chats/[id]
- [ ] SavedChats component (carousel/list)
- [ ] SavedChatCard component
- [ ] Save current chat functionality
- [ ] Load chat functionality
- [ ] Delete chat with confirmation
- [ ] Start new chat with confirmation
- [ ] Auto-generate chat title

## 📋 TODO — Authentication
- [ ] Prisma schema (User + Chat models)
- [ ] NextAuth.js setup with credentials provider
- [ ] API route: POST /api/auth/register
- [ ] LoginForm page
- [ ] RegisterForm page
- [ ] UserMenu component (dropdown with logout)
- [ ] Auth-gated features (save/load/delete require login)

## 📋 TODO — ReAct Agent System
- [ ] Tool interface & ToolRegistry (`lib/tools/registry.ts`)
- [ ] ReAct agent loop in `/api/chat` (Think→Act→Observe→Respond)
- [ ] ReAct system prompt (format instructions for the LLM)
- [ ] ReasoningChain component (expandable thought chain)
- [ ] ThinkingStep component (styled deduction display)
- [ ] ToolCall component (shows tool name + args)
- [ ] ToolResult component (shows observation)
- [ ] Example placeholder tool (for testing the loop)

## 📋 TODO — Debug & TTS Hooks
- [ ] ApiDebugWindow component (show/hide raw API data)
- [ ] TTS service interface (abstract, future-ready)
- [ ] TTS play/pause buttons on assistant messages (disabled/placeholder)
- [ ] LocalModel service interface (abstract, future-ready)

## 📋 TODO — Settings Panel
- [ ] SettingsPanel layout (right sidebar)
- [ ] ContextInput component (context textarea)
- [ ] All settings integrated into panel

## 📋 TODO — Polish
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] ConfirmDialog component (reusable)
- [ ] Error handling & edge cases
- [ ] Final design review
