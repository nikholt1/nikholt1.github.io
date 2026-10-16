
---
headline: "Portfolio Refactor"
category: "Development"
date: "16-10-2026"
---

## Introduction

I've been working on rebuilding and refining my personal portfolio because the look and feel of the previous version didn't accurately reflect my development skills or the projects I've been working on. The new portfolio is designed as a Single Page Application (SPA), with a clean, dark interface and a focus on presenting my work, technical interests, and ongoing development.

The application is divided into three main sections: **Overview**, **Dev Log**, and **Reports**. The Overview presents my profile and development background, the Dev Log contains updates on what I'm currently working on, and Reports provides an overview of my projects.

Rather than loading an entirely new page whenever a section is selected, the application uses JavaScript to show and hide existing sections through CSS. This preserves the loaded content and application state while allowing navigation without a full page reload.

The portfolio also integrates external data through API requests, allowing it to display information dynamically rather than relying entirely on hardcoded content. To avoid unnecessary requests, the application initializes its data-loading functionality when needed and retains the results as users navigate between sections. This helps reduce redundant API calls and makes more efficient use of API rate limits.

## Technical Implementation

The application is built using HTML, CSS, and JavaScript, with separate JavaScript modules responsible for individual features. This modular structure keeps the code organized and makes it easier to maintain and extend the application.

External integrations provide dynamic information, while the Dev Log retrieves Markdown files from a GitHub repository and renders them as formatted posts. This allows me to publish development updates directly through GitHub without having to modify the portfolio's HTML every time I write a new post.

The SPA navigation, modular initialization, and CSS-based visibility management work together to keep the application responsive while minimizing repeated initialization and data retrieval.

## Next Steps

One potential improvement is to introduce a build process that retrieves and packages external data ahead of time, where appropriate. Instead of requesting the same information from external APIs on every browser refresh, selected data could be fetched during the build process and distributed as part of the web application.

This could reduce runtime API requests, improve initial loading performance, and make the portfolio less dependent on external API availability and rate limits.

Further improvements could include better caching strategies, more efficient data updates, and additional visualizations or integrations that provide a clearer overview of my projects and ongoing development.
