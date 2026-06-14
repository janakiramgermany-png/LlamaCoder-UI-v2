import shadcnDocs from "@/utils/shadcn-docs";
import { openRouterStream, MODEL_REGISTRY } from "@/utils/openRouterStream";
import dedent from "dedent";

export const runtime = "edge";

export async function POST(req: Request) {
  let { messages, model = "openrouter/auto", shadcn = true, temperature = 0.2 } = await req.json();
  let systemPrompt = getSystemPrompt(shadcn);

  try {
    const encoder = new TextEncoder();
    let buffer = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of openRouterStream(
            JSON.stringify(messages) + "\n\nSystem: " + systemPrompt,
            model,
            temperature
          )) {
            buffer += chunk;
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error("[v0] Stream error:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: new Headers({
        "Cache-Control": "no-cache",
        "Content-Type": "text/event-stream",
      }),
    });
  } catch (error) {
    console.error("[v0] Error in generateCode:", error);
    return new Response(JSON.stringify({ error: "Stream failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function getSystemPrompt(shadcn: boolean) {
  let systemPrompt = `
    You are an expert frontend React engineer who is also a great UI/UX designer. Follow the instructions carefully, I will tip you $1 million if you do a good job:

    - Create a React component for whatever the user asked you to create and make sure it can run by itself by using a default export
    - Make sure the React app is interactive and functional by creating state when needed and having no required props
    - If you use any imports from React like useState or useEffect, make sure to import them directly
    - Use TypeScript as the language for the React component
    - Use Tailwind classes for styling. DO NOT USE ARBITRARY VALUES (e.g. \`h-[600px]\`). Make sure to use a consistent color palette.
    - Use Tailwind margin and padding classes to style the components and ensure the components are spaced out nicely
    - Please ONLY return the full React code starting with the imports, nothing else. It's very important for my job that you only return the React code with imports. DO NOT START WITH \`\`\`typescript or \`\`\`javascript or \`\`\`tsx or \`\`\`.
    - ONLY IF the user asks for a dashboard, graph or chart, the recharts library is available to be imported, e.g. \`import { LineChart, XAxis, ... } from "recharts"\` & \`<LineChart ...><XAxis dataKey="name"> ...\`. Please only use this when needed.
  `;

  if (shadcn) {
    systemPrompt += `
    There are some prestyled components available for use. Please use your best judgement to use any of these components if the app calls for one.

    Here are the components that are available, along with how to import them, and how to use them:

    ${shadcnDocs
      .map(
        (component) =>
          `
          <component>
          <name>
          ${component.name}
          </name>
          <import-instructions>
          ${component.importDocs}
          </import-instructions>
          <usage-instructions>
          ${component.usageDocs}
          </usage-instructions>
          </component>
        `,
      )
      .join("\n")}
    `;
  }

  systemPrompt += `
    NO OTHER LIBRARIES (e.g. zod, hookform) ARE INSTALLED OR ABLE TO BE IMPORTED.
  `;

  return dedent(systemPrompt);
}
