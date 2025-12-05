# Neural Search (Extension 985)

## Description
An experimental extension that uses neural network-inspired algorithms to understand your search intent and provide smarter, context-aware search results across multiple search engines simultaneously.

## Features
- **Intent Recognition**: Analyzes your search queries to understand the underlying intent (informational, navigational, transactional).
- **Multi-Engine Search**: Queries multiple search engines in parallel and aggregates the best results.
- **Semantic Matching**: Uses word embeddings to find semantically related results beyond keyword matching.
- **Search History Learning**: Learns from your search patterns to improve future result relevance.
- **Quick Preview**: Hover over results to see AI-generated summaries without leaving the page.

## Permissions
- `activeTab`: Required to inject search enhancements into search engine pages.
- `storage`: To save search preferences and learning data.
- `webRequest`: To intercept and enhance search queries.
