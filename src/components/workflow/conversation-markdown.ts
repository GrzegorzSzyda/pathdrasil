export const renderConversationMarkdown = (content: string): string =>
  content.replace(/```(?:md|markdown)\s*\n([\s\S]*?)\n?```/gi, '$1')
