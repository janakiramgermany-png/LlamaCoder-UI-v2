"use server";

import client from "@/lib/prisma";

export async function shareApp({
  generatedCode,
  prompt,
  model,
  title,
  description,
}: {
  generatedCode: string;
  prompt: string;
  model: string;
  title?: string;
  description?: string;
}) {
  // Create or update app
  let app = await client.generatedApp.create({
    data: {
      code: generatedCode,
      model: model,
      prompt: prompt,
      title: title || `App from: ${prompt.substring(0, 50)}`,
      description: description,
    },
  });

  // Create version record
  await client.appVersion.create({
    data: {
      appId: app.id,
      code: generatedCode,
      prompt: prompt,
      model: model,
    },
  });

  return app.id;
}
