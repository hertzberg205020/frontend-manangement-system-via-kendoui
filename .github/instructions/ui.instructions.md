---
applyTo: '**'
---

# KendoReact UI Development Instructions (2025)

_Last updated: January 2026_

- Always use the `mcp_kendo-react-a_kendo_react_assistant` tool or `fetch` tool to look up the latest component usage, install name, and best practices directly from the official KendoReact documentation.
- Official Documentation: https://www.telerik.com/kendo-react-ui/components/
- Do not rely on what you think you know about KendoReact components, as they are frequently updated. Your training data is outdated.
- For any KendoReact component, CLI command, or usage pattern, consult the docs first.

**Core Principles:**
- **Library Model:** KendoReact is a commercial component library distributed via npm packages. Unlike open-source copy-paste libraries (like shadcn/ui), you consume these as dependencies.
- **Component Installation:** Use npm/pnpm to add specific component packages as needed.
  - Example: `pnpm add @progress/kendo-react-grid @progress/kendo-data-query @progress/kendo-react-inputs`
- **Imports:** Always import named exports from the specific KendoReact package.
  - Correct: `import { Grid, GridColumn } from '@progress/kendo-react-grid';`
- **Styling & Assets:**
  - Ensure a Kendo theme is installed (e.g., `@progress/kendo-theme-default`) and imported globally in `main.tsx`.
  - Use SVG icons from `@progress/kendo-svg-icons` and the `SvgIcon` component.
- **Licensing:** KendoReact requires a license key. Ensure the license is properly activated in the project root if running commercially.

**Summary:**
> For all KendoReact work, always use the assistant tool or fetch the official documentation from https://www.telerik.com/kendo-react-ui/components/. Do not rely on static instructions or hallucinations about API props.
